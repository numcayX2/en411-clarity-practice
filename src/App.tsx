import { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { Header } from './components/Header';
import { Activity1MarieCurie } from './components/Activity1MarieCurie';
import { Activity2TrueFalse } from './components/Activity2TrueFalse';
import { Activity3PictureCloze } from './components/Activity3PictureCloze';
import { Activity4ChocolateFactory } from './components/Activity4ChocolateFactory';
import { VocabularyModal } from './components/VocabularyModal';
import { ExamResultsModal } from './components/ExamResultsModal';
import { activity1Data, activity2Data, activity3Data, activity4Data } from './data/examData';
import { BookOpen, AlertCircle, FileCheck } from 'lucide-react';
import gsap from 'gsap';

export function App() {
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [activeTab, setActiveTab] = useState<string>('act1');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const [activeHighlight, setActiveHighlight] = useState<{ quote: string | null; paragraphId: number | null }>({
    quote: null,
    paragraphId: null,
  });

  const [vocabModalOpen, setVocabModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Timer states
  const INITIAL_EXAM_SECONDS = 30 * 60; // 30 minutes
  const [examSecondsRemaining, setExamSecondsRemaining] = useState<number>(INITIAL_EXAM_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const activityNavRef = useRef<HTMLDivElement>(null);
  const isHydratedRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState<number>(79);

  // Read LocalStorage and URL search params once on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAnswers = localStorage.getItem('en411_answers');
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }

        const savedFlagged = localStorage.getItem('en411_flagged');
        if (savedFlagged) {
          setFlaggedQuestions(new Set(JSON.parse(savedFlagged)));
        }

        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['act1', 'act2', 'act3', 'act4'].includes(tabParam)) {
          setActiveTab(tabParam);
        }

        const modeParam = params.get('mode');
        const savedMode = localStorage.getItem('en411_mode');
        if (modeParam === 'exam' || (!modeParam && savedMode === 'exam')) {
          setMode('exam');
          setIsTimerRunning(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        isHydratedRef.current = true;
      }
    }
  }, []);

  // Sync state to LocalStorage (only after initial load)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('en411_answers', JSON.stringify(answers));
    } catch (e) {
      console.error(e);
    }
  }, [answers]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('en411_flagged', JSON.stringify(Array.from(flaggedQuestions)));
    } catch (e) {
      console.error(e);
    }
  }, [flaggedQuestions]);

  // Timer tick
  useEffect(() => {
    let interval: any;
    if (mode === 'exam' && isTimerRunning && examSecondsRemaining > 0) {
      interval = setInterval(() => {
        setExamSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResultsModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, isTimerRunning, examSecondsRemaining]);

  useEffect(() => {
    const measure = () => {
      const headerEl = document.querySelector('header');
      const headerH = headerEl ? headerEl.offsetHeight : 79;
      const navEl = activityNavRef.current;
      const navH = navEl && getComputedStyle(navEl).position === 'sticky' ? navEl.offsetHeight : 0;
      setHeaderHeight(headerH);
      document.documentElement.style.setProperty('--app-chrome-top', `${headerH + navH + 8}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    const headerEl = document.querySelector('header');
    if (headerEl) observer.observe(headerEl);
    if (activityNavRef.current) observer.observe(activityNavRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mode, activeTab]);

  const handleSetMode = (newMode: 'practice' | 'exam') => {
    setMode(newMode);
    try {
      localStorage.setItem('en411_mode', newMode);
    } catch {}
    if (newMode === 'exam') {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleResetExam = () => {
    if (window.confirm('Are you sure you want to clear all your answers?')) {
      setAnswers({});
      setFlaggedQuestions(new Set());
      setExamSecondsRemaining(INITIAL_EXAM_SECONDS);
      setTimeSpentSeconds(0);
      try {
        localStorage.removeItem('en411_answers');
        localStorage.removeItem('en411_flagged');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRetakeExam = () => {
    setAnswers({});
    setFlaggedQuestions(new Set());
    setExamSecondsRemaining(INITIAL_EXAM_SECONDS);
    setTimeSpentSeconds(0);
    setIsTimerRunning(true);
  };

  const handleNavigateToQuestion = (tab: string, questionId: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      const el = document.getElementById(`q-${questionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleSubmitExamClick = () => {
    setConfirmSubmitOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmSubmitOpen(false);
    setIsTimerRunning(false);
    setResultsModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveHighlight({ quote: null, paragraphId: null });
    if (mainContainerRef.current) {
      gsap.fromTo(
        mainContainerRef.current,
        { opacity: 0.7, y: 6 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const unansweredCount = 32 - answeredCount;

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        mode={mode}
        onSetMode={handleSetMode}
        examSecondsRemaining={examSecondsRemaining}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onResetExam={handleResetExam}
        onOpenVocabModal={() => setVocabModalOpen(true)}
        onSubmitExam={handleSubmitExamClick}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        activeTab={activeTab}
        onNavigateToQuestion={handleNavigateToQuestion}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        {/* Practice Mode Alert / Helper Banner */}
        {mode === 'practice' && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                <span className="clarity-pill-blue mr-2 text-[11px]">
                  Study & Practice Active
                </span>
                Instant answer rationales, phonetic guides, and <span className="font-extrabold text-slate-900 underline decoration-sky-400">sentence evidence locators</span> are enabled for all 4 activities.
              </p>
            </div>
            <button
              onClick={() => handleSetMode('exam')}
              className="tactile-btn-white px-4 py-2 text-xs font-bold text-slate-700 shrink-0 self-start sm:self-center"
            >
              Switch to Mock Exam →
            </button>
          </div>
        )}

        {/* Tab Navigation for 4 Activities */}
        <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="space-y-5 sm:space-y-6">

          {/* Activity switcher */}
          <div
            ref={activityNavRef}
            style={{ top: headerHeight }}
            className="lg:sticky lg:z-30 lg:bg-[#F7F9FA]/95 lg:py-3 lg:backdrop-blur-md"
          >
            <Tabs.List className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 rounded-2xl border-2 border-slate-300/80 sm:gap-3 lg:grid-cols-4">
            
            {/* Tab 1 */}
            <Tabs.Trigger
              value="act1"
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl p-3 text-left transition-all cursor-pointer focus-visible:outline-none ${
                activeTab === 'act1'
                  ? 'bg-white text-slate-900 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                  Act 1 (10 Qs)
                </span>
                <span className="font-display font-extrabold text-xs sm:text-sm block truncate">
                  Marie Curie Story
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-[#EAF7FF] text-[#0C7BB0] border border-sky-200">
                {activity1Data.questions.filter((q) => answers[q.id]).length}/10
              </span>
            </Tabs.Trigger>

            {/* Tab 2 */}
            <Tabs.Trigger
              value="act2"
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl p-3 text-left transition-all cursor-pointer focus-visible:outline-none ${
                activeTab === 'act2'
                  ? 'bg-white text-slate-900 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                  Act 2 (10 Qs)
                </span>
                <span className="font-display font-extrabold text-xs sm:text-sm block truncate">
                  Work-Study True/False
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-[#FFF7E6] text-[#A65E00] border border-amber-200">
                {activity2Data.statements.filter((s) => answers[s.id]).length}/10
              </span>
            </Tabs.Trigger>

            {/* Tab 3 */}
            <Tabs.Trigger
              value="act3"
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl p-3 text-left transition-all cursor-pointer focus-visible:outline-none ${
                activeTab === 'act3'
                  ? 'bg-white text-slate-900 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                  Act 3 (6 Blanks)
                </span>
                <span className="font-display font-extrabold text-xs sm:text-sm block truncate">
                  Picture Cloze & Bank
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-[#EAF9E7] text-[#347802] border border-green-200">
                {activity3Data.clozeItems.filter((c) => answers[`act3_b${c.id}`]).length}/6
              </span>
            </Tabs.Trigger>

            {/* Tab 4 */}
            <Tabs.Trigger
              value="act4"
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl p-3 text-left transition-all cursor-pointer focus-visible:outline-none ${
                activeTab === 'act4'
                  ? 'bg-white text-slate-900 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border-2 border-transparent'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                  Act 4 (6 Qs)
                </span>
                <span className="font-display font-extrabold text-xs sm:text-sm block truncate">
                  Chocolate Factory Email
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-[#F8EFFF] text-[#8C3BE2] border border-purple-200">
                {activity4Data.questions.filter((q) => answers[q.id]).length}/6
              </span>
            </Tabs.Trigger>

            </Tabs.List>
          </div>

          {/* Tab Panes */}
          <div ref={mainContainerRef}>
            <Tabs.Content value="act1">
              <Activity1MarieCurie
                answers={answers}
                onSelectAnswer={handleSelectAnswer}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={handleToggleFlag}
                mode={mode}
                activeHighlight={activeHighlight}
                onSetHighlight={(quote, paragraphId) => setActiveHighlight({ quote, paragraphId })}
              />
            </Tabs.Content>

            <Tabs.Content value="act2">
              <Activity2TrueFalse
                answers={answers}
                onSelectAnswer={handleSelectAnswer}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={handleToggleFlag}
                mode={mode}
              />
            </Tabs.Content>

            <Tabs.Content value="act3">
              <Activity3PictureCloze
                answers={answers}
                onSelectAnswer={handleSelectAnswer}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={handleToggleFlag}
                mode={mode}
              />
            </Tabs.Content>

            <Tabs.Content value="act4">
              <Activity4ChocolateFactory
                answers={answers}
                onSelectAnswer={handleSelectAnswer}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={handleToggleFlag}
                mode={mode}
                activeHighlight={activeHighlight}
                onSetHighlight={(quote, paragraphId) => setActiveHighlight({ quote, paragraphId })}
              />
            </Tabs.Content>
          </div>

        </Tabs.Root>

      </main>

      {/* Vocabulary Modal */}
      <VocabularyModal
        open={vocabModalOpen}
        onOpenChange={setVocabModalOpen}
      />

      {/* Exam Results Modal */}
      <ExamResultsModal
        open={resultsModalOpen}
        onOpenChange={setResultsModalOpen}
        answers={answers}
        timeSpentSeconds={timeSpentSeconds}
        onRetakeExam={handleRetakeExam}
        onSwitchToPracticeMode={() => setMode('practice')}
      />

      {/* Submission Confirmation Modal */}
      <Dialog.Root open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-200 z-50 animate-scale-in">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 rounded-2xl bg-green-100 text-[#347802]">
                <FileCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-display font-extrabold text-slate-900">
                  Ready to Submit Exam?
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium">
                  Review your progress summary before generating your scorecard.
                </Dialog.Description>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 mb-5 space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Answered questions:</span>
                <span className="font-extrabold text-slate-900">{answeredCount} of 32</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Unanswered questions:</span>
                <span className={`font-extrabold ${unansweredCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {unansweredCount} remaining
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Flagged for review:</span>
                <span className="font-extrabold text-amber-700">{flaggedQuestions.size} flagged</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-900 font-semibold bg-[#FFF7E6] p-3 rounded-xl border border-amber-300 mb-5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>Notice: You still have {unansweredCount} unanswered questions!</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="tactile-btn-white px-4 py-2 rounded-xl text-xs font-bold text-slate-700"
              >
                Keep Working
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="tactile-btn-green px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide"
              >
                Yes, Submit Now
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 bg-white py-6 mt-10 sm:mt-12 text-center text-xs font-medium text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            EN411: English for Further Studies and Future Careers • Unit Review Class Test Preparation
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Tactile Clarity Engine</span>
            <span>•</span>
            <button
              onClick={() => setVocabModalOpen(true)}
              className="text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
            >
              Vocabulary Deck
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
