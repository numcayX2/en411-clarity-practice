import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Highlighter,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { findQuoteRange } from '../utils/textHighlight';
import {
  contentOrigin,
  pillMotion,
  prepareBlock,
  rectsToBoxes,
  snapRangeToTokens,
  type Box,
  type PreparedBlock,
} from '../utils/readingTokens';
import { SPEECH_RATES, type SpeechRate } from '../utils/ttsPlayer';
import { useSpeechPlayer } from '../hooks/useSpeechPlayer';
import type { AudioPassageConfig } from '../data/marieCurieAudio';

interface Paragraph {
  id: number;
  text: string;
}

interface PassageViewerProps {
  title: string;
  subtitle?: string;
  paragraphs: Paragraph[];
  highlightQuote?: string | null;
  highlightParagraphId?: number | null;
  onClearHighlight?: () => void;
  audioTrack?: AudioPassageConfig;
}

type FontSize = 'sm' | 'base' | 'lg';

/** Shared with Activity4 — both panes mirror the same highlight preference. */
const HIGHLIGHT_STORAGE_KEY = 'en411_highlight_enabled';
const HIGHLIGHT_EVENT = 'en411_highlight_change';

const FONT_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-relaxed',
  base: 'text-base leading-relaxed',
  lg: 'text-lg leading-loose',
};

/** Horizontal breathing room of the word pill, in px, on each side. */
const PILL_PAD_X = 3;
/** Pill height as a multiple of the font size: taller than the glyphs, shorter
 *  than the line box, so it reads as a highlighter stroke rather than a block. */
const PILL_HEIGHT_RATIO = 1.4;
const HALO_PAD_X = 6;
const HALO_PAD_Y = 3;

interface PillState {
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

interface HaloState {
  blockId: number;
  boxes: Box[];
  /** True when the previous sentence had the same number of lines, so the
   *  bands may be transitioned instead of snapped. */
  morph: boolean;
}

const readStoredHighlight = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const saved = window.localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
};

/**
 * Scroll the passage pane just enough to reveal `el`.
 *
 * Deliberately not `scrollIntoView()`: Lenis owns window scrolling on this site
 * (see Layout.astro) and fights the browser's smooth scroll, while the passage
 * pane is its own scrollport — so we compute the delta ourselves.
 */
const ensureVisible = (scroller: HTMLElement, el: HTMLElement, margin = 18): void => {
  const pane = scroller.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
  if (rect.top < pane.top + margin) {
    scroller.scrollTo({ top: scroller.scrollTop + (rect.top - pane.top) - margin, behavior });
  } else if (rect.bottom > pane.bottom - margin) {
    scroller.scrollTo({ top: scroller.scrollTop + (rect.bottom - pane.bottom) + margin, behavior });
  }
};

export const PassageViewer: React.FC<PassageViewerProps> = ({
  title,
  subtitle,
  paragraphs,
  highlightQuote,
  highlightParagraphId,
  onClearHighlight,
  audioTrack,
}) => {
  const [fontSize, setFontSize] = useState<FontSize>('base');
  /** SSR-safe default; the persisted preference is applied after mount (below). */
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(true);
  const [pill, setPill] = useState<PillState | null>(null);
  const [halo, setHalo] = useState<HaloState | null>(null);
  /** Bumped by the ResizeObserver: any layout change invalidates measurements. */
  const [layoutTick, setLayoutTick] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  /** blockId → (word start offset → span), so measuring never queries the DOM. */
  const wordEls = useRef<Map<number, Map<number, HTMLElement>>>(new Map());
  const speedRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  /** Paragraph-relative line top of the last measured word (wrap detection). */
  const lastWordLineRef = useRef<{ blockId: number; top: number } | null>(null);
  const snapSeqRef = useRef(0);
  const enabledRef = useRef(highlightEnabled);
  enabledRef.current = highlightEnabled;

  const helpId = useId();

  /* ── Text analysis: tokens, sentences and the speech-unit schedule ── */
  const prepared = useMemo(
    () => paragraphs.map((paragraph) => prepareBlock(paragraph.id, paragraph.text)),
    [paragraphs]
  );
  const { snapshot, rate, setRate, supported, play, pause, resume, skipSentence, stop, playFrom } =
    useSpeechPlayer(prepared, { audioTrack });

  /* ── Evidence: quote → character range → whole-word range ── */
  const evidence = useMemo(
    () =>
      prepared.map((block) => {
        if (!highlightEnabled || !highlightQuote) return null;
        const range = findQuoteRange(block.text, highlightQuote);
        return range ? snapRangeToTokens(block.tokens, range.start, range.end) : null;
      }),
    [prepared, highlightQuote, highlightEnabled]
  );

  const toggleHighlight = useCallback(() => {
    setHighlightEnabled((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(HIGHLIGHT_STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      window.dispatchEvent(new CustomEvent<boolean>(HIGHLIGHT_EVENT, { detail: next }));
      return next;
    });
  }, []);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (detail !== undefined) setHighlightEnabled(detail);
    };
    window.addEventListener(HIGHLIGHT_EVENT, handleSync);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, handleSync);
  }, []);

  /**
   * The stored preference is applied *after* mount, not in the state initialiser:
   * the server cannot read localStorage, and React does not patch attribute
   * mismatches found during hydration — reading it early would leave the switch
   * showing a state the reader is not actually in.
   */
  useEffect(() => {
    setHighlightEnabled(readStoredHighlight());
  }, []);

  /**
   * "Locate in Story" forced highlighting on and jumped to the sentence.
   * The enabled state is read through a ref so turning the highlight *off* while
   * a quote is active cannot re-trigger this effect and fight the user.
   */
  useEffect(() => {
    if (!highlightQuote) return;
    if (!enabledRef.current) {
      setHighlightEnabled(true);
      try {
        window.localStorage.setItem(HIGHLIGHT_STORAGE_KEY, 'true');
      } catch {
        /* storage unavailable */
      }
    }
    const frame = window.requestAnimationFrame(() => {
      const scroller = containerRef.current;
      const anchor = scroller?.querySelector<HTMLElement>('[data-evidence-anchor]');
      if (scroller && anchor) ensureVisible(scroller, anchor, 48);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [highlightQuote, highlightParagraphId]);

  useEffect(() => {
    const pane = containerRef.current;
    if (!pane) return;
    const observer = new ResizeObserver(() => setLayoutTick((tick) => tick + 1));
    observer.observe(pane);
    return () => observer.disconnect();
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

  const activeBlockId = snapshot.status === 'idle' ? null : snapshot.blockId;
  const activeWordStart = snapshot.wordStart;

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
  }, [activeBlockId, activeWordStart, highlightEnabled, fontSize, layoutTick]);

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

    const wordElsOfSentence: HTMLElement[] = [];
    for (const word of sentence.words) {
      const el = map.get(word.start);
      if (el) wordElsOfSentence.push(el);
    }
    if (!wordElsOfSentence.length) {
      setHalo(null);
      return;
    }

    const fontPx = Number.parseFloat(window.getComputedStyle(paraEl).fontSize) || 16;
    const boxes = rectsToBoxes(wordElsOfSentence, contentOrigin(paraEl), {
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
    fontSize,
    layoutTick,
    prepared,
  ]);

  /* Keep the word being spoken inside the pane. */
  useLayoutEffect(() => {
    const pane = containerRef.current;
    if (!pane || activeBlockId === null || activeWordStart < 0) return;
    const wordEl = wordEls.current.get(activeBlockId)?.get(activeWordStart);
    if (wordEl) ensureVisible(pane, wordEl);
  }, [activeBlockId, activeWordStart]);

  /* ── Controls ── */

  const statusRef = useRef(snapshot.status);
  statusRef.current = snapshot.status;

  const handlePrimary = useCallback(() => {
    const status = statusRef.current;
    if (status === 'playing') pause();
    else if (status === 'paused') resume();
    else play();
  }, [pause, resume, play]);

  const handleRegionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Only when the pane itself owns focus — nested controls (speed radios,
    // transport buttons) must keep their own keyboard behaviour.
    if (event.target !== event.currentTarget) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault(); // space would otherwise scroll the pane
      handlePrimary();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      skipSentence(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      skipSentence(-1);
    }
  };

  const handlePassageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return; // the ¶ badge starts its own playback
    const paraEl = target.closest<HTMLElement>('[data-block-id]');
    if (!paraEl) return;
    const blockId = Number(paraEl.dataset.blockId);
    const wordEl = target.closest<HTMLElement>('[data-word]');
    // A click that ends a text selection should keep the selection, not start audio.
    const selection = window.getSelection();
    if (wordEl && selection && !selection.isCollapsed && selection.containsNode(wordEl, true)) return;
    playFrom(blockId, wordEl ? Number(wordEl.dataset.word) : 0);
  };

  const handleSpeedKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, option: SpeechRate) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault(); // radio-group convention: arrows move the selection
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const index = SPEECH_RATES.indexOf(option);
    const next = SPEECH_RATES[(index + step + SPEECH_RATES.length) % SPEECH_RATES.length];
    setRate(next);
    speedRefs.current.get(next)?.focus();
  };

  const cycleFontSize = (direction: 'up' | 'down') => {
    setFontSize((previous) => {
      if (direction === 'up') return previous === 'sm' ? 'base' : 'lg';
      return previous === 'lg' ? 'base' : 'sm';
    });
  };

  /* ── Announcement: sentence/state only, never per word ── */
  const liveText = useMemo(() => {
    if (snapshot.status === 'idle' || snapshot.blockId === null) return 'Reading stopped.';
    const where = `Paragraph ${snapshot.blockIndex + 1}, sentence ${snapshot.sentenceIndex + 1} of ${snapshot.sentenceCount}`;
    if (snapshot.status === 'paused') return `Reading paused. ${where}.`;
    return `Reading ${where} at ${rate.toFixed(1)} times speed.`;
  }, [
    snapshot.status,
    snapshot.blockId,
    snapshot.blockIndex,
    snapshot.sentenceIndex,
    snapshot.sentenceCount,
    rate,
  ]);

  /**
   * Render a paragraph as stable word spans.
   *
   * Key design decision: each word is its own `<span key={start}>` carrying its
   * absolute character offset, and the classes applied to it never change glyph
   * metrics (no font-weight, no padding, no border). Two payoffs:
   *  1. The active-word highlight cannot reflow the line — if it did, every word
   *     would shift while the pill is mid-transition toward the old position.
   *  2. The spans are stable across renders, so React updates one className per
   *     word instead of remounting the paragraph on every boundary event.
   */
  const renderBlock = (block: PreparedBlock, index: number): React.ReactNode[] => {
    const evidenceRange = evidence[index];
    const activeStart = activeBlockId === block.id ? activeWordStart : -1;
    const activeEnd = activeBlockId === block.id ? snapshot.wordEnd : -1;

    const nodes: React.ReactNode[] = [];
    let runKey = -1;
    let run: React.ReactNode[] = [];
    const flushRun = () => {
      if (runKey < 0) return;
      nodes.push(
        <mark key={`ev-${runKey}`} className="ev-run">
          {run}
        </mark>
      );
      runKey = -1;
      run = [];
    };

    for (const token of block.tokens) {
      const inEvidence =
        evidenceRange !== null && token.start >= evidenceRange.start && token.end <= evidenceRange.end;
      if (inEvidence && runKey < 0) runKey = token.start;
      if (!inEvidence && runKey >= 0) flushRun();

      let node: React.ReactNode;
      if (token.isWord) {
        const isActive = activeStart >= 0 && token.start >= activeStart && token.end <= activeEnd;
        const isEvidenceAnchor = evidenceRange !== null && token.start === evidenceRange.start;
        node = (
          <span
            key={token.start}
            ref={(el) => registerWordEl(block.id, token.start, el)}
            data-word={token.start}
            data-evidence-anchor={isEvidenceAnchor ? '' : undefined}
            className={isActive ? 'rv-word rv-word--active' : 'rv-word'}
          >
            {token.text}
          </span>
        );
      } else {
        node = token.text;
      }

      if (inEvidence) run.push(node);
      else nodes.push(node);
    }
    flushRun();
    return nodes;
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 overflow-hidden flex flex-col h-full shadow-xs">
      {/* Passage Header / Toolbar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-extrabold text-slate-900 leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {highlightQuote && (
            <button
              onClick={onClearHighlight}
              className="clarity-pill-gold text-xs cursor-pointer hover:bg-amber-100 transition-colors"
              title="Clear highlighted evidence"
            >
              <span>Highlighted</span>
              <span className="text-[10px] ml-0.5">✕</span>
            </button>
          )}

          {/* Text size */}
          <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => cycleFontSize('down')}
              disabled={fontSize === 'sm'}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
              title="Smaller text"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 px-2">
              {fontSize === 'sm' ? 'A-' : fontSize === 'lg' ? 'A+' : 'A'}
            </span>
            <button
              onClick={() => cycleFontSize('up')}
              disabled={fontSize === 'lg'}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
              title="Larger text"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Playback speed */}
          <div
            role="radiogroup"
            aria-label="Reading speed"
            className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-0.5 shadow-2xs"
          >
            {SPEECH_RATES.map((option) => {
              const selected = rate === option;
              return (
                <button
                  key={option}
                  ref={(el) => {
                    if (el) speedRefs.current.set(option, el);
                    else speedRefs.current.delete(option);
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setRate(option)}
                  onKeyDown={(event) => handleSpeedKeyDown(event, option)}
                  title={`Read aloud at ${option.toFixed(1)}x`}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#EAF7FF] text-[#0C7BB0]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {option.toFixed(1)}x
                </button>
              );
            })}
          </div>

          {/* Highlight on/off switch */}
          <button
            type="button"
            role="switch"
            aria-checked={highlightEnabled}
            onClick={toggleHighlight}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 select-none ${
              highlightEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-950 border-b-3 shadow-2xs hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600'
            }`}
            title={highlightEnabled ? 'Highlighting is ON (click to turn OFF)' : 'Highlighting is OFF (click to turn ON)'}
          >
            <Highlighter className={`w-3.5 h-3.5 ${highlightEnabled ? 'text-amber-600' : 'text-slate-400'}`} />
            <span
              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                highlightEnabled ? 'bg-amber-400' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  highlightEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              {highlightEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Transport */}
          <div className="flex items-center gap-0.5 bg-white border-2 border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => skipSentence(-1)}
              disabled={!supported}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous sentence (←)"
              aria-label="Skip to previous sentence"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePrimary}
              disabled={!supported}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                snapshot.status === 'playing' ? 'tactile-btn-red' : 'tactile-btn-blue'
              }`}
              title={
                !supported
                  ? 'Speech synthesis is unavailable in this browser'
                  : snapshot.status === 'playing'
                    ? 'Pause reading'
                    : snapshot.status === 'paused'
                      ? 'Resume reading'
                      : 'Read the passage aloud'
              }
            >
              {snapshot.status === 'playing' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : snapshot.status === 'paused' ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => skipSentence(1)}
              disabled={!supported}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              title="Next sentence (→)"
              aria-label="Skip to next sentence"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={stop}
              disabled={!supported || snapshot.status === 'idle'}
              className="p-1.5 rounded-lg text-slate-600 hover:text-[#EA2B2B] hover:bg-[#FEECEC] disabled:opacity-30 transition-colors cursor-pointer"
              title="Stop reading"
              aria-label="Stop reading"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Passage Text Content */}
      <div
        ref={containerRef}
        role="region"
        aria-label={`Reading passage: ${title}`}
        aria-describedby={helpId}
        aria-keyshortcuts="Space ArrowLeft ArrowRight"
        tabIndex={0}
        data-lenis-prevent
        onClick={handlePassageClick}
        onKeyDown={handleRegionKeyDown}
        className={`p-6 overflow-y-auto space-y-4 font-sans text-slate-800 ${FONT_CLASS[fontSize]} flex-1 select-text leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-[#1CB0F6]/40 focus-visible:ring-inset`}
      >
        {prepared.map((block, index) => {
          const isTargetPara = highlightParagraphId === block.id;
          return (
            <div
              key={block.id}
              data-block-id={block.id}
              ref={(el) => {
                if (el) paraRefs.current.set(block.id, el);
                else paraRefs.current.delete(block.id);
              }}
              className={`relative isolate py-3.5 pr-4 pl-12 transition-colors rounded-2xl ${
                isTargetPara ? 'bg-[#FFF9E6] border border-[#FFD026]' : ''
              }`}
            >
              {/* Layer 1 — sentence halo (decorative) */}
              {halo &&
                halo.blockId === block.id &&
                halo.boxes.map((box, boxIndex) => (
                  <span
                    key={boxIndex}
                    aria-hidden="true"
                    className={halo.morph ? 'rv-halo rv-halo--morph' : 'rv-halo'}
                    style={{
                      left: `${box.left}px`,
                      top: `${box.top}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                    }}
                  />
                ))}

              {/* Layer 2 — golden word pill, gliding word by word */}
              {pill && pill.blockId === block.id && (
                <span
                  key={pill.key}
                  aria-hidden="true"
                  className={pill.snap ? 'rv-pill rv-pill--snap' : 'rv-pill rv-pill--glide'}
                  style={{
                    transform: `translate3d(${pill.left}px, ${pill.top}px, 0)`,
                    width: `${pill.width}px`,
                    height: `${pill.height}px`,
                  }}
                />
              )}

              <button
                type="button"
                onClick={() => playFrom(block.id, 0)}
                disabled={!supported}
                title={`Read paragraph ${index + 1} from the start`}
                aria-label={`Read paragraph ${index + 1} from the start`}
                className="absolute left-3 top-3.5 z-10 cursor-pointer text-[10px] font-mono font-black text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md select-none hover:bg-[#EAF7FF] hover:text-[#0C7BB0] hover:border-[#1CB0F6]/40 disabled:opacity-50 transition-colors"
              >
                ¶{block.id}
              </button>

              <p className="relative z-[3] leading-relaxed indent-6">{renderBlock(block, index)}</p>
            </div>
          );
        })}
      </div>

      <p id={helpId} className="sr-only">
        Press space to play or pause the reading, the left and right arrow keys to move one sentence, or
        click any word to start reading from it.
      </p>

      {/* Single polite live region: sentence and playback state only, never a word. */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>

      {/* Passage Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          Official Review Dossier
        </span>
        <span className="hidden md:flex items-center gap-1 text-[11px] text-slate-500" aria-hidden="true">
          Click a word to read from it
          <span className="mx-1 text-slate-300">·</span>
          <kbd className="rv-kbd">Space</kbd>
          <span className="text-slate-400">play/pause</span>
          <span className="mx-1 text-slate-300">·</span>
          <kbd className="rv-kbd">←</kbd>
          <kbd className="rv-kbd">→</kbd>
          <span className="text-slate-400">sentence</span>
        </span>
        <span className="clarity-pill text-[11px]">{paragraphs.length} Paragraphs</span>
      </div>
    </div>
  );
};