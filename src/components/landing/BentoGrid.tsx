import React from 'react';
import { BookOpen, CheckSquare, Sparkles, Clock, Zap } from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <section id="bento" className="py-20 sm:py-28 bg-[#F7F9FA] border-b-2 border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-7 space-y-4">
            <div className="clarity-pill-blue">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>Unit Architecture</span>
            </div>
            <h2 className="text-section-title font-display font-black text-slate-900 tracking-tight leading-tight">
              Four activities. Thirty-two exam questions.
            </h2>
            <p className="text-body-clear max-w-xl">
              Engineered directly from the EN411 Unit Review curriculum. Every passage, scenario, and question is faithfully mapped with targeted pedagogical feedback.
            </p>
          </div>

          {/* Right Header Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs">
              <span className="clarity-pill-gold text-[10px] mb-2">
                Exact Syllabus
              </span>
              <h4 className="font-display font-extrabold text-sm text-slate-900 mb-1">100% Test Paper Fidelity</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Matches every reading passage, question prompt, and authentic watercolor illustration.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs">
              <span className="clarity-pill-green text-[10px] mb-2">
                Mastery Tracking
              </span>
              <h4 className="font-display font-extrabold text-sm text-slate-900 mb-1">Live Score Telemetry</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Real-time question grid tracking answered, unanswered, and flagged questions.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Card 1: Left Tinted Feature Card */}
          <div className="md:col-span-4 bg-[#EAF9E7] rounded-3xl p-7 border-2 border-[#58CC02]/30 border-b-6 border-b-[#46A302]/40 shadow-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="clarity-pill-green text-[10px]">
                  Activities 1 & 4
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white border border-green-200 flex items-center justify-center text-[#347802] shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-display text-2xl font-black text-slate-900 mb-3 leading-tight">
                Deep Reading Comprehension
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6">
                Master the biography of Marie Curie and the Greenfield Chocolate Factory business email. Locate key facts, historical dates, and vocabulary in context.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-green-200 text-xs space-y-2 shadow-2xs">
              <div className="flex items-center justify-between font-extrabold text-slate-900 font-sans">
                <span>16 Total Multiple-Choice Qs</span>
                <span className="bg-green-50 text-[#347802] px-2 py-0.5 rounded-md border border-green-200">¶1, ¶2, ¶3 Citations</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Includes full passage text, font-size zoom, and sentence-level evidence highlighting.
              </p>
            </div>
          </div>

          {/* Middle Column: Two Stacked Small Cards (md:col-span-4) */}
          <div className="md:col-span-4 space-y-5 flex flex-col justify-between">
            {/* Top Middle Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="clarity-pill-gold text-[10px]">
                    Activity 2
                  </span>
                  <CheckSquare className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-display text-xl font-extrabold text-slate-900 mb-2 leading-tight">
                  Work-Study True/False Logic
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  10 statements examining academic work hours, scholarship jeopardy, and advisor guidance with clear TRUE/FALSE rationales.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Advisor Mr. Dan dialogue</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">10 Questions</span>
              </div>
            </div>

            {/* Bottom Middle Card */}
            <div className="bg-[#F8EFFF] rounded-3xl p-6 border-2 border-purple-200 border-b-4 border-b-purple-300 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="clarity-pill text-[10px]">
                    Vocabulary
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-display text-xl font-extrabold text-slate-900 mb-2 leading-tight">
                  Bilingual Thai Academic Deck
                </h4>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  15 curated key terms (groundbreaking, scholarship, chaotic, complimentary) with native audio pronunciation and Thai definitions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-between text-[11px] font-bold text-purple-800">
                <span>Phonetic & Audio Guides</span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200">แปลไทยครบ</span>
              </div>
            </div>
          </div>

          {/* Card 4: Right Anchor Card */}
          <div className="md:col-span-4 bg-slate-900 text-white rounded-3xl p-7 border-2 border-slate-800 border-b-6 border-b-slate-950 shadow-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-[#58CC02] text-white text-[10px] font-bold uppercase tracking-wider">
                  Exam Simulator
                </span>
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-sky-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-display text-2xl font-black text-white mb-3 leading-tight">
                30-Minute Mock Exam Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mb-6">
                Simulate the pressure of the Monday test hall. Features an active countdown timer, question flags, and a review scorecard with celebratory confetti.
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-sky-300">
                <span>Countdown Timer</span>
                <span>30:00</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-[#58CC02] h-full w-3/4 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Reveals diagnostics only after final submission for zero spoilers.
              </p>
            </div>
          </div>

          {/* Bottom Wide Card 1: Activity 3 Cloze */}
          <div className="md:col-span-6 bg-white rounded-3xl p-7 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
              <img
                src="/activity3-street.jpg"
                alt="Asian street scene watercolor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2 text-left">
              <span className="clarity-pill-green text-[10px]">
                Activity 3 • Artwork Cloze
              </span>
              <h4 className="font-display text-xl font-extrabold text-slate-900 leading-tight">
                Authentic Watercolor Collocations
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                6 interactive blanks with word bank chips: <em>numerous, some, transportation, cyclists, destination, can be seen</em>.
              </p>
            </div>
          </div>

          {/* Bottom Wide Card 2: Diagnostic Scorecard */}
          <div className="md:col-span-6 bg-white rounded-3xl p-7 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-44 h-36 rounded-2xl bg-[#EAF7FF] text-sky-950 border border-sky-200 p-4 flex flex-col justify-between shrink-0 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-white/90 border border-sky-200 px-2 py-0.5 rounded-md inline-block w-fit">
                Scorecard
              </span>
              <div>
                <span className="text-3xl font-black font-display block text-sky-900">32 / 32</span>
                <span className="text-[10px] block text-sky-700 font-bold uppercase">100% Mastery • Grade A+</span>
              </div>
              <span className="text-[9px] text-sky-600 font-semibold">GSAP Animated Reveal</span>
            </div>
            <div className="flex-1 space-y-2 text-left">
              <span className="clarity-pill-blue text-[10px]">
                Diagnostics & Retrieval
              </span>
              <h4 className="font-display text-xl font-extrabold text-slate-900 leading-tight">
                Targeted Mistake Breakdown
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Review every incorrect choice side-by-side with official answers and citations so you never repeat the same mistake.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
