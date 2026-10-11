import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { activity1Data, activity2Data, activity3Data, activity4Data } from '../data/examData';
import { triggerCelebration } from '../utils/confetti';
import { animateScoreCounter } from '../utils/animations';
import { Trophy, CheckCircle2, RotateCcw, BookOpen, X } from 'lucide-react';

interface ExamResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: Record<string, string>;
  timeSpentSeconds: number;
  onRetakeExam: () => void;
  onSwitchToPracticeMode: () => void;
}

export const ExamResultsModal: React.FC<ExamResultsModalProps> = ({
  open,
  onOpenChange,
  answers,
  timeSpentSeconds,
  onRetakeExam,
  onSwitchToPracticeMode,
}) => {
  const [displayScore, setDisplayScore] = useState<number | null>(null);

  // Calculate scores
  let act1Score = 0;
  activity1Data.questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) act1Score++;
  });

  let act2Score = 0;
  activity2Data.statements.forEach((s) => {
    if (answers[s.id] === s.correctAnswer) act2Score++;
  });

  let act3Score = 0;
  activity3Data.clozeItems.forEach((c) => {
    const val = answers[`act3_b${c.id}`];
    if (val && val.toLowerCase() === c.correctWord.toLowerCase()) act3Score++;
  });

  let act4Score = 0;
  activity4Data.questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) act4Score++;
  });

  const totalScore = act1Score + act2Score + act3Score + act4Score;
  const maxScore = 32;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Compile missed questions
  const missedList: Array<{
    activity: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }> = [];

  activity1Data.questions.forEach((q) => {
    if (answers[q.id] !== q.correctAnswer) {
      missedList.push({
        activity: 'Activity 1: Marie Curie',
        questionText: `Q${q.number}. ${q.question}`,
        userAnswer: answers[q.id] || '(No Answer)',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      });
    }
  });

  activity2Data.statements.forEach((s) => {
    if (answers[s.id] !== s.correctAnswer) {
      missedList.push({
        activity: 'Activity 2: Work-Study',
        questionText: `S${s.number}. ${s.statement}`,
        userAnswer: answers[s.id] || '(No Answer)',
        correctAnswer: s.correctAnswer,
        explanation: s.explanation,
      });
    }
  });

  activity3Data.clozeItems.forEach((c) => {
    const val = answers[`act3_b${c.id}`];
    if (!val || val.toLowerCase() !== c.correctWord.toLowerCase()) {
      missedList.push({
        activity: 'Activity 3: Cloze Passage',
        questionText: `Blank ${c.id}`,
        userAnswer: val || '(No Answer)',
        correctAnswer: c.correctWord,
        explanation: c.explanation,
      });
    }
  });

  activity4Data.questions.forEach((q) => {
    if (answers[q.id] !== q.correctAnswer) {
      missedList.push({
        activity: 'Activity 4: Chocolate Factory',
        questionText: `Q${q.number}. ${q.question}`,
        userAnswer: answers[q.id] || '(No Answer)',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      });
    }
  });

  useEffect(() => {
    if (open) {
      if (percentage >= 70) {
        triggerCelebration();
      }
      setDisplayScore(0);
      const scoreObj = { val: 0 };
      const tween = animateScoreCounter(scoreObj, totalScore, () => {
        setDisplayScore(Math.round(scoreObj.val));
      }, 0.8);

      const timer = setTimeout(() => {
        setDisplayScore(totalScore);
      }, 850);

      return () => {
        clearTimeout(timer);
        if (tween) tween.kill();
      };
    } else {
      setDisplayScore(null);
    }
  }, [open, totalScore, percentage]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const getTier = (pct: number) => {
    if (pct >= 90) return { title: 'Mastery Level • A+', color: 'text-[#347802]', bg: 'bg-[#EAF9E7] border-[#58CC02]/40' };
    if (pct >= 80) return { title: 'Proficient • A', color: 'text-sky-800', bg: 'bg-[#EAF7FF] border-sky-300' };
    if (pct >= 70) return { title: 'Competent • B', color: 'text-amber-800', bg: 'bg-[#FFF7E6] border-amber-300' };
    if (pct >= 60) return { title: 'Passing • C', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' };
    return { title: 'Needs More Practice', color: 'text-red-700', bg: 'bg-[#FEECEC] border-red-300' };
  };

  const tier = getTier(percentage);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border-2 border-slate-200 z-50 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-5 bg-slate-50 border-b-2 border-slate-200 text-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
                  Unit Review Exam Results
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium mt-0.5">
                  EN411: English for Further Studies and Future Careers
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F7F9FA]">
            {/* Score summary card */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <div className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${tier.bg} ${tier.color}`}>
                  {tier.title}
                </div>
                <h3 className="text-4xl font-display font-black text-slate-900">
                  {displayScore ?? totalScore} <span className="text-2xl font-bold text-slate-400">/ {maxScore} PTS</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-2">
                  Completed in <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{formatTime(timeSpentSeconds)}</strong> • Accuracy: <strong className="text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">{percentage}%</strong>
                </p>
              </div>

              {/* Tactile percentage badge */}
              <div className="w-28 h-28 bg-[#58CC02] border-2 border-[#46A302] border-b-4 border-b-[#46A302] text-white rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                <span className="text-3xl font-display font-black leading-none">{percentage}%</span>
                <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-md mt-1.5">
                  Final Score
                </span>
              </div>
            </div>

            {/* Breakdown by Activity */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Score by Activity Section
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block">Act 1: Marie Curie</span>
                  <span className="text-lg font-display font-black text-slate-900">{act1Score} / 10</span>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(act1Score / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block">Act 2: Work-Study</span>
                  <span className="text-lg font-display font-black text-slate-900">{act2Score} / 10</span>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(act2Score / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block">Act 3: Street Cloze</span>
                  <span className="text-lg font-display font-black text-slate-900">{act3Score} / 6</span>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200">
                    <div className="bg-[#58CC02] h-full rounded-full" style={{ width: `${(act3Score / 6) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block">Act 4: Email</span>
                  <span className="text-lg font-display font-black text-slate-900">{act4Score} / 6</span>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(act4Score / 6) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Missed Questions Diagnostic */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Review Mistakes ({missedList.length} items)
                </h4>
                {missedList.length === 0 && (
                  <span className="text-xs font-bold text-[#347802] bg-[#EAF9E7] px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02]" /> Perfect score on all activities!
                  </span>
                )}
              </div>

              {missedList.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {missedList.map((m, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-2xs text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">{m.activity}</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-red-700 font-bold">Your: {m.userAnswer}</span>
                          <span className="bg-green-50 border border-green-200 px-2 py-0.5 rounded-md text-[#347802] font-bold">Correct: {m.correctAnswer}</span>
                        </div>
                      </div>
                      <p className="font-extrabold text-slate-900 font-sans">{m.questionText}</p>
                      <p className="text-slate-600 font-sans text-xs leading-relaxed pt-1.5 border-t border-slate-100">
                        {m.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#EAF9E7] border-2 border-[#58CC02]/40 rounded-2xl p-5 text-center text-xs font-bold text-[#347802]">
                  🎉 FANTASTIC! You answered all 32 questions correctly. You are fully ready for Monday's test!
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 py-4 bg-white border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => {
                onOpenChange(false);
                onSwitchToPracticeMode();
              }}
              className="tactile-btn-white w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Review with Evidence in Practice Mode</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onRetakeExam();
                  onOpenChange(false);
                }}
                className="tactile-btn-green flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Test</span>
              </button>
              <Dialog.Close className="tactile-btn-white px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                Close
              </Dialog.Close>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
