/**
 * useSpeechPlayer.ts — React glue around the `SpeechPlayer` engine.
 *
 * Keeps the engine (imperative, DOM-ish, long-lived) out of render:
 *  - one instance per component, created after mount (SSR-safe),
 *  - snapshots land in state, so the component re-renders only when the engine
 *    actually has something new to show (~3–5 Hz while reading, not 60),
 *  - the playback speed is a user preference and survives reloads.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_SPEECH_RATE,
  isSpeechRate,
  SpeechPlayer,
  type SpeechSnapshot,
} from '../utils/ttsPlayer';
import { isSpeechSupported, primeVoices } from '../utils/speech';
import type { PreparedBlock } from '../utils/readingTokens';

const RATE_STORAGE_KEY = 'en411_speech_rate';

const INITIAL_SNAPSHOT: SpeechSnapshot = {
  status: 'idle',
  blockId: null,
  blockIndex: -1,
  sentenceIndex: -1,
  sentenceCount: 0,
  wordStart: -1,
  wordEnd: -1,
  rate: DEFAULT_SPEECH_RATE,
};

const readStoredRate = (): number => {
  if (typeof window === 'undefined') return DEFAULT_SPEECH_RATE;
  try {
    const raw = window.localStorage.getItem(RATE_STORAGE_KEY);
    const stored = raw === null ? Number.NaN : Number(raw);
    return isSpeechRate(stored) ? stored : DEFAULT_SPEECH_RATE;
  } catch {
    return DEFAULT_SPEECH_RATE; // private mode / storage disabled
  }
};

export interface SpeechPlayerApi {
  snapshot: SpeechSnapshot;
  rate: number;
  setRate: (rate: number) => void;
  /** False when the browser has no speech synthesis at all. */
  supported: boolean;
  play: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  stop: () => void;
  skipSentence: (delta: number) => void;
  playFrom: (blockId: number, charIndex: number) => void;
}

export const useSpeechPlayer = (blocks: PreparedBlock[]): SpeechPlayerApi => {
  const [snapshot, setSnapshot] = useState<SpeechSnapshot>(INITIAL_SNAPSHOT);
  /**
   * Both of these are browser-only facts, so the *first* render must use the
   * same values a server render would produce: React does not patch attributes
   * that differ during hydration, which would otherwise leave the transport
   * buttons disabled for the rest of the session. The real values land in the
   * mount effect below.
   */
  const [rate, setRateState] = useState<number>(DEFAULT_SPEECH_RATE);
  const [supported, setSupported] = useState<boolean>(true);
  const engineRef = useRef<SpeechPlayer | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  /** Content fingerprint: `load()` must only run when the passage really changes. */
  const signature = useMemo(
    () => blocks.map((block) => `${block.id}:${block.text.length}`).join('|'),
    [blocks]
  );

  useEffect(() => {
    primeVoices(); // Chrome resolves voices asynchronously; ask early
    const storedRate = readStoredRate();
    setRateState(storedRate);
    setSupported(isSpeechSupported());
    const engine = new SpeechPlayer({
      onUpdate: (next) => setSnapshot(next),
      rate: storedRate,
    });
    engineRef.current = engine;
    engine.load(blocksRef.current);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.load(blocksRef.current);
  }, [signature]);

  const setRate = useCallback((next: number) => {
    const safe = isSpeechRate(next) ? next : DEFAULT_SPEECH_RATE;
    setRateState(safe);
    try {
      window.localStorage.setItem(RATE_STORAGE_KEY, String(safe));
    } catch {
      /* storage unavailable — the rate still applies for this session */
    }
    engineRef.current?.setRate(safe);
  }, []);

  const play = useCallback(() => engineRef.current?.play(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const toggle = useCallback(() => engineRef.current?.toggle(), []);
  const stop = useCallback(() => engineRef.current?.stop(), []);
  const skipSentence = useCallback((delta: number) => engineRef.current?.skipSentence(delta), []);
  const playFrom = useCallback(
    (blockId: number, charIndex: number) => engineRef.current?.playFrom(blockId, charIndex),
    []
  );

  return useMemo<SpeechPlayerApi>(
    () => ({ snapshot, rate, setRate, supported, play, pause, resume, toggle, stop, skipSentence, playFrom }),
    [snapshot, rate, setRate, supported, play, pause, resume, toggle, stop, skipSentence, playFrom]
  );
};