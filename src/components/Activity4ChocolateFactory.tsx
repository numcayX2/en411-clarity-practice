import React, { useRef, useState, useEffect } from 'react';
import { activity4Data, type MultipleChoiceQuestion } from '../data/examData';
import { CheckCircle2, XCircle, Flag, Volume2, VolumeX, Search, Building2, MapPin, FileText, Highlighter } from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';
import { animateCardsEntrance } from '../utils/animations';
import { findQuoteRange } from '../utils/textHighlight';

interface Activity4Props {
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
  mode: 'practice' | 'exam';
  activeHighlight: { quote: string | null; paragraphId: number | null };
  onSetHighlight: (quote: string | null, paragraphId: number | null) => void;
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
  const letterRef = useRef<HTMLDivElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('en411_highlight_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const toggleHighlight = () => {
    setHighlightEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('en411_highlight_enabled', String(next));
        window.dispatchEvent(new CustomEvent('en411_highlight_change', { detail: next }));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (customEvent.detail !== undefined) {
        setHighlightEnabled(customEvent.detail);
      }
    };
    window.addEventListener('en411_highlight_change', handleSync);
    return () => window.removeEventListener('en411_highlight_change', handleSync);
  }, []);

  useEffect(() => {
    animateCardsEntrance(containerRef.current || '.q4-list');
  }, []);

  // Smoothly scroll to the highlighted sentence in the letter
  useEffect(() => {
    if (activeHighlight.quote) {
      if (!highlightEnabled) {
        setHighlightEnabled(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('en411_highlight_enabled', 'true');
        }
      }
      if (letterRef.current) {
        setTimeout(() => {
          const el = letterRef.current?.querySelector('.evidence-target');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [activeHighlight.quote]);

  const [readingState, setReadingState] = useState<{
    paraIndex: number | null;
    start: number;
    end: number;
  }>({ paraIndex: null, start: -1, end: -1 });

  const [pillStyle, setPillStyle] = useState<{
    paraIndex: number;
    left: number;
    top: number;
    width: number;
    height: number;
    hasAnimated: boolean;
  } | null>(null);

  const paraRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const activeWordRef = useRef<HTMLElement | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      stopRequestedRef.current = true;
      stopSpeech();
    };
  }, []);

  // Update sliding pill position smoothly whenever reading word changes
  useEffect(() => {
    if (activeWordRef.current && readingState.paraIndex !== null && readingState.start >= 0) {
      const paraEl = paraRefs.current.get(readingState.paraIndex);
      if (paraEl) {
        const paraRect = paraEl.getBoundingClientRect();
        const wordRect = activeWordRef.current.getBoundingClientRect();
        const isSamePara = pillStyle?.paraIndex === readingState.paraIndex;

        const baseFontSize = 16;
        const snugHeight = Math.round(baseFontSize * 1.35); // 22px snug to font glyphs
        const verticalCenter = wordRect.top + (wordRect.height / 2);
        const snugTop = verticalCenter - (snugHeight / 2) - paraRect.top;

        setPillStyle({
          paraIndex: readingState.paraIndex,
          left: wordRect.left - paraRect.left,
          top: snugTop,
          width: wordRect.width,
          height: snugHeight,
          hasAnimated: isSamePara,
        });

        activeWordRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    } else {
      setPillStyle(null);
    }
  }, [readingState]);

  const handleReadLetter = async () => {
    if (isReading) {
      stopRequestedRef.current = true;
      stopSpeech();
      setIsReading(false);
      setReadingState({ paraIndex: null, start: -1, end: -1 });
      setPillStyle(null);
      return;
    }
    setIsReading(true);
    stopRequestedRef.current = false;

    for (let i = 0; i < activity4Data.email.paragraphs.length; i++) {
      if (stopRequestedRef.current) break;
      const text = activity4Data.email.paragraphs[i];
      setReadingState({ paraIndex: i, start: -1, end: -1 });

      await speakText(text, {
        rate: 0.92,
        onWord: (charIndex, charLength) => {
          if (!stopRequestedRef.current) {
            setReadingState({
              paraIndex: i,
              start: charIndex,
              end: charIndex + charLength,
            });
          }
        },
      });
    }

    setIsReading(false);
    setReadingState({ paraIndex: null, start: -1, end: -1 });
    setPillStyle(null);
  };

  const handleSpeakQuestion = (q: MultipleChoiceQuestion) => {
    speakText(`Question ${q.number}. ${q.question}`);
  };

  const renderParagraphWithHighlight = (text: string, pIndex: number) => {
    const isThisParaReading = highlightEnabled && readingState.paraIndex === pIndex && readingState.start >= 0;
    const wordRange = isThisParaReading
      ? { start: Math.max(0, readingState.start), end: Math.min(text.length, readingState.end) }
      : null;

    const evidenceRange = (highlightEnabled && activeHighlight.quote) ? findQuoteRange(text, activeHighlight.quote) : null;

    if (!wordRange && !evidenceRange) {
      return text;
    }

    const rawPoints = [0, text.length];
    if (wordRange) rawPoints.push(wordRange.start, wordRange.end);
    if (evidenceRange) rawPoints.push(evidenceRange.start, evidenceRange.end);

    const points = Array.from(new Set(rawPoints.filter((p) => p >= 0 && p <= text.length))).sort((a, b) => a - b);
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const pStart = points[i];
      const pEnd = points[i + 1];
      if (pStart >= pEnd) continue;

      const chunk = text.slice(pStart, pEnd);
      const isWord = wordRange && pStart >= wordRange.start && pEnd <= wordRange.end;
      const isEvidence = evidenceRange && pStart >= evidenceRange.start && pEnd <= evidenceRange.end;

      if (isWord) {
        segments.push(
          <span
            key={`w-${pStart}-${pEnd}`}
            ref={activeWordRef}
            className="relative z-10 inline font-black text-slate-950"
          >
            {chunk}
          </span>
        );
      } else if (isEvidence) {
        segments.push(
          <mark key={`e-${pStart}-${pEnd}`} className="evidence-target relative z-10">
            {chunk}
          </mark>
        );
      } else {
        segments.push(
          <span key={`t-${pStart}-${pEnd}`} className="relative z-10">
            {chunk}
          </span>
        );
      }
    }

    return segments;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Business Letter Format */}
      <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
        
        {/* The Letter Card */}
        <div ref={letterRef} className="bg-white rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs overflow-hidden">
          {/* Letterhead Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b-2 border-slate-200 text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  {activity4Data.email.senderCompany}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activity4Data.email.address}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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

              <button
                onClick={handleReadLetter}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isReading
                    ? 'tactile-btn-red animate-pulse'
                    : 'tactile-btn-blue'
                }`}
                title="Listen to email"
              >
                {isReading ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isReading ? 'Stop' : 'Read Email'}</span>
              </button>
            </div>
          </div>

          {/* Letter Body */}
          <div className="p-6 sm:p-7 space-y-4 font-serif text-slate-800 text-sm sm:text-base leading-relaxed bg-[#FCFDFD]">
            {/* Date & Recipient */}
            <div className="font-sans text-xs text-slate-500 flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-700">{activity4Data.email.date}</span>
              <span className="clarity-pill text-[11px]">
                Customer Announcement
              </span>
            </div>

            <p className="font-sans font-extrabold text-slate-900 text-sm">
              {activity4Data.email.recipient}
            </p>

            <div className="font-display font-black text-sm sm:text-base text-slate-900 tracking-wide py-2 px-3 border border-slate-200 text-center uppercase bg-slate-50 rounded-xl shadow-2xs">
              {activity4Data.email.subject}
            </div>

            {/* Paragraphs with evidence targeting */}
            <div className="space-y-3 pt-1">
              {activity4Data.email.paragraphs.map((p, idx) => (
                <div
                  key={idx}
                  ref={(el) => {
                    if (el) paraRefs.current.set(idx, el);
                    else paraRefs.current.delete(idx);
                  }}
                  className="relative rounded-xl p-2 transition-colors"
                >
                  {/* Smooth moving highlighter pill */}
                  {highlightEnabled && readingState.paraIndex === idx && pillStyle && pillStyle.paraIndex === idx && (
                    <div
                      className="absolute pointer-events-none rounded-md bg-[#FFD814] ring-2 ring-[#EAB308] shadow-sm z-0"
                      style={{
                        transform: `translate3d(${pillStyle.left - 2}px, ${pillStyle.top}px, 0)`,
                        width: `${pillStyle.width + 4}px`,
                        height: `${pillStyle.height}px`,
                        transition: pillStyle.hasAnimated
                          ? 'transform 0.18s cubic-bezier(0.2, 0.8, 0.25, 1), width 0.18s cubic-bezier(0.2, 0.8, 0.25, 1)'
                          : 'opacity 0.12s ease',
                        opacity: 1,
                      }}
                    />
                  )}
                  <p className="relative z-10 leading-relaxed indent-6">
                    {renderParagraphWithHighlight(p, idx)}
                  </p>
                </div>
              ))}
            </div>

            {/* Sign-off */}
            <div className="pt-4 font-sans text-xs sm:text-sm space-y-1 text-slate-600 border-t border-slate-200">
              <p className="font-medium">{activity4Data.email.closing}</p>
              <p className="font-extrabold text-slate-900 text-base font-display">
                {activity4Data.email.signoffName}
              </p>
              <p className="text-xs text-slate-500">{activity4Data.email.signoffTitle}</p>
              <p className="text-xs text-slate-500">{activity4Data.email.signoffCompany}</p>
            </div>
          </div>
        </div>

        {/* Summary Box (from Test Paper page 6) */}
        <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Official Review Summary Box
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
            {activity4Data.summaryBox}
          </p>
        </div>

      </div>

      {/* Right Column: 6 Multiple Choice Questions */}
      <div ref={containerRef} className="lg:col-span-6 space-y-5 q4-list">
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="clarity-pill-blue text-xs">
              Part 4 • Business Correspondence
            </span>
            <h2 className="text-lg font-display font-black text-slate-900 mt-2">
              6 Comprehension Questions
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold block">Answered:</span>
            <div className="text-sm font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl inline-block mt-0.5">
              {activity4Data.questions.filter((q) => answers[q.id]).length} / {activity4Data.questions.length}
            </div>
          </div>
        </div>

        {activity4Data.questions.map((q) => {
          const selectedAnswer = answers[q.id];
          const isFlagged = flaggedQuestions.has(q.id);
          const isAnswered = !!selectedAnswer;
          const isCorrect = selectedAnswer === q.correctAnswer;
          const showFeedback = mode === 'practice' && isAnswered;

          return (
            <div
              key={q.id}
              id={`q-${q.id}`}
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
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-display font-extrabold text-sm flex items-center justify-center">
                    {q.number}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSpeakQuestion(q)}
                    title="Listen to question"
                    className="tactile-btn-white p-2 rounded-xl text-slate-600 hover:text-sky-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleFlag(q.id)}
                    title={isFlagged ? "Remove review flag" : "Flag for review"}
                    className={`tactile-btn-white p-2 rounded-xl transition-all cursor-pointer ${
                      isFlagged
                        ? 'bg-[#FFF7E6] border-amber-300 text-amber-600'
                        : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-4">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswer === opt.label;
                  const isThisCorrect = opt.label === q.correctAnswer;

                  let optionStyle = 'bg-white hover:bg-slate-50 border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-800 hover:border-slate-300 active:border-b-2 active:translate-y-[2px]';

                  if (showFeedback) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-[#EAF9E7] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-green-950 font-extrabold active:border-b-2 active:translate-y-[2px]';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-[#FEECEC] border-2 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-red-950 font-extrabold active:border-b-2 active:translate-y-[2px]';
                    } else {
                      optionStyle = 'bg-slate-50/70 border-2 border-slate-200 text-slate-400 opacity-60 shadow-none';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-[#EAF7FF] border-2 border-[#1CB0F6] border-b-4 border-b-[#1899D6] text-sky-950 font-bold active:border-b-2 active:translate-y-[2px]';
                  }

                  return (
                    <button
                      key={opt.label}
                      onClick={() => onSelectAnswer(q.id, opt.label)}
                      className={`w-full text-left p-3.5 rounded-xl text-sm flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${
                          showFeedback
                            ? isThisCorrect
                              ? 'bg-[#58CC02] text-white border-[#46A302]'
                              : isSelected
                              ? 'bg-[#FF4B4B] text-white border-[#EA2B2B]'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                            : isSelected
                            ? 'bg-[#1CB0F6] text-white border-[#1899D6]'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="flex-1 leading-snug pt-0.5 font-medium">{opt.text}</span>

                      {showFeedback && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#58CC02] shrink-0 mt-0.5" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#FF4B4B] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div
                  className={`mt-4 p-4 rounded-2xl border-2 text-xs leading-relaxed animate-fade-in ${
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
                          <span>Correct! Option ({q.correctAnswer})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-[#FF4B4B]" />
                          <span>Incorrect. Correct answer is ({q.correctAnswer})</span>
                        </>
                      )}
                    </span>

                    {q.evidenceQuote && (
                      <button
                        onClick={() => onSetHighlight(q.evidenceQuote || null, q.evidenceParagraph || null)}
                        className="clarity-pill-gold text-[11px] font-bold px-3 py-1 cursor-pointer hover:bg-amber-100 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Locate in Letter</span>
                      </button>
                    )}
                  </div>

                  <p className="text-slate-800 font-medium leading-normal mb-1">
                    {q.explanation}
                  </p>

                  {q.evidenceQuote && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 font-serif italic text-slate-700 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                      "{q.evidenceQuote}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
