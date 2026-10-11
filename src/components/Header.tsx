import React from 'react';
import { BookOpen, Clock, Play, Pause, RotateCcw, Sparkles, Send } from 'lucide-react';
import { QuestionGridDrawer } from './QuestionGridDrawer';

interface HeaderProps {
  mode: 'practice' | 'exam';
  onSetMode: (mode: 'practice' | 'exam') => void;
  examSecondsRemaining: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetExam: () => void;
  onOpenVocabModal: () => void;
  onSubmitExam: () => void;
  answers: Record<string, string>;
  flaggedQuestions: Set<string>;
  activeTab: string;
  onNavigateToQuestion: (tab: string, questionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSetMode,
  examSecondsRemaining,
  isTimerRunning,
  onToggleTimer,
  onResetExam,
  onOpenVocabModal,
  onSubmitExam,
  answers,
  flaggedQuestions,
  activeTab,
  onNavigateToQuestion,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const totalQuestions = 32;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 min-h-[4.25rem]">

          {/* Logo, Back Link & Course Info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <a
              href="/"
              className="tactile-btn-white inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
              title="Return to Landing Page"
              aria-label="Back to overview"
            >
              <span>←</span>
              <span className="hidden sm:inline">Overview</span>
            </a>

            <div className="w-9 h-9 rounded-2xl bg-[#58CC02] border-2 border-[#46A302] border-b-4 border-b-[#46A302] text-white flex items-center justify-center font-display text-lg font-black shrink-0 shadow-xs">
              E
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">
                  EN411 Practice Review
                </span>
                <span className="clarity-pill-green text-[10px] hidden sm:inline-block shrink-0">
                  Unit Review Test
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                English for Further Studies and Future Careers
              </p>
            </div>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex shrink-0 items-center bg-slate-100 p-1 rounded-2xl border-2 border-slate-200">
            <button
              onClick={() => onSetMode('practice')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'practice'
                  ? 'bg-white text-sky-700 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-2 border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Practice Mode</span>
            </button>
            <button
              onClick={() => onSetMode('exam')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'exam'
                  ? 'bg-white text-amber-800 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-2 border-transparent'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Mock Exam</span>
            </button>
          </div>

          {/* Right Toolbar: Timer, Vocab, Questions, Submit */}
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            
            {/* Exam Timer if in Exam mode */}
            {mode === 'exam' && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-mono font-bold transition-all ${
                  examSecondsRemaining < 300
                    ? 'bg-[#FEECEC] border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-red-950 animate-pulse'
                    : 'bg-[#FFF7E6] border-[#FFD026] border-b-4 border-b-[#E58700] text-amber-950'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(examSecondsRemaining)}</span>
                {!isTimerRunning && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-900 text-amber-100 font-extrabold text-[9px] uppercase tracking-wider animate-pulse select-none">
                    Paused
                  </span>
                )}
                <button
                  onClick={onToggleTimer}
                  className="p-1 rounded-lg hover:bg-black/5 ml-0.5 cursor-pointer"
                  title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                >
                  {isTimerRunning ? <Pause className="w-3 h-3 stroke-[2.5]" /> : <Play className="w-3 h-3 stroke-[2.5]" />}
                </button>
              </div>
            )}

            {/* Vocabulary Button */}
            <button
              onClick={onOpenVocabModal}
              className="tactile-btn-white hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700"
              title="Open Academic Vocabulary Deck"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Vocabulary</span>
            </button>

            {/* Questions Grid Drawer */}
            <QuestionGridDrawer
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              activeTab={activeTab}
              onNavigateToQuestion={onNavigateToQuestion}
            />

            {/* Exam Submit button */}
            {mode === 'exam' ? (
              <button
                onClick={onSubmitExam}
                className="tactile-btn-green inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Finish & Submit</span>
                <span className="sm:hidden">Submit</span>
              </button>
            ) : (
              <button
                onClick={onResetExam}
                className="tactile-btn-white hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-600"
                title="Reset all answer selections"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-1.5 border border-slate-200">
          <div
            className="bg-[#58CC02] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};
