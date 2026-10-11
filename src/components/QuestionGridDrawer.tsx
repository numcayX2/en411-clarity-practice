import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { activity1Data, activity2Data, activity3Data, activity4Data } from '../data/examData';
import { LayoutGrid, X } from 'lucide-react';

interface QuestionGridDrawerProps {
  answers: Record<string, string>;
  flaggedQuestions: Set<string>;
  activeTab: string;
  onNavigateToQuestion: (tab: string, questionId: string) => void;
}

export const QuestionGridDrawer: React.FC<QuestionGridDrawerProps> = ({
  answers,
  flaggedQuestions,
  onNavigateToQuestion,
}) => {
  const sections = [
    {
      tab: 'act1',
      title: 'Activity 1: Marie Curie (MCQ)',
      items: activity1Data.questions.map((q) => ({
        id: q.id,
        label: `${q.number}`,
        answered: !!answers[q.id],
        flagged: flaggedQuestions.has(q.id),
      })),
    },
    {
      tab: 'act2',
      title: 'Activity 2: Work-Study (True/False)',
      items: activity2Data.statements.map((s) => ({
        id: s.id,
        label: `${s.number}`,
        answered: !!answers[s.id],
        flagged: flaggedQuestions.has(s.id),
      })),
    },
    {
      tab: 'act3',
      title: 'Activity 3: Street Scene (Cloze)',
      items: activity3Data.clozeItems.map((c) => ({
        id: `act3_b${c.id}`,
        label: `B${c.id}`,
        answered: !!answers[`act3_b${c.id}`],
        flagged: flaggedQuestions.has(`act3_b${c.id}`),
      })),
    },
    {
      tab: 'act4',
      title: 'Activity 4: Chocolate Factory (MCQ)',
      items: activity4Data.questions.map((q) => ({
        id: q.id,
        label: `${q.number}`,
        answered: !!answers[q.id],
        flagged: flaggedQuestions.has(q.id),
      })),
    },
  ];

  const totalQuestions = 32;
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const flaggedCount = flaggedQuestions.size;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="tactile-btn-white relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700"
          title="Open question navigator grid"
        >
          <LayoutGrid className="w-4 h-4 text-sky-600" />
          <span>Questions</span>
          <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold">
            {answeredCount}/{totalQuestions}
          </span>
          {flaggedCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -top-1 -right-1 ring-2 ring-white" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="w-[90vw] sm:w-[380px] max-h-[85vh] bg-white rounded-3xl shadow-xl border-2 border-slate-200 p-5 z-50 overflow-y-auto animate-scale-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900">Question Navigator</h3>
              <p className="text-[11px] text-slate-500 font-medium">Jump directly to any item</p>
            </div>
            <Popover.Close className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </Popover.Close>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#58CC02]" /> Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200" /> Open
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" /> Flagged
            </span>
          </div>

          {/* Section grids */}
          <div className="space-y-4">
            {sections.map((sec) => (
              <div key={sec.tab} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>{sec.title}</span>
                  <span className="text-[10px] font-extrabold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-500">
                    {sec.items.filter((i) => i.answered).length}/{sec.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sec.items.map((item) => (
                    <Popover.Close asChild key={item.id}>
                      <button
                        onClick={() => onNavigateToQuestion(sec.tab, item.id)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                          item.flagged
                            ? 'bg-[#FFF7E6] text-amber-900 border-2 border-[#FF9600] border-b-4 border-b-[#E58700] active:border-b-2'
                            : item.answered
                            ? 'bg-[#EAF9E7] text-[#347802] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] active:border-b-2'
                            : 'tactile-btn-white'
                        }`}
                      >
                        {item.label}
                        {item.flagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                        )}
                      </button>
                    </Popover.Close>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
