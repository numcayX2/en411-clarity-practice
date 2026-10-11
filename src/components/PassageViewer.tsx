import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { prepareBlock, snapRangeToTokens } from '../utils/readingTokens';
import { SPEECH_RATES, type SpeechRate } from '../utils/ttsPlayer';
import { useSpeechPlayer } from '../hooks/useSpeechPlayer';
import { useHighlightLayers } from '../hooks/useHighlightLayers';
import { ReadingParagraph } from './ReadingParagraph';
import { ensureVisible } from '../utils/paneScroll';
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
  mommyAudioTrack?: AudioPassageConfig;
}

type FontSize = 'sm' | 'base' | 'lg';

/** Shared with Activity4 — both panes mirror the same highlight preference. */
const HIGHLIGHT_STORAGE_KEY = 'en411_highlight_enabled';
const HIGHLIGHT_EVENT = 'en411_highlight_change';
const VOICE_MODE_STORAGE_KEY = 'en411_voice_mode';

const readStoredVoiceMode = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const saved = window.localStorage.getItem(VOICE_MODE_STORAGE_KEY);
    return saved === null ? true : saved === 'mommy';
  } catch {
    return true;
  }
};

const FONT_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-relaxed',
  base: 'text-base leading-relaxed',
  lg: 'text-lg leading-loose',
};

const readStoredHighlight = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const saved = window.localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
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
  mommyAudioTrack,
}) => {
  const [fontSize, setFontSize] = useState<FontSize>('base');
  /** SSR-safe default; the persisted preference is applied after mount (below). */
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(true);
  const [isMommyVoice, setIsMommyVoice] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const speedRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const enabledRef = useRef(highlightEnabled);
  enabledRef.current = highlightEnabled;

  const helpId = useId();

  useEffect(() => {
    setIsMommyVoice(readStoredVoiceMode());
  }, []);

  const toggleVoiceMode = useCallback(() => {
    setIsMommyVoice((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(VOICE_MODE_STORAGE_KEY, next ? 'mommy' : 'classic');
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const activeAudioTrack = useMemo(() => {
    if (!mommyAudioTrack) return audioTrack;
    return isMommyVoice ? mommyAudioTrack : (audioTrack || mommyAudioTrack);
  }, [mommyAudioTrack, audioTrack, isMommyVoice]);

  /* ── Text analysis: tokens, sentences and the speech-unit schedule ── */
  const prepared = useMemo(
    () => paragraphs.map((paragraph) => prepareBlock(paragraph.id, paragraph.text)),
    [paragraphs]
  );
  const { snapshot, rate, setRate, supported, play, pause, resume, skipSentence, stop, playFrom } =
    useSpeechPlayer(prepared, { audioTrack: activeAudioTrack });

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

  /* ── The pill, the halo and the word registry all live in the shared hook ── */
  const {
    pill,
    halo,
    registerParaEl,
    registerWordEl,
    activeBlockId,
    activeWordStart,
    activeWordEnd,
  } = useHighlightLayers({
    prepared,
    snapshot,
    highlightEnabled,
    // Font size and zoom invalidate every cached measurement.
    layoutKey: fontSize,
    scrollerRef: containerRef,
  });

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

          {/* Mommy Voice Mode Toggle Switch */}
          {mommyAudioTrack && (
            <button
              type="button"
              role="switch"
              aria-checked={isMommyVoice}
              onClick={toggleVoiceMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 select-none ${
                isMommyVoice
                  ? 'bg-rose-50 border-rose-300 border-b-3 border-b-rose-400 text-rose-900 shadow-2xs hover:bg-rose-100'
                  : 'bg-slate-50 border-slate-300 border-b-3 border-b-slate-400 text-slate-700 shadow-2xs hover:bg-slate-100'
              }`}
              title={
                isMommyVoice
                  ? 'Mommy Voice Mode is ON 🌸 (click to switch to Classic Narrator)'
                  : 'Mommy Voice Mode is OFF (click to switch to Mommy Voice)'
              }
            >
              <span className="text-xs" aria-hidden="true">
                {isMommyVoice ? '🌸' : '🎙️'}
              </span>
              <span
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  isMommyVoice ? 'bg-rose-400' : 'bg-slate-400'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    isMommyVoice ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </span>
              <span className="text-[11px] font-extrabold tracking-tight">
                {isMommyVoice ? 'Mommy Voice' : 'Classic Voice'}
              </span>
            </button>
          )}

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
                snapshot.status === 'playing'
                  ? 'tactile-btn-red'
                  : isMommyVoice
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-2 border-rose-600 border-b-4 border-b-rose-700 shadow-2xs active:translate-y-0.5'
                    : 'tactile-btn-blue'
              }`}
              title={
                !supported
                  ? 'Speech synthesis is unavailable in this browser'
                  : snapshot.status === 'playing'
                    ? 'Pause reading'
                    : snapshot.status === 'paused'
                      ? 'Resume reading'
                      : isMommyVoice
                        ? 'Read passage aloud with Mommy Voice 🌸'
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
                  {isMommyVoice ? (
                    <span className="text-xs" aria-hidden="true">🌸</span>
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isMommyVoice ? 'Mommy Listen' : 'Listen'}</span>
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
              ref={(el) => registerParaEl(block.id, el)}
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

              <ReadingParagraph
                block={block}
                evidence={evidence[index]}
                activeStart={activeBlockId === block.id ? activeWordStart : -1}
                activeEnd={activeBlockId === block.id ? activeWordEnd : -1}
                className="relative z-[3] leading-relaxed indent-6"
                onWordRef={registerWordEl}
              />
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