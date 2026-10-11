import React, { useRef, useEffect } from 'react';
import { activity2Data, type TrueFalseQuestion } from '../data/examData';
import { CheckCircle2, XCircle, Flag, Volume2, Check, X } from 'lucide-react';
import { speakText } from '../utils/speech';
import { animateCardsEntrance } from '../utils/animations';

interface Activity2Props {
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
  mode: 'practice' | 'exam';
}

export const Activity2TrueFalse: React.FC<Activity2Props> = ({
  answers,
  onSelectAnswer,
  flaggedQuestions,
  onToggleFlag,
  mode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateCardsEntrance(containerRef.current || '.tf-question-list');
  }, []);

  const handleSpeakSituation = () => {
    speakText(activity2Data.situation);
  };

  const handleSpeakStatement = (stmt: TrueFalseQuestion) => {
    speakText(`Statement ${stmt.number}. ${stmt.statement}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Situation Card */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="clarity-pill-gold text-xs">
                Part 2 • Situation Analysis
              </span>
              <span className="clarity-pill text-xs">
                Work-Study Program
              </span>
            </div>

            <button
              onClick={handleSpeakSituation}
              className="tactile-btn-blue px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              title="Listen to scenario"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Scenario</span>
            </button>
          </div>

          <h3 className="text-xl sm:text-2xl font-display font-black mb-3 text-slate-900">
            Meeting with Academic Advisor Mr. Dan
          </h3>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 font-sans text-slate-800 text-base sm:text-lg leading-relaxed text-justify indent-8">
            "{activity2Data.situation}"
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Determine whether each statement below is TRUE or FALSE based on the scenario.</span>
            <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              Answered: {activity2Data.statements.filter((s) => answers[s.id]).length} / 10
            </span>
          </div>
        </div>
      </div>

      {/* Statements List */}
      <div ref={containerRef} className="space-y-4 tf-question-list">
        {activity2Data.statements.map((item) => {
          const selectedAnswer = answers[item.id];
          const isFlagged = flaggedQuestions.has(item.id);
          const isAnswered = !!selectedAnswer;
          const isCorrect = selectedAnswer === item.correctAnswer;
          const showFeedback = mode === 'practice' && isAnswered;

          return (
            <div
              key={item.id}
              id={`q-${item.id}`}
              className={`animate-card bg-white rounded-2xl p-5 sm:p-6 border-2 border-slate-200 border-b-4 border-b-slate-300 transition-all duration-200 shadow-xs hover:border-slate-300 ${
                isFlagged
                  ? 'ring-2 ring-amber-400 bg-amber-50/20'
                  : showFeedback
                  ? isCorrect
                    ? 'bg-[#EAF9E7]/30 border-[#58CC02]/40'
                    : 'bg-[#FEECEC]/30 border-[#FF4B4B]/40'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Statement text */}
                <div className="flex items-start gap-3.5 flex-1">
                  <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-display font-extrabold text-sm flex items-center justify-center">
                    {item.number}
                  </span>
                  <div>
                    <p className="text-base font-extrabold text-slate-900 leading-snug">
                      {item.statement}
                    </p>
                  </div>
                </div>

                {/* Right controls: Speak, Flag, and TRUE/FALSE buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleSpeakStatement(item)}
                    title="Listen to statement"
                    className="tactile-btn-white p-2 rounded-xl text-slate-600 hover:text-sky-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleFlag(item.id)}
                    title={isFlagged ? "Remove review flag" : "Flag for review"}
                    className={`tactile-btn-white p-2 rounded-xl transition-all cursor-pointer ${
                      isFlagged
                        ? 'bg-[#FFF7E6] border-amber-300 text-amber-600'
                        : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
                  </button>

                  {/* True / False Buttons */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => onSelectAnswer(item.id, 'TRUE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedAnswer === 'TRUE'
                          ? showFeedback
                            ? item.correctAnswer === 'TRUE'
                              ? 'bg-[#EAF9E7] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-green-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                              : 'bg-[#FEECEC] border-2 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-red-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                            : 'bg-[#EAF9E7] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-green-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                          : 'tactile-btn-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>TRUE</span>
                    </button>

                    <button
                      onClick={() => onSelectAnswer(item.id, 'FALSE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedAnswer === 'FALSE'
                          ? showFeedback
                            ? item.correctAnswer === 'FALSE'
                              ? 'bg-[#EAF9E7] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-green-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                              : 'bg-[#FEECEC] border-2 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-red-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                            : 'bg-[#FEECEC] border-2 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-red-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                          : 'tactile-btn-white'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>FALSE</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Practice Feedback */}
              {showFeedback && (
                <div
                  className={`mt-4 p-4 rounded-2xl border-2 text-xs leading-relaxed animate-fade-in ${
                    isCorrect
                      ? 'bg-[#EAF9E7] border-[#58CC02]/40 text-green-950'
                      : 'bg-[#FEECEC] border-[#FF4B4B]/40 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 font-bold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#58CC02]" />
                        <span>Correct! The statement is {item.correctAnswer}.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#FF4B4B]" />
                        <span>Incorrect. The statement is {item.correctAnswer}.</span>
                      </>
                    )}
                  </div>

                  <p className="text-slate-800 font-medium leading-normal">
                    {item.explanation}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/80 font-serif italic text-slate-700 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    Evidence: "{item.evidenceQuote}"
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
