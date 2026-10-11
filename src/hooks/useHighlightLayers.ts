/**
 * useHighlightLayers.ts — the two decorative highlight layers of a read-aloud
 * reading pane, extracted so Activity 1 (biography dossier) and Activity 4
 * (business email) share one implementation instead of drifting apart.
 *
 *   Layer 1 — sentence halo: one soft band per wrapped line of the sentence
 *             currently being spoken.
 *   Layer 2 — golden word pill: a highlighter stroke that glides word by word.
 *
 * Both are measured from real DOM rects *before paint* (`useLayoutEffect`), so
 * the layers never lag a frame behind the word they annotate. Nothing here
 * changes glyph metrics of in-flow text (no padding/border/font-weight), which is
 * what stops the paragraph from reflowing while the pill travels.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  contentOrigin,
  pillMotion,
  rectsToBoxes,
  type Box,
  type PreparedBlock,
} from '../utils/readingTokens';
import type { SpeechSnapshot } from '../utils/ttsPlayer';
import { ensureVisible } from '../utils/paneScroll';

/** Horizontal breathing room of the word pill, in px, on each side. */
const PILL_PAD_X = 3;
/** Pill height as a multiple of the font size: taller than the glyphs, shorter
 *  than the line box, so it reads as a highlighter stroke rather than a block. */
const PILL_HEIGHT_RATIO = 1.4;
const HALO_PAD_X = 6;
const HALO_PAD_Y = 3;

export interface PillState {
  blockId: number;
  /** Changes on every line-wrap so React remounts the pill and replays the
   *  landing animation instead of gliding diagonally across the paragraph. */
  key: number;
  snap: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface HaloState {
  blockId: number;
  boxes: Box[];
  /** True when the previous sentence had the same number of lines, so the
   *  bands may be transitioned instead of snapped. */
  morph: boolean;
}

export interface UseHighlightLayersOptions {
  prepared: PreparedBlock[];
  snapshot: SpeechSnapshot;
  highlightEnabled: boolean;
  /** Any value that changes glyph metrics (font size, zoom) — bump it to
   *  invalidate every cached measurement. */
  layoutKey?: unknown;
  /** The scrollport that must keep the word being spoken in view. */
  scrollerRef: RefObject<HTMLElement | null>;
}

export interface HighlightLayersApi {
  pill: PillState | null;
  halo: HaloState | null;
  /** Block currently being spoken, or null when the engine is idle. */
  activeBlockId: number | null;
  /** Character range of the word being spoken inside `activeBlockId` (-1 = none). */
  activeWordStart: number;
  activeWordEnd: number;
  registerParaEl: (blockId: number, el: HTMLElement | null) => void;
  registerWordEl: (blockId: number, start: number, el: HTMLElement | null) => void;
}

export const useHighlightLayers = ({
  prepared,
  snapshot,
  highlightEnabled,
  layoutKey,
  scrollerRef,
}: UseHighlightLayersOptions): HighlightLayersApi => {
  const [pill, setPill] = useState<PillState | null>(null);
  const [halo, setHalo] = useState<HaloState | null>(null);
  /** Bumped by the ResizeObserver: any layout change invalidates measurements. */
  const [layoutTick, setLayoutTick] = useState(0);

  const paraRefs = useRef<Map<number, HTMLElement>>(new Map());
  /** blockId → (word start offset → span), so measuring never queries the DOM. */
  const wordEls = useRef<Map<number, Map<number, HTMLElement>>>(new Map());
  /** Paragraph-relative line top of the last measured word (wrap detection). */
  const lastWordLineRef = useRef<{ blockId: number; top: number } | null>(null);
  const snapSeqRef = useRef(0);

  const registerParaEl = useCallback((blockId: number, el: HTMLElement | null) => {
    if (el) paraRefs.current.set(blockId, el);
    else paraRefs.current.delete(blockId);
  }, []);

  const registerWordEl = useCallback((blockId: number, start: number, el: HTMLElement | null) => {
    let map = wordEls.current.get(blockId);
    if (!map) {
      map = new Map<number, HTMLElement>();
      wordEls.current.set(blockId, map);
    }
    if (el) map.set(start, el);
    else map.delete(start);
  }, []);

  useEffect(() => {
    const pane = scrollerRef.current;
    if (!pane) return;
    const observer = new ResizeObserver(() => setLayoutTick((tick) => tick + 1));
    observer.observe(pane);
    return () => observer.disconnect();
  }, [scrollerRef]);

  const activeBlockId = snapshot.status === 'idle' ? null : snapshot.blockId;
  const activeWordStart = snapshot.wordStart;
  const activeWordEnd = snapshot.wordEnd;

  /* ── Layer 2: the golden word pill, measured before paint ── */
  useLayoutEffect(() => {
    if (!highlightEnabled || activeBlockId === null || activeWordStart < 0) {
      lastWordLineRef.current = null;
      setPill(null);
      return;
    }
    const paraEl = paraRefs.current.get(activeBlockId);
    const wordEl = wordEls.current.get(activeBlockId)?.get(activeWordStart);
    if (!paraEl || !wordEl) return;

    const origin = contentOrigin(paraEl);
    const fontPx = Number.parseFloat(window.getComputedStyle(paraEl).fontSize) || 16;
    // `boxes[0]` is the first line fragment. An inline span that wraps (a very
    // long word) would otherwise report a union rect spanning two lines.
    const [wordBox] = rectsToBoxes([wordEl], origin, {
      padX: PILL_PAD_X,
      padY: 0,
      lineTolerance: 4,
      joinGap: 0,
    });
    if (!wordBox) return;

    const height = Math.round(fontPx * PILL_HEIGHT_RATIO);
    // A new visual line (or paragraph) must not interpolate the transform: the
    // straight path from the end of line 1 to the start of line 2 would streak
    // diagonally across the paragraph. `pillMotion` owns that decision.
    const motion = pillMotion(lastWordLineRef.current, { blockId: activeBlockId, top: wordBox.top }, fontPx);
    const snap = motion !== 'glide';
    lastWordLineRef.current = { blockId: activeBlockId, top: wordBox.top };
    if (snap) snapSeqRef.current += 1;

    setPill({
      blockId: activeBlockId,
      key: snapSeqRef.current,
      snap,
      left: wordBox.left,
      top: wordBox.top + wordBox.height / 2 - height / 2,
      width: wordBox.width,
      height,
    });
  }, [activeBlockId, activeWordStart, highlightEnabled, layoutKey, layoutTick]);

  /* ── Layer 1: the sentence halo, one soft band per wrapped line ── */
  useLayoutEffect(() => {
    if (!highlightEnabled || activeBlockId === null || snapshot.sentenceIndex < 0) {
      setHalo(null);
      return;
    }
    const block = prepared[snapshot.blockIndex];
    const sentence = block?.id === activeBlockId ? block.sentences[snapshot.sentenceIndex] : undefined;
    const paraEl = paraRefs.current.get(activeBlockId);
    const map = wordEls.current.get(activeBlockId);
    if (!sentence || !paraEl || !map) return;

    const sentenceWordEls: HTMLElement[] = [];
    for (const word of sentence.words) {
      const el = map.get(word.start);
      if (el) sentenceWordEls.push(el);
    }
    if (!sentenceWordEls.length) {
      setHalo(null);
      return;
    }

    const fontPx = Number.parseFloat(window.getComputedStyle(paraEl).fontSize) || 16;
    const boxes = rectsToBoxes(sentenceWordEls, contentOrigin(paraEl), {
      padX: HALO_PAD_X,
      padY: HALO_PAD_Y,
      // Rects within ~0.6em vertically are the same line; words closer than
      // ~0.5em apart horizontally join into one band (that is what makes the
      // spaces *inside* a sentence highlighted but not the trailing slack).
      lineTolerance: fontPx * 0.6,
      joinGap: fontPx * 0.5,
    });

    setHalo((previous) => ({
      blockId: activeBlockId,
      boxes,
      morph:
        previous !== null &&
        previous.blockId === activeBlockId &&
        boxes.length > 0 &&
        previous.boxes.length === boxes.length,
    }));
  }, [
    activeBlockId,
    snapshot.blockIndex,
    snapshot.sentenceIndex,
    highlightEnabled,
    layoutKey,
    layoutTick,
    prepared,
  ]);

  /* Keep the word being spoken inside the pane. */
  useLayoutEffect(() => {
    const pane = scrollerRef.current;
    if (!pane || activeBlockId === null || activeWordStart < 0) return;
    const wordEl = wordEls.current.get(activeBlockId)?.get(activeWordStart);
    if (wordEl) ensureVisible(pane, wordEl);
  }, [scrollerRef, activeBlockId, activeWordStart]);

  return {
    pill,
    halo,
    activeBlockId,
    activeWordStart,
    activeWordEnd,
    registerParaEl,
    registerWordEl,
  };
};
