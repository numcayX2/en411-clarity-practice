import React, { useState } from 'react';
import { Plus, Minus, ArrowRight, Zap } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What topics and skills are tested on the Monday review exam?",
      a: "The exam reviews English for Further Studies and Future Careers (EN411) through 4 core modules: biographical reading comprehension (Marie Curie), situational logic (Work-Study university advising), picture-based cloze vocabulary collocations (Asian street traffic), and formal business correspondence (Greenfield Chocolate Factory anniversary letter & lucky draw)."
    },
    {
      q: "How does Practice Mode help me study compared to Mock Exam Mode?",
      a: "In Practice Mode, you receive instant color-coded feedback after every question, comprehensive rationales, and a 'Locate in Story' button that points to the exact evidence in the text. In Mock Exam Mode, feedback is withheld until submission, letting you test under real 30-minute exam conditions with question flags and an authentic scorecard."
    },
    {
      q: "Why does Activity 1 feature an interactive sentence locator?",
      a: "Academic reading tests require citing direct textual evidence. Clicking 'Locate in Story' smoothly scrolls the left pane to the exact paragraph and highlights the supporting clause, helping you train rapid scanning and verification skills."
    },
    {
      q: "Are the True/False answers in Activity 2 strictly based on the text?",
      a: "Yes. Academic True/False evaluations require that any statement not directly supported by the passage (such as the student's year or schedule details) is marked False. We provide clear reasoning for each statement based on Mr. Dan's consultation."
    },
    {
      q: "Where does the picture in Activity 3 come from?",
      a: "The illustration is the authentic high-resolution watercolor artwork extracted directly from page 4 of the official review test paper, showing cyclists with baskets, mixed traffic, traditional storefronts, and distant high-rises."
    },
    {
      q: "Can I listen to the passages if I want to practice listening skills?",
      a: "Yes! Every reading passage and question features a native Web Speech API 'Listen' button. You can hear natural pronunciation for all passages and vocabulary items."
    },
    {
      q: "Will my test answers and flags be saved if I close or refresh my browser?",
      a: "Yes, all selected answers and review flags automatically sync to your browser's LocalStorage. You can refresh or leave the tab anytime without losing your work."
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white border-b-2 border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
            <div className="clarity-pill-blue">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>Questions & Answers</span>
            </div>

            <h2 className="text-section-title font-display font-black text-slate-900 tracking-tight leading-tight">
              Frequently asked review questions.
            </h2>

            <p className="text-body-clear">
              Everything you need to know about preparing for the EN411 class test on Monday, understanding the rubrics, and maximizing your score.
            </p>

            <div className="pt-2">
              <a
                href="/practice"
                className="tactile-btn-green px-6 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wide inline-flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Reviewing Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Right Column: 7 Stacked Accordion Rows */}
          <div className="lg:col-span-7 space-y-3.5">
            {faqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 overflow-hidden transition-all shadow-2xs ${
                    isOpen ? 'bg-[#F8FAFC]' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className={`w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                      isOpen ? 'bg-sky-50/50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-display text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 transition-all ${
                        isOpen ? 'bg-[#58CC02] text-white rotate-180' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${idx}`}
                      className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed font-sans border-t border-slate-100 pt-4"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
