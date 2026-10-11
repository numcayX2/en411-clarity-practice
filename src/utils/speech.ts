/**
 * speech.ts — thin, robust wrapper around `window.speechSynthesis`.
 *
 * Two consumers:
 *  - `speakText()` : fire-and-forget one-liners ("Question 3. …") used by the
 *    activity panels. Unchanged signature, so no caller had to be touched.
 *  - `ttsPlayer.ts` : the passage reader, which needs queueing and word timing.
 *    It reuses the voice cache and the Chromium keep-alive defined here.
 *
 * Cross-browser lessons baked in below:
 *  1. Chromium silently stops an utterance after ~15 s unless `resume()` is
 *     called periodically → `startKeepAlive()`.
 *  2. Chrome loads voices asynchronously (`getVoices()` returns `[]` on the first
 *     call) → `primeVoices()` + a "voiceschanged" listener.
 *  3. A cancelled utterance does not always fire `onend` (Firefox) → the pending
 *     promise of a superseded utterance is settled explicitly, so `await
 *     speakText()` can never hang.
 *  4. Engines report boundaries that can span a whole clause → clamp to the
 *     single word run starting at `charIndex`.
 */

import { wordAtOffset } from './readingTokens';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onWord?: (charIndex: number, charLength: number, word: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function';

/* ─────────────────────────────── Voice picking ─────────────────────────────── */

/** Higher score wins; the order encodes how natural the voices sound. */
const VOICE_RANK: Record<string, number> = {
  natural: 6, neural: 6, premium: 5, enhanced: 5,
  google: 4, samantha: 3, jenny: 3, aria: 3, guy: 3, ryan: 3, libby: 3, sonia: 3,
};

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesPrimed = false;

const scoreVoice = (voice: SpeechSynthesisVoice): number => {
  if (!voice.lang.toLowerCase().startsWith('en')) return -1;
  const name = voice.name.toLowerCase();
  let score = 1;
  for (const key of Object.keys(VOICE_RANK)) {
    if (name.includes(key)) score = Math.max(score, VOICE_RANK[key]);
  }
  if (voice.localService) score += 0.5; // no network round-trip, no Chunked stall
  if (voice.default) score += 0.25;
  return score;
};

/** Best available English voice, cached. `null` when the browser has none yet. */
export const getNaturalVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // not loaded yet — call again later
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }
  cachedVoice = best;
  return best;
};

/**
 * Warm the voice list. Chrome fills it asynchronously and only after the page
 * has been interacted with on some platforms, so we re-resolve on the event.
 */
export const primeVoices = (): void => {
  if (!isSpeechSupported() || voicesPrimed) return;
  voicesPrimed = true;
  getNaturalVoice();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = null;
    getNaturalVoice();
  });
};

/* ──────────────────────────── Chromium keep-alive ──────────────────────────── */

const KEEP_ALIVE_MS = 8000;

let keepAliveTimer: number | null = null;
let keepAliveRefs = 0;

/**
 * Chromium pauses long utterances ~15 s in unless `resume()` is invoked. The call
 * is a documented no-op while not paused, so a cheap heartbeat is safe: it never
 * alters audible speech, it only prevents the stall. Reference-counted because
 * both `speakText` and the passage player may hold it at the same time.
 */
export const startKeepAlive = (): void => {
  if (!isSpeechSupported()) return;
  keepAliveRefs += 1;
  if (keepAliveTimer !== null) return;
  keepAliveTimer = window.setInterval(() => {
    const synth = window.speechSynthesis;
    if (!synth.speaking || synth.paused) return;
    try {
      synth.resume();
    } catch {
      /* engine refused — nothing else to do */
    }
  }, KEEP_ALIVE_MS);
};

export const stopKeepAlive = (): void => {
  keepAliveRefs = Math.max(0, keepAliveRefs - 1);
  if (keepAliveRefs > 0 || keepAliveTimer === null) return;
  window.clearInterval(keepAliveTimer);
  keepAliveTimer = null;
};

/* ─────────────────────────────── One-shot speak ────────────────────────────── */

/** Settles the promise of the utterance that is about to be replaced. */
let pendingResolve: (() => void) | null = null;

/**
 * Speak `text` once and resolve when it finishes (or when it is superseded).
 * Keeps the historical `(text, rate | options)` call shape.
 */
export const speakText = (text: string, rateOrOptions: number | SpeakOptions = 0.95): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  if (!isSpeechSupported()) {
    resolve();
    return promise;
  }
  const options: SpeakOptions = typeof rateOrOptions === 'number' ? { rate: rateOrOptions } : rateOrOptions;
  const synth = window.speechSynthesis;

  const previous = pendingResolve;
  pendingResolve = null;
  previous?.(); // superseded utterance never fires onend in Firefox → settle it here
  synth.cancel();

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    if (pendingResolve === finish) pendingResolve = null;
    stopKeepAlive();
    resolve();
  };
  pendingResolve = finish;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1;

  const voice = getNaturalVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => options.onStart?.();

  if (options.onWord) {
    utterance.onboundary = (event) => {
      if (event.name && event.name !== 'word') return;
      const from = event.charIndex;
      if (from < 0 || from >= text.length) return;
      const { text: word, length } = wordAtOffset(text, from);
      // A zero-length run means the engine pointed at whitespace: keep a
      // one-character highlight rather than collapsing to nothing.
      options.onWord?.(from, Math.max(1, length), word);
    };
  }

  utterance.onend = () => {
    options.onEnd?.();
    finish();
  };
  utterance.onerror = () => finish();

  startKeepAlive();
  try {
    synth.speak(utterance);
  } catch {
    finish();
  }

  return promise;
};

/** Cancel everything and settle any in-flight `speakText` promise. */
export const stopSpeech = (): void => {
  if (!isSpeechSupported()) return;
  const previous = pendingResolve;
  pendingResolve = null;
  previous?.();
  window.speechSynthesis.cancel();
};