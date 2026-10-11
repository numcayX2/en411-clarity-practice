import React, { useRef, useEffect } from 'react';
import { activity1Data, type MultipleChoiceQuestion } from '../data/examData';
import { PassageViewer } from './PassageViewer';
import { CheckCircle2, XCircle, Flag, Search, Volume2 } from 'lucide-react';
import { speakText } from '../utils/speech';
import { animateCardsEntrance } from '../utils/animations';

interface Activity1Props {
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
  mode: 'practice' | 'exam';
  activeHighlight: { quote: string | null; paragraphId: number | null };
  onSetHighlight: (quote: string | null, paragraphId: number | null) => void;
}

export const Activity1MarieCurie: React.FC<Activity1Props> = ({
  answers,
  onSelectAnswer,
  flaggedQuestions,
  onToggleFlag,
  mode,
  activeHighlight,
  onSetHighlight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateCardsEntrance(containerRef.current || '.question-list');
  }, []);

  const handleSpeakQuestion = (q: MultipleChoiceQuestion) => {
    const text = `Question ${q.number}. ${q.question}`;
    speakText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Passage Viewer (Sticky on desktop) */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 h-[650px] lg:h-[calc(100vh-140px)]">
        <PassageViewer
          title={activity1Data.readingTitle}
          subtitle="Biography & Scientific Breakthroughs"
          paragraphs={activity1Data.paragraphs}
          highlightQuote={activeHighlight.quote}
          highlightParagraphId={activeHighlight.paragraphId}
          onClearHighlight={() => onSetHighlight(null, null)}
        />
      </div>

      {/* Right Column: Questions */}
      <div ref={containerRef} className="lg:col-span-7 space-y-5 question-list">
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="clarity-pill-blue text-xs">
              Part 1 • Reading Comprehension
            </span>
            <h2 className="text-lg font-display font-black text-slate-900 mt-2">
              10 Multiple Choice Questions
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold block">Answered:</span>
            <div className="text-sm font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl inline-block mt-0.5">
              {activity1Data.questions.filter((q) => answers[q.id]).length} / {activity1Data.questions.length}
            </div>
          </div>
        </div>

        {activity1Data.questions.map((q) => {
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
                  <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-800 font-display font-extrabold text-sm flex items-center justify-center">
                    {q.number}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>
                </div>

                {/* Actions: Speak & Flag */}
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

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
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
                      className={`text-left p-3.5 rounded-xl text-sm flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
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

              {/* Practice Mode Feedback Card */}
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

                    {/* Locate Evidence Button */}
                    {q.evidenceQuote && (
                      <button
                        onClick={() => onSetHighlight(q.evidenceQuote || null, q.evidenceParagraph || null)}
                        className="clarity-pill-gold text-[11px] font-bold px-3 py-1 cursor-pointer hover:bg-amber-100 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Locate in Story (¶{q.evidenceParagraph})</span>
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
