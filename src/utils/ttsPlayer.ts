/**
 * ttsPlayer.ts — the passage read-aloud engine.
 *
 * Responsibilities
 *  - Speak a passage sentence by sentence (short utterances: they dodge most of
 *    the long-utterance stalls and give us natural skip/pause/rate granularity).
 *  - Report the active word as a character range, using the engine's
 *    `onboundary` events when they are trustworthy and an interpolated estimate
 *    when they are not (Firefox fires none, iOS Safari fires them erratically).
 *  - Support play / pause / resume, per-sentence skipping, click-to-read-from,
 *    and live rate changes.
 *
 * ── The timing model ────────────────────────────────────────────────────────
 * Every character costs `1 unit`; punctuation costs extra (see `buildUnits`).
 * Time to reach offset `i` is `units[i] × msPerUnit`.
 *
 *   estimate:  offsetAt(t) = largest i with units[i] ≤ (t − origin) / msPerUnit
 *
 * A real `onboundary` event gives a ground-truth pair (t, charIndex), which is
 * used twice:
 *   • re-anchor — `origin = t − units[charIndex] × msPerUnit`, so the estimate
 *     is exactly right at the last observed word (kills accumulated drift and
 *     absorbs engine start-up latency);
 *   • adapt — `msPerUnit` moves toward the observed `t / units[charIndex]` with
 *     an exponential moving average, so the interpolated pace converges to the
 *     actual voice even when the rate the engine uses differs from the rate asked
 *     for. Because the schedule itself is unit-based, neither step rebuilds it.
 *
 * The estimator only *emits* when the engine has been silent for
 * `BOUNDARY_GRACE_MS`, so on Chrome (boundaries every word) it never fights the
 * real events, while on Firefox it drives the highlight on its own.
 */

import {
  findSentenceIndexAt,
  offsetForElapsed,
  wordIndexAt,
  wordIndexAtOrAfter,
  type PreparedBlock,
} from './readingTokens';
import { getNaturalVoice, isSpeechSupported, startKeepAlive, stopKeepAlive } from './speech';

export type SpeechStatus = 'idle' | 'playing' | 'paused';

/** What changed in this snapshot — lets React skip work it does not need. */
export type SpeechChange = 'word' | 'sentence' | 'status';

export interface SpeechSnapshot {
  status: SpeechStatus;
  blockId: number | null;
  blockIndex: number;
  sentenceIndex: number;
  sentenceCount: number;
  /** Active word as absolute offsets in the block text; -1 when unknown. */
  wordStart: number;
  wordEnd: number;
  rate: number;
}

export const SPEECH_RATES = [0.8, 1, 1.2] as const;
export type SpeechRate = (typeof SPEECH_RATES)[number];
export const DEFAULT_SPEECH_RATE: SpeechRate = 1;

export const isSpeechRate = (value: unknown): value is SpeechRate =>
  typeof value === 'number' && (SPEECH_RATES as readonly number[]).includes(value);

/**
 * ~175 wpm × 5.8 characters per word ÷ 60 s ≈ 16.9 chars/s, i.e. ~59 ms per
 * speech unit at `rate = 1`. Only a starting guess: the EMA below replaces it
 * with the real pace after a couple of words.
 */
const MS_PER_UNIT = 59;
const MIN_MS_PER_UNIT = 14;
const MAX_MS_PER_UNIT = 260;
/** Weight of a fresh observation when adapting the pace. */
const ADAPT_ALPHA = 0.4;
/** While real boundaries arrive faster than this, the estimator stays quiet. */
const BOUNDARY_GRACE_MS = 300;
/** Estimator tick: 20 Hz is far finer than the fastest word cadence. */
const TICK_MS = 50;
/** How long to wait before trusting `pause()` actually paused the engine. */
const PAUSE_VERIFY_MS = 180;
/** If the engine neither speaks nor queues anything for this long, unblock. */
const STALL_GRACE_MS = 1200;

const clamp = (value: number, lo: number, hi: number): number =>
  value < lo ? lo : value > hi ? hi : value;

interface FlatSentence {
  blockIndex: number;
  sentenceIndex: number;
}

export interface SpeechPlayerOptions {
  onUpdate?: (snapshot: SpeechSnapshot, change: SpeechChange) => void;
  rate?: number;
}

export class SpeechPlayer {
  private blocks: PreparedBlock[] = [];
  /** Every spoken sentence of the passage, flattened for linear navigation. */
  private flat: FlatSentence[] = [];
  /** flat index of each sentence, per block: `flatByBlock[blockIndex][sentenceIndex]`. */
  private flatByBlock: number[][] = [];
  private onUpdate?: (snapshot: SpeechSnapshot, change: SpeechChange) => void;
  private synth: SpeechSynthesis | null = null;

  /**
   * The utterance the engine is currently running. Held so Chromium cannot
   * garbage-collect it mid-speech, and used as the *ownership token*: every
   * handler bails unless this field still points at its own utterance. That is
   * how a superseded, aborted or foreign-cancelled utterance gets neutralised.
   */
  private utterance: SpeechSynthesisUtterance | null = null;

  private status: SpeechStatus = 'idle';
  private rate: number = DEFAULT_SPEECH_RATE;

  private flatIdx = -1;
  private blockIndex = -1;
  private sentenceIndex = -1;
  private wordIndex = -1;

  /** Unit schedule of the active block (absolute offsets). */
  private units: number[] = [];
  private base = 0;
  private rangeEnd = 0;
  private msPerUnit = MS_PER_UNIT;
  /** Perf time that the estimate maps to `base`. */
  private originT = 0;
  private lastBoundaryAt = Number.NEGATIVE_INFINITY;
  private speakingSince = 0;
  private estimating = false;

  private paused = false;
  private pausedAt = 0;
  /** Word to re-speak when resuming after a cancel-based pause. */
  private resumeWord = -1;

  private ticker: number | null = null;
  private pauseVerify: number | null = null;

  constructor(options: SpeechPlayerOptions = {}) {
    this.onUpdate = options.onUpdate;
    this.rate = isSpeechRate(options.rate) ? options.rate : DEFAULT_SPEECH_RATE;
    this.synth = isSpeechSupported() ? window.speechSynthesis : null;
  }

  /* ─────────────────────────────── Public API ─────────────────────────────── */

  /** Swap the content. Stops playback: never keep reading a stale passage. */
  load(blocks: PreparedBlock[]): void {
    this.abort();
    this.blocks = blocks;
    this.flat = [];
    this.flatByBlock = [];
    blocks.forEach((block, blockIndex) => {
      const map: number[] = [];
      block.sentences.forEach((_sentence, sentenceIndex) => {
        map.push(this.flat.length);
        this.flat.push({ blockIndex, sentenceIndex });
      });
      this.flatByBlock.push(map);
    });
    this.resetPosition();
    this.setStatus('idle');
    this.emit('status');
  }

  getSnapshot(): SpeechSnapshot {
    const block = this.blocks[this.blockIndex];
    const sentence = block?.sentences[this.sentenceIndex];
    const word = sentence?.words[this.wordIndex];
    return {
      status: this.status,
      blockId: block ? block.id : null,
      blockIndex: block ? this.blockIndex : -1,
      sentenceIndex: sentence ? this.sentenceIndex : -1,
      sentenceCount: block ? block.sentences.length : 0,
      wordStart: word ? word.start : -1,
      wordEnd: word ? word.end : -1,
      rate: this.rate,
    };
  }

  play(): void {
    if (this.status === 'playing' || !this.synth) return;
    if (this.status === 'paused') {
      this.resume();
      return;
    }
    // Resume where we were if playback was stopped mid-passage, else from the top.
    this.begin(this.flatIdx >= 0 ? this.flatIdx : 0, this.wordIndex >= 0 ? this.wordIndex : 0);
  }

  pause(): void {
    if (this.status !== 'playing' || !this.synth) return;
    const synth = this.synth;
    this.paused = true;
    this.pausedAt = performance.now();
    this.setKeepAlive(false);
    try {
      synth.pause();
    } catch {
      /* engine without pause() → handled by the verification below */
    }
    this.setStatus('paused');

    // iOS Safari (and some cloud voices) resolve `pause()` without pausing.
    // Verify shortly after: if the engine kept talking, fall back to a hard
    // cancel and re-speak the current word on resume.
    const owned = this.utterance;
    if (this.pauseVerify !== null) window.clearTimeout(this.pauseVerify);
    this.pauseVerify = window.setTimeout(() => {
      this.pauseVerify = null;
      if (this.utterance !== owned || this.status !== 'paused') return;
      if (synth.paused) return; // native pause honoured
      this.resumeWord = this.wordIndex;
      this.abort();
    }, PAUSE_VERIFY_MS);
  }

  resume(): void {
    if (this.status !== 'paused' || !this.synth) return;
    this.paused = false;
    if (this.resumeWord < 0) {
      // Native pause held: shift the estimate's time base by the paused span so
      // the highlight continues where it left off instead of jumping ahead.
      this.originT += performance.now() - this.pausedAt;
      this.setKeepAlive(true);
      this.setStatus('playing');
      try {
        this.synth.resume();
      } catch {
        /* nothing to resume */
      }
      return;
    }
    const word = this.resumeWord;
    this.resumeWord = -1;
    this.begin(this.flatIdx, word < 0 ? 0 : word);
  }

  toggle(): void {
    if (this.status === 'playing') this.pause();
    else if (this.status === 'paused') this.resume();
    else this.play();
  }

  stop(): void {
    this.abort();
    this.resetPosition();
    this.setStatus('idle');
    this.emit('status');
  }

  /** Move by whole sentences; also starts playback when nothing is running. */
  skipSentence(delta: number): void {
    if (!this.flat.length || !this.synth) return;
    const from = this.flatIdx >= 0 ? this.flatIdx : delta > 0 ? -1 : this.flat.length;
    this.begin(clamp(from + delta, 0, this.flat.length - 1), 0);
  }

  /** Start reading at `charIndex` inside the block with this id. */
  playFrom(blockId: number, charIndex: number): void {
    if (!this.synth) return;
    const blockIndex = this.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex < 0) return;
    const block = this.blocks[blockIndex];
    const sentenceIndex = findSentenceIndexAt(block.sentences, Math.max(0, charIndex));
    if (sentenceIndex < 0) return;
    const sentence = block.sentences[sentenceIndex];
    const wordIndex = wordIndexAtOrAfter(sentence.words, charIndex);
    const flatIdx = this.flatByBlock[blockIndex]?.[sentenceIndex] ?? -1;
    this.begin(flatIdx, Math.max(0, wordIndex));
  }

  /** Changing tempo mid-sentence restarts that word so the change is immediate. */
  setRate(rate: number): void {
    const next = isSpeechRate(rate) ? rate : DEFAULT_SPEECH_RATE;
    if (next === this.rate) return;
    this.rate = next;
    if (this.status === 'playing' && this.flatIdx >= 0) {
      this.begin(this.flatIdx, Math.max(0, this.wordIndex), true);
    } else {
      this.emit('status');
    }
  }

  destroy(): void {
    this.abort();
    this.blocks = [];
    this.flat = [];
    this.flatByBlock = [];
    this.onUpdate = undefined;
    this.resetPosition();
    this.status = 'idle';
  }

  /* ──────────────────────────── Queue navigation ──────────────────────────── */

  /**
   * Speak one sentence (or the tail of one, when the listener clicked a word in
   * the middle) starting at `wordIndex`, and publish the new position.
   */
  private begin(flatIdx: number, wordIndex: number, skipCancel = false): void {
    const entry = this.flat[flatIdx];
    const block = entry ? this.blocks[entry.blockIndex] : undefined;
    const sentence = block?.sentences[entry.sentenceIndex];
    if (!entry || !block || !sentence) {
      this.finish();
      return;
    }

    const word = sentence.words.length
      ? sentence.words[clamp(wordIndex, 0, sentence.words.length - 1)]
      : undefined;

    this.flatIdx = flatIdx;
    this.blockIndex = entry.blockIndex;
    this.sentenceIndex = entry.sentenceIndex;
    this.wordIndex = sentence.words.length ? clamp(wordIndex, 0, sentence.words.length - 1) : -1;

    this.speakRange(block, word ? word.start : sentence.start, sentence.end, skipCancel);
    this.emit('sentence'); // halo + screen-reader announcement are sentence-scoped
  }

  private advance(): void {
    // Advancing from `onend` means the engine is already idle — skipping the
    // cancel avoids a known Chromium race where cancel() swallows the next speak().
    this.begin(this.flatIdx + 1, 0, this.status === 'playing');
  }

  private finish(): void {
    this.abort();
    this.resetPosition();
    this.setStatus('idle');
    this.emit('status');
  }

  /* ──────────────────────────── Speech + estimate ──────────────────────────── */

  private speakRange(block: PreparedBlock, from: number, to: number, skipCancel = false): void {
    const synth = this.synth;
    if (!synth || to <= from) {
      this.finish();
      return;
    }
    if (!skipCancel) this.abort();
    else this.abort(false);

    const utterance = new SpeechSynthesisUtterance(block.text.slice(from, to));
    utterance.lang = 'en-US';
    utterance.rate = this.rate;
    utterance.pitch = 1;
    const voice = getNaturalVoice();
    if (voice) utterance.voice = voice;

    this.utterance = utterance;
    this.units = block.units;
    this.base = from;
    this.rangeEnd = to;
    this.originT = performance.now();
    this.speakingSince = this.originT;
    this.lastBoundaryAt = Number.NEGATIVE_INFINITY;
    this.estimating = true;
    this.startTicker();
    this.setKeepAlive(true);

    utterance.onstart = () => {
      if (this.utterance !== utterance) return;
      // The range always starts on a word boundary, so "now" is estimate zero.
      // This absorbs the engine's start-up latency (a big win on Firefox, where
      // the estimate is the only source of word timing).
      this.originT = performance.now();
    };

    utterance.onboundary = (event) => {
      if (this.utterance !== utterance) return;
      if (event.name && event.name !== 'word') return;
      this.onBoundary(event.charIndex);
    };

    utterance.onend = () => {
      if (this.utterance !== utterance) return;
      this.advance();
    };

    utterance.onerror = () => {
      // Reached only when this utterance is still the current one, i.e. we did
      // not abort it ourselves — so either the engine failed, or a foreign
      // caller cancelled global speech (`speakText` is shared with the activity
      // panels). Either way this range is dead: continue at the next sentence.
      if (this.utterance !== utterance) return;
      this.advance();
    };

    this.setStatus('playing');
    try {
      synth.speak(utterance);
    } catch {
      this.advance();
      return;
    }
    this.emit('word'); // show the first word immediately, don't wait for a boundary
  }

  /** Ground truth arrived: re-anchor the estimate and learn the real pace. */
  private onBoundary(relativeCharIndex: number): void {
    const block = this.blocks[this.blockIndex];
    const sentence = block?.sentences[this.sentenceIndex];
    if (!block || !sentence) return;

    const offset = clamp(this.base + relativeCharIndex, this.base, Math.max(this.base, this.rangeEnd - 1));
    const wordIndex = wordIndexAt(sentence.words, offset);
    if (wordIndex < 0) return;

    const now = performance.now();
    if (this.estimating) {
      const spokenUnits = block.units[offset] - block.units[this.base];
      const elapsed = now - this.originT;
      if (spokenUnits > 0 && elapsed > 30) {
        // Normalise to rate 1 so a later rate change keeps what we learned.
        const observed = (elapsed / spokenUnits) * this.rate;
        this.msPerUnit = clamp(
          this.msPerUnit * (1 - ADAPT_ALPHA) + observed * ADAPT_ALPHA,
          MIN_MS_PER_UNIT,
          MAX_MS_PER_UNIT
        );
      }
      this.originT = now - spokenUnits * this.msPerUnitNow();
      this.lastBoundaryAt = now;
    }

    if (wordIndex !== this.wordIndex) {
      this.wordIndex = wordIndex;
      this.emit('word');
    }
  }

  private tick(): void {
    const synth = this.synth;
    const block = this.blocks[this.blockIndex];
    const sentence = block?.sentences[this.sentenceIndex];
    if (!synth || !block || !sentence || !this.estimating) return;
    if (this.paused || this.status !== 'playing') return;

    const now = performance.now();

    // Watchdog: the engine holds neither a speaking nor a queued utterance, so
    // it will never fire `onend` (cold-start failure, dropped utterance, cloud
    // voice error). Move on instead of stalling the whole passage.
    if (!synth.speaking && !synth.pending && now - this.speakingSince > STALL_GRACE_MS) {
      this.advance();
      return;
    }

    // Real boundaries are flowing → let them own the highlight.
    if (now - this.lastBoundaryAt < BOUNDARY_GRACE_MS) return;

    const offset = offsetForElapsed(
      this.units,
      this.base,
      this.rangeEnd,
      this.msPerUnitNow(),
      now - this.originT
    );
    const wordIndex = wordIndexAt(sentence.words, offset);
    if (wordIndex >= 0 && wordIndex !== this.wordIndex) {
      this.wordIndex = wordIndex;
      this.emit('word');
    }
  }

  private msPerUnitNow(): number {
    return clamp(this.msPerUnit / this.rate, MIN_MS_PER_UNIT, MAX_MS_PER_UNIT);
  }

  /* ───────────────────────────── Housekeeping ────────────────────────────── */

  /**
   * Invalidate in-flight engine callbacks and clear the queue.
   *
   * Ownership is dropped *before* cancelling so the handlers see a stale
   * utterance and bail: some engines fire `onerror` synchronously from
   * `cancel()`, and that callback must not re-enter the queue.
   *
   * `cancelSynth: false` skips `speechSynthesis.cancel()`, which is both wasteful
   * and risky (Chromium can drop a queued utterance that follows a cancel).
   */
  private abort(cancelSynth = true): void {
    this.utterance = null;
    this.estimating = false;
    this.stopTicker();
    this.setKeepAlive(false);
    this.paused = false;
    this.resumeWord = -1;
    if (this.pauseVerify !== null) {
      window.clearTimeout(this.pauseVerify);
      this.pauseVerify = null;
    }
    if (cancelSynth && this.synth) {
      try {
        this.synth.cancel();
      } catch {
        /* ignore */
      }
    }
  }

  private resetPosition(): void {
    this.flatIdx = -1;
    this.blockIndex = -1;
    this.sentenceIndex = -1;
    this.wordIndex = -1;
  }

  private startTicker(): void {
    if (this.ticker !== null) return;
    this.ticker = window.setInterval(() => this.tick(), TICK_MS);
  }

  private stopTicker(): void {
    if (this.ticker === null) return;
    window.clearInterval(this.ticker);
    this.ticker = null;
  }

  private setKeepAlive(on: boolean): void {
    if (on) startKeepAlive();
    else stopKeepAlive();
  }

  private setStatus(status: SpeechStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.emit('status');
  }

  private emit(change: SpeechChange): void {
    this.onUpdate?.(this.getSnapshot(), change);
  }
}