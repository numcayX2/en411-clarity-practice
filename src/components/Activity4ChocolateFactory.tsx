import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Candy,
  CheckCircle2,
  FileText,
  Flag,
  Highlighter,
  ListChecks,
  Mail,
  MapPin,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  User,
  Volume2,
  XCircle,
} from 'lucide-react';
import { activity4Data, type GlossaryEntry, type MultipleChoiceQuestion } from '../data/examData';
import { speakText, stopSpeech } from '../utils/speech';
import { animateCardsEntrance } from '../utils/animations';
import { findQuoteRange } from '../utils/textHighlight';
import { contentOrigin, prepareBlock, snapRangeToTokens, type PreparedBlock } from '../utils/readingTokens';
import { SPEECH_RATES } from '../utils/ttsPlayer';
import { useSpeechPlayer } from '../hooks/useSpeechPlayer';
import { useHighlightLayers } from '../hooks/useHighlightLayers';
import { ReadingParagraph, type VocabRange } from './ReadingParagraph';
import { ensureVisible } from '../utils/paneScroll';

interface Activity4Props {
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
  mode: 'practice' | 'exam';
  activeHighlight: { quote: string | null; paragraphId: number | null };
  onSetHighlight: (quote: string | null, paragraphId: number | null) => void;
}

/** Shared with PassageViewer — both reading panes mirror the same preference. */
const HIGHLIGHT_STORAGE_KEY = 'en411_highlight_enabled';
const HIGHLIGHT_EVENT = 'en411_highlight_change';

/** Layout fingerprint for the highlight layers: the email body never re-scales. */
const EMAIL_LAYOUT_KEY = 'act4-email';

/** Estimated width of the vocabulary popover (`w-72`), used to keep it on-screen. */
const VOCAB_POPOVER_WIDTH = 288;

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
 * Every occurrence of every glossed term inside one block, snapped to whole
 * word tokens so a hotspot never covers half a word.
 */
const findTermRanges = (block: PreparedBlock, glossary: GlossaryEntry[]): VocabRange[] => {
  const ranges: VocabRange[] = [];
  for (const entry of glossary) {
    const pattern = new RegExp(`\\b${entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    let match = pattern.exec(block.text);
    while (match) {
      const snapped = snapRangeToTokens(block.tokens, match.index, match.index + match[0].length);
      if (snapped) ranges.push({ ...snapped, term: entry.term });
      match = pattern.exec(block.text);
    }
  }
  return ranges;
};

interface VocabPopoverState {
  blockId: number;
  term: string;
  left: number;
  top: number;
}

export const Activity4ChocolateFactory: React.FC<Activity4Props> = ({
  answers,
  onSelectAnswer,
  flaggedQuestions,
  onToggleFlag,
  mode,
  activeHighlight,
  onSetHighlight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  /** The scrollport of the email body: its own scroll area, not the window. */
  const paneRef = useRef<HTMLDivElement>(null);
  const helpId = useId();

  /** Mobile shows one pane at a time; desktop ignores this and splits the view. */
  const [mobileView, setMobileView] = useState<'email' | 'questions'>('email');
  const [view, setView] = useState<'email' | 'digest'>('email');
  const [vocab, setVocab] = useState<VocabPopoverState | null>(null);

  /** SSR-safe default; the persisted preference is applied after mount. */
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(true);
  const enabledRef = useRef(highlightEnabled);
  enabledRef.current = highlightEnabled;

  useEffect(() => {
    setHighlightEnabled(readStoredHighlight());
  }, []);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (detail !== undefined) setHighlightEnabled(detail);
    };
    window.addEventListener(HIGHLIGHT_EVENT, handleSync);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, handleSync);
  }, []);

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
    animateCardsEntrance(containerRef.current || '.q4-list');
  }, []);

  /* A one-shot question reading outlives this component otherwise. */
  useEffect(() => () => stopSpeech(), []);

  /* ── Text analysis: tokens, sentences and the speech-unit schedule ── */
  const prepared = useMemo(
    () => activity4Data.email.paragraphs.map((paragraph) => prepareBlock(paragraph.id, paragraph.text)),
    []
  );
  const { snapshot, rate, setRate, supported, play, pause, resume, skipSentence, stop, playFrom } =
    useSpeechPlayer(prepared);

  const { pill, halo, registerParaEl, registerWordEl, activeBlockId, activeWordStart, activeWordEnd } =
    useHighlightLayers({
      prepared,
      snapshot,
      highlightEnabled,
      layoutKey: EMAIL_LAYOUT_KEY,
      scrollerRef: paneRef,
    });

  /* ── Evidence: quote → character range → whole-word range ── */
  const evidence = useMemo(
    () =>
      prepared.map((block) => {
        if (!highlightEnabled || !activeHighlight.quote) return null;
        const range = findQuoteRange(block.text, activeHighlight.quote);
        return range ? snapRangeToTokens(block.tokens, range.start, range.end) : null;
      }),
    [prepared, activeHighlight.quote, highlightEnabled]
  );

  /* ── Vocabulary hotspots: business/vocational terms glossed in place ── */
  const vocabRanges = useMemo(
    () => prepared.map((block) => findTermRanges(block, activity4Data.glossary)),
    [prepared]
  );

  /**
   * "Locate in Email" forced highlighting on and jumped to the sentence.
   * The enabled state is read through a ref so turning the highlight *off* while
   * a quote is active cannot re-trigger this effect and fight the user.
   */
  useEffect(() => {
    if (!activeHighlight.quote) return;
    if (!enabledRef.current) {
      setHighlightEnabled(true);
      try {
        window.localStorage.setItem(HIGHLIGHT_STORAGE_KEY, 'true');
      } catch {
        /* storage unavailable */
      }
    }
    const frame = window.requestAnimationFrame(() => {
      const scroller = paneRef.current;
      const anchor = scroller?.querySelector<HTMLElement>('[data-evidence-anchor]');
      if (scroller && anchor) ensureVisible(scroller, anchor, 72);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeHighlight.quote, activeHighlight.paragraphId]);

  /* ── Controls ── */

  const statusRef = useRef(snapshot.status);
  statusRef.current = snapshot.status;

  const handlePrimary = useCallback(() => {
    const status = statusRef.current;
    if (status === 'playing') {
      pause();
      return;
    }
    if (status === 'paused') {
      resume();
      return;
    }
    // The digest carries no rendered words, so highlighting would have nowhere
    // to land: fall back to the letter itself before starting the voice.
    setView('email');
    play();
  }, [pause, resume, play]);

  const handleRegionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Only when the pane itself owns focus — nested controls must keep their own
    // keyboard behaviour.
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

  /* ── Vocabulary popover (positioned inside its own paragraph) ── */

  const showVocab = useCallback((term: string, el: HTMLElement) => {
    const pane = paneRef.current;
    const paraEl = el.closest<HTMLElement>('[data-block-id]');
    if (!pane || !paraEl) return;
    const origin = contentOrigin(paraEl);
    const rect = el.getBoundingClientRect();
    /* `left` is measured from the paragraph, so it must be clamped to the paragraph —
       clamping to the (wider, padded) scroll pane let the card hang past the right edge. */
    const maxLeft = Math.max(0, paraEl.clientWidth - VOCAB_POPOVER_WIDTH - 8);
    setVocab((previous) => {
      const next: VocabPopoverState = {
        blockId: Number(paraEl.dataset.blockId),
        term,
        left: Math.min(Math.max(rect.left - origin.left, 0), maxLeft),
        top: rect.bottom - origin.top + 8,
      };
      return previous && previous.blockId === next.blockId && previous.term === next.term &&
        previous.left === next.left && previous.top === next.top
        ? previous
        : next;
    });
  }, []);

  const handlePaneOver = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-vocab-term]');
    const term = el?.dataset.vocabTerm;
    if (el && term) showVocab(term, el);
  };

  const handlePaneOut = (event: React.MouseEvent<HTMLDivElement>) => {
    const related = event.relatedTarget as HTMLElement | null;
    if (related?.closest('[data-vocab-term]')) return; // moving along the same term
    setVocab(null);
  };

  const handlePaneFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-vocab-term]');
    const term = el?.dataset.vocabTerm;
    if (el && term) showVocab(term, el);
  };

  const handlePaneClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    // A gloss is a vocabulary hotspot, not a play control.
    const vocabEl = target.closest<HTMLElement>('[data-vocab-term]');
    if (vocabEl) {
      const term = vocabEl.dataset.vocabTerm;
      if (term) showVocab(term, vocabEl);
      return;
    }
    if (target.closest('button')) return;

    const paraEl = target.closest<HTMLElement>('[data-block-id]');
    if (!paraEl) return;
    const wordEl = target.closest<HTMLElement>('[data-word]');
    // A click that ends a text selection should keep the selection, not start audio.
    const selection = window.getSelection();
    if (wordEl && selection && !selection.isCollapsed && selection.containsNode(wordEl, true)) return;
    playFrom(Number(paraEl.dataset.blockId), wordEl ? Number(wordEl.dataset.word) : 0);
  };

  const handleSpeakQuestion = (question: MultipleChoiceQuestion) => {
    stop(); // the email reader and this one-shot share one synthesiser
    void speakText(`Question ${question.number}. ${question.question}`);
  };

  const handleLocate = (question: MultipleChoiceQuestion) => {
    if (!question.evidenceQuote) return;
    onSetHighlight(question.evidenceQuote, question.evidenceParagraph ?? null);
    setView('email');
    setMobileView('email');
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

  const answeredCount = activity4Data.questions.filter((question) => answers[question.id]).length;
  const email = activity4Data.email;
  const activeGloss = vocab ? activity4Data.glossary.find((entry) => entry.term === vocab.term) : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Mobile pane switch — one pane at a time, so students never lose their place */}
      <div className="lg:hidden flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border-2 border-slate-200">
        {(
          [
            { id: 'email', label: `Email (${prepared.length} ¶)`, icon: Mail },
            { id: 'questions', label: `Questions (${answeredCount}/6)`, icon: ListChecks },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const selected = mobileView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setMobileView(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selected ? 'bg-white text-slate-900 border-2 border-slate-200 border-b-4 border-b-slate-300' : 'text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Left column: the email card */}
      <div
        className={`${
          mobileView === 'email' ? 'block' : 'hidden'
        } lg:block lg:col-span-6 lg:sticky lg:top-24 h-[82vh] min-h-[440px] lg:h-[calc(100vh-140px)]`}
      >
        <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 overflow-hidden flex flex-col h-full shadow-xs">
          {/* Email client chrome */}
          <div className="px-4 py-3 sm:px-5 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-display font-black text-sm flex items-center justify-center shadow-2xs">
                  GC
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-white border border-slate-200 text-amber-600">
                  <Candy className="w-3 h-3" />
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-extrabold text-sm text-slate-900 truncate flex items-center gap-1.5">
                  {email.senderCompany}
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{email.address}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {activeHighlight.quote && (
                <button
                  type="button"
                  onClick={() => onSetHighlight(null, null)}
                  aria-label="Clear highlighted evidence"
                  className="clarity-pill-gold text-[11px] cursor-pointer hover:bg-amber-100 transition-colors"
                  title="Clear the highlighted evidence in the email"
                >
                  <Highlighter className="w-3 h-3" />
                  <span>Clear highlight</span>
                </button>
              )}

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
            </div>
          </div>

          {/* Mail metadata chips */}
          <div className="px-4 py-3 sm:px-5 border-b border-slate-200 bg-white space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] min-w-0">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-slate-400">From:</span>
                <span className="font-semibold text-slate-700 truncate">{email.senderEmail}</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] min-w-0">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-slate-400">To:</span>
                <span className="font-semibold text-slate-700 truncate">
                  {email.recipientName} &lt;{email.recipientEmail}&gt;
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-slate-400">Date:</span>
                <span className="font-semibold text-slate-700">{email.date}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Subject:</span>
              <span className="font-display font-extrabold text-xs text-slate-900 tracking-wide">
                {email.subject}
              </span>
            </div>
          </div>

          {/* Reading toolbar */}
          <div className="px-4 py-2.5 sm:px-5 bg-slate-50/80 border-b-2 border-slate-200 flex items-center justify-between gap-2 flex-wrap">
            {/* View: full letter vs. quick digest */}
            <div
              role="radiogroup"
              aria-label="Email view"
              className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-0.5 shadow-2xs"
            >
              {(
                [
                  { id: 'email', label: 'Full Email' },
                  { id: 'digest', label: 'Quick Digest' },
                ] as const
              ).map((option) => {
                const selected = view === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setView(option.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                      selected ? 'bg-[#FFF7E6] text-[#A65E00]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
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
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setRate(option)}
                      title={`Read aloud at ${option.toFixed(1)}x`}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                        selected ? 'bg-[#EAF7FF] text-[#0C7BB0]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {option.toFixed(1)}x
                    </button>
                  );
                })}
              </div>

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
                          : 'Read the email aloud'
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
                      <span>Read Email</span>
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

          {/* Email body / digest */}
          <div
            ref={paneRef}
            role="region"
            aria-label={`Email from ${email.senderCompany}: ${email.subject}`}
            aria-describedby={helpId}
            aria-keyshortcuts="Space ArrowLeft ArrowRight"
            tabIndex={0}
            data-lenis-prevent
            onClick={handlePaneClick}
            onKeyDown={handleRegionKeyDown}
            onMouseOver={handlePaneOver}
            onMouseOut={handlePaneOut}
            onFocus={handlePaneFocus}
            onBlur={() => setVocab(null)}
            className="flex-1 overflow-y-auto bg-[#FCFDFD] outline-none focus-visible:ring-2 focus-visible:ring-[#1CB0F6]/40 focus-visible:ring-inset"
          >
            {view === 'digest' ? (
              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-display font-black text-sm text-amber-950">Quick Digest</h4>
                    <span className="clarity-pill-gold text-[10px] ml-auto">1-minute summary</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium font-sans">
                    {activity4Data.summaryBox}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('email')}
                    className="mt-4 tactile-btn-white px-3 py-2 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Back to the full email</span>
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-slate-500 font-medium">
                  Use the digest to check the main facts, then switch back to the full email to see each
                  answer's evidence in context.
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6 space-y-4">
                {/* Letterhead */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-display font-extrabold text-sm text-slate-900">{email.senderCompany}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{email.address}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">{email.date}</span>
                </div>

                <p className="text-sm text-slate-700 font-bold">{email.recipient}</p>

                <h1 className="font-display font-black text-sm sm:text-base text-slate-900 tracking-wide py-2.5 px-3 text-center uppercase bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                  {email.subject}
                </h1>

                {/* Body: one block per paragraph, each its own measurement context */}
                <div className="space-y-1 pt-1 font-serif text-[15px] leading-7 text-slate-700">
                  {prepared.map((block, index) => {
                    const isTargetPara = activeHighlight.quote !== null && activeHighlight.paragraphId === block.id;
                    /* `isolate` traps the gloss in this block's stacking context, so the
                       owner must outrank its later siblings or they paint over the card. */
                    const glossOpen = vocab !== null && vocab.blockId === block.id;
                    return (
                      <div
                        key={block.id}
                        data-block-id={block.id}
                        ref={(el) => registerParaEl(block.id, el)}
                        className={`relative isolate px-2.5 py-2 rounded-xl transition-colors ${
                          glossOpen ? 'z-30' : ''
                        } ${isTargetPara ? 'bg-[#FFF9E6]' : 'hover:bg-slate-50'}`}
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

                        {/* Vocabulary gloss for the term under the pointer / focus */}
                        {vocab && vocab.blockId === block.id && activeGloss && (
                          <div
                            role="tooltip"
                            className="absolute z-20 w-72 max-w-full rounded-xl border-2 border-amber-200 bg-white p-3 shadow-lg"
                            style={{ left: `${vocab.left}px`, top: `${vocab.top}px` }}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-display font-extrabold text-xs text-slate-900">
                                {activeGloss.term}
                              </span>
                              <span className="clarity-pill-gold text-[10px] ml-auto">{activeGloss.thaiMeaning}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600 font-sans font-medium">
                              {activeGloss.definition}
                            </p>
                          </div>
                        )}

                        <ReadingParagraph
                          block={block}
                          evidence={evidence[index]}
                          activeStart={activeBlockId === block.id ? activeWordStart : -1}
                          activeEnd={activeBlockId === block.id ? activeWordEnd : -1}
                          vocabRanges={vocabRanges[index]}
                          className="relative z-[3] leading-7"
                          onWordRef={registerWordEl}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Sign-off signature block */}
                <div className="pt-4 border-t-2 border-slate-100 space-y-0.5">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">{email.closing}</p>
                  <p className="font-display font-extrabold text-base text-slate-900 pt-1">{email.signoffName}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">{email.signoffTitle}</p>
                  <p className="text-[11px] text-slate-500">{email.signoffCompany}</p>
                </div>
              </div>
            )}

            {/* Glossary for assistive technology: the visual hotspot is hover/focus only. */}
            <section className="sr-only" aria-label="Vocabulary notes">
              <h4>Vocabulary notes</h4>
              <dl>
                {activity4Data.glossary.map((entry) => (
                  <div key={entry.term}>
                    <dt>{entry.term}</dt>
                    <dd>
                      {entry.definition} ({entry.thaiMeaning})
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <p id={helpId} className="sr-only">
            Press space to play or pause the reading, the left and right arrow keys to move one sentence, or click
            any word to start reading from it. Hover or focus a highlighted business term to read its definition.
          </p>

          {/* Single polite live region: sentence and playback state only, never a word. */}
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {liveText}
          </p>

          {/* Card footer */}
          <div className="px-4 py-2.5 sm:px-5 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Formal correspondence
            </span>
            <span className="hidden md:flex items-center gap-1 text-[11px]" aria-hidden="true">
              Click a word to read from it
              <span className="mx-1 text-slate-300">·</span>
              <kbd className="rv-kbd">Space</kbd>
              <span className="text-slate-400">play/pause</span>
            </span>
            <span className="clarity-pill text-[11px]">{prepared.length} Paragraphs</span>
          </div>
        </div>
      </div>

      {/* Right column: 6 multiple-choice questions */}
      <div
        className={`${
          mobileView === 'questions' ? 'block' : 'hidden'
        } lg:block lg:col-span-6 space-y-5 q4-list`}
      >
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="clarity-pill-blue text-xs">Part 4 • Business Correspondence</span>
            <h2 className="text-lg font-display font-black text-slate-900 mt-2">6 Comprehension Questions</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold block">Answered:</span>
            <div className="text-sm font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl inline-block mt-0.5">
              {answeredCount} / {activity4Data.questions.length}
            </div>
          </div>
        </div>

        {activity4Data.questions.map((question) => {
          const selectedAnswer = answers[question.id];
          const isFlagged = flaggedQuestions.has(question.id);
          const isAnswered = !!selectedAnswer;
          const isCorrect = selectedAnswer === question.correctAnswer;
          const showFeedback = mode === 'practice' && isAnswered;

          return (
            <div
              key={question.id}
              id={`q-${question.id}`}
              className={`animate-card bg-white rounded-2xl p-6 border-2 border-slate-200 border-b-4 border-b-slate-300 transition-all duration-200 shadow-xs hover:border-slate-300 ${
                isFlagged
                  ? 'ring-2 ring-amber-400 bg-amber-50/20'
                  : showFeedback
                    ? isCorrect
                      ? 'bg-[#EAF9E7]/30 border-[#58CC02]/40'
                      : 'bg-[#FEECEC]/30 border-[#FF4B4B]/40'
                    : ''
              }`}
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-800 font-display font-extrabold text-sm flex items-center justify-center">
                    {question.number}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{question.question}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSpeakQuestion(question)}
                    title="Listen to question"
                    aria-label={`Listen to question ${question.number}`}
                    className="tactile-btn-white p-2 rounded-xl text-slate-600 hover:text-sky-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleFlag(question.id)}
                    title={isFlagged ? 'Remove review flag' : 'Flag for review'}
                    aria-pressed={isFlagged}
                    className={`tactile-btn-white p-2 rounded-xl transition-all cursor-pointer ${
                      isFlagged ? 'bg-[#FFF7E6] border-amber-300 text-amber-600' : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Options — Duolingo-style tactile buttons */}
              <div className="space-y-2.5 mb-4">
                {question.options.map((option) => {
                  const isSelected = selectedAnswer === option.label;
                  const isThisCorrect = option.label === question.correctAnswer;

                  let optionStyle =
                    'tactile-btn-white text-slate-800 hover:text-slate-900';
                  if (showFeedback) {
                    if (isThisCorrect) optionStyle = 'tactile-btn-green';
                    else if (isSelected) optionStyle = 'tactile-btn-red';
                    else optionStyle = 'tactile-btn-white text-slate-400 opacity-60';
                  } else if (isSelected) {
                    optionStyle = 'tactile-btn-white bg-[#EAF7FF] border-[#1CB0F6] text-sky-950';
                  }

                  return (
                    <button
                      key={option.label}
                      onClick={() => onSelectAnswer(question.id, option.label)}
                      aria-pressed={isSelected}
                      className={`w-full justify-start text-left p-3.5 rounded-xl text-sm flex items-start gap-3 ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${
                          showFeedback
                            ? isThisCorrect || isSelected
                              ? 'bg-white/25 text-white border-white/40'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                            : isSelected
                              ? 'bg-[#1CB0F6] text-white border-[#1899D6]'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="flex-1 leading-snug pt-0.5">{option.text}</span>

                      {showFeedback && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Practice-mode rationale, with the exact quote cited */}
              {showFeedback && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs leading-relaxed animate-fade-in ${
                    isCorrect
                      ? 'bg-[#EAF9E7] border-[#58CC02]/40 text-green-950'
                      : 'bg-[#FEECEC] border-[#FF4B4B]/40 text-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 font-bold">
                    <span className="flex items-center gap-1.5 font-sans">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#58CC02]" />
                          <span>Correct! Option ({question.correctAnswer})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-[#FF4B4B]" />
                          <span>Incorrect. The correct answer is ({question.correctAnswer})</span>
                        </>
                      )}
                    </span>

                    {question.evidenceQuote && (
                      <button
                        onClick={() => handleLocate(question)}
                        className="clarity-pill-gold text-[11px] font-bold px-3 py-1 cursor-pointer hover:bg-amber-100 transition-colors shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Locate in Email (¶{question.evidenceParagraph})</span>
                      </button>
                    )}
                  </div>

                  <p className="text-slate-800 font-medium leading-normal">{question.explanation}</p>

                  {question.evidenceQuote && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 font-serif italic text-slate-700 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                      "{question.evidenceQuote}"
                    </div>
                  )}
                </div>
              )}

              {/* In exam mode the rationale stays hidden, but the evidence locator is a reading aid */}
              {!showFeedback && question.evidenceQuote && (
                <button
                  onClick={() => handleLocate(question)}
                  className="clarity-pill-gold text-[11px] font-bold px-3 py-1 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Locate in Email (¶{question.evidenceParagraph})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
