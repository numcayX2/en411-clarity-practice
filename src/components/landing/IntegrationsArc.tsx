import React from 'react';
import { ArrowRight, Volume2, Search, Clock, BookOpen, LayoutGrid, Zap } from 'lucide-react';

export const IntegrationsArc: React.FC = () => {
  const tools = [
    {
      name: "Evidence Locator",
      icon: <Search className="w-6 h-6 text-amber-700" />,
      size: "w-16 h-16 sm:w-[72px] sm:h-[72px]",
      pos: "top-4 left-4 sm:left-14",
      bg: "bg-[#FFF7E6] border-amber-300 border-b-amber-400",
    },
    {
      name: "Native Audio Narrator",
      icon: <Volume2 className="w-5 h-5 text-sky-700" />,
      size: "w-14 h-14 sm:w-[62px] sm:h-[62px]",
      pos: "top-2 right-6 sm:right-18",
      bg: "bg-[#EAF7FF] border-sky-300 border-b-sky-400",
    },
    {
      name: "30m Exam Timer",
      icon: <Clock className="w-7 h-7 text-green-700" />,
      size: "w-18 h-18 sm:w-[76px] sm:h-[76px]",
      pos: "bottom-12 left-2 sm:left-8",
      bg: "bg-[#EAF9E7] border-green-300 border-b-green-400",
    },
    {
      name: "Bilingual Vocabulary",
      icon: <BookOpen className="w-6 h-6 text-purple-700" />,
      size: "w-16 h-16 sm:w-[66px] sm:h-[66px]",
      pos: "bottom-10 right-4 sm:right-12",
      bg: "bg-[#F8EFFF] border-purple-300 border-b-purple-400",
    },
    {
      name: "Question Navigator",
      icon: <LayoutGrid className="w-5 h-5 text-slate-700" />,
      size: "w-14 h-14 sm:w-[60px] sm:h-[60px]",
      pos: "-top-6 left-1/2 -translate-x-1/2",
      bg: "bg-white border-slate-300 border-b-slate-400",
    },
  ];

  return (
    <section id="toolkit" className="py-20 sm:py-28 bg-[#F7F9FA] border-b-2 border-slate-200 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        
        {/* Floating Tool Circles Arc */}
        <div className="relative py-12 px-4 sm:px-12">
          {tools.map((t, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              aria-label={t.name}
              className={`absolute ${t.pos} ${t.size} rounded-2xl ${t.bg} border-2 border-b-4 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-108 hover:-translate-y-1 focus:scale-108 focus:outline-none z-20 group cursor-default`}
              title={t.name}
            >
              {t.icon}
              <span className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap pointer-events-none z-30">
                {t.name}
              </span>
            </div>
          ))}

          {/* Centered Text Block */}
          <div className="relative z-10 max-w-2xl mx-auto py-12 flex flex-col items-center">
            <div className="clarity-pill-blue mb-5">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>Study Toolkit</span>
            </div>

            <h2 className="text-section-title font-display font-black text-slate-900 tracking-tight leading-tight mb-5">
              Built-in tools that make studying feel effortless.
            </h2>

            <p className="text-body-clear max-w-lg mb-8">
              From sentence-level evidence locators to instant vocabulary audio, every tool is calibrated for high score retention and exam readiness.
            </p>

            <a
              href="/practice?mode=exam"
              className="tactile-btn-green px-8 py-4 text-xs sm:text-sm font-extrabold uppercase tracking-wide inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Try Mock Exam Mode</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
