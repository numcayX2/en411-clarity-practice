import React from 'react';
import { ArrowRight, CheckCircle2, Bookmark, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#EBF5FF] via-[#F4F9FD] to-[#F7F9FA] border-b-2 border-slate-200">
      
      {/* Ticker Marquee Bar */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-xs border-b border-sky-100 py-1.5 px-4 overflow-hidden whitespace-nowrap z-20 flex">
        <div className="flex gap-8 w-max shrink-0 text-xs font-bold uppercase tracking-wider text-sky-800 animate-marquee">
          <span>⚡ MONDAY CLASS TEST PREP</span>
          <span>★ 32 AUTHENTIC QUESTIONS</span>
          <span>⚡ EVIDENCE LOCATOR ACTIVE</span>
          <span>★ NATIVE AUDIO NARRATOR</span>
          <span>⚡ 30-MINUTE EXAM SIMULATOR</span>
          <span>★ 100% EXAM PAPER FIDELITY</span>
          <span>⚡ MONDAY CLASS TEST PREP</span>
          <span>★ 32 AUTHENTIC QUESTIONS</span>
          <span>⚡ EVIDENCE LOCATOR ACTIVE</span>
          <span>★ NATIVE AUDIO NARRATOR</span>
          <span>⚡ 30-MINUTE EXAM SIMULATOR</span>
          <span>★ 100% EXAM PAPER FIDELITY</span>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center mt-6">
        
        {/* Eyebrow sticker badge */}
        <div className="clarity-pill-blue mb-6 py-1.5 px-4">
          <Zap className="w-3.5 h-3.5 fill-current text-sky-600" />
          <span>Unit Review Exam • Monday Preparation</span>
        </div>

        {/* Large punchy headline */}
        <h1 className="text-display font-display text-slate-900 max-w-4xl tracking-tight mb-6">
          Master every activity with{' '}
          <span className="text-[#347802] bg-[#EAF9E7] px-3.5 py-1 rounded-2xl border border-[#58CC02]/30 inline-block">
            confidence.
          </span>
        </h1>

        {/* Two-line sans subcopy */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-sans leading-relaxed mb-10">
          Interactive exam training suite for <strong>EN411: English for Further Studies and Future Careers</strong>.
          Complete with paragraph-level evidence locators, native audio narration, and full mock exam telemetry.
        </p>

        {/* Two chunky buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 sm:mb-20">
          <a
            href="/practice"
            className="tactile-btn-green w-full sm:w-auto px-8 py-4 text-sm font-extrabold uppercase tracking-wide group"
          >
            <span>Start Practice Test</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href="#how-it-works"
            className="tactile-btn-white w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-700"
          >
            Explore 4 Activities
          </a>
        </div>

        {/* Two tilted phone-shaped product mockups floating below, cropped by section edge */}
        <div className="relative w-full max-w-4xl h-[340px] sm:h-[420px] flex justify-center items-end">
          
          {/* Left phone: Marie Curie Reading Mockup */}
          <div className="absolute left-4 sm:left-12 bottom-[-90px] sm:bottom-[-60px] w-[270px] sm:w-[320px] h-[480px] sm:h-[520px] bg-white rounded-[36px] p-3 shadow-2xl border-2 border-slate-200 border-b-6 border-b-slate-300 transform -rotate-6 hover:-rotate-3 transition-transform duration-300 overflow-hidden select-none">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-3.5 bg-slate-200 rounded-full mx-auto mb-3" />
            
            {/* Phone Screen Content */}
            <div className="bg-[#F7F9FA] rounded-[24px] p-4 h-[calc(100%-28px)] overflow-hidden flex flex-col text-left border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="clarity-pill-blue text-[10px]">
                  Activity 1 • MCQ
                </span>
                <span className="text-[10px] font-bold text-slate-400">Q1 of 10</span>
              </div>
              <h4 className="font-display text-sm font-black text-slate-900 mb-1 leading-tight">
                What is Marie Curie famous for?
              </h4>
              <p className="text-[11px] text-slate-500 mb-3 leading-snug font-sans">
                "She became well known for her groundbreaking research on..."
              </p>

              {/* Options */}
              <div className="space-y-2 flex-1">
                <div className="tactile-btn-white w-full p-2.5 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-slate-100 text-[10px] font-bold flex items-center justify-center">A</span>
                  <span>Discovering gravity</span>
                </div>
                <div className="w-full p-2.5 rounded-xl bg-[#EAF9E7] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-[11px] font-extrabold text-green-950 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-[#58CC02] text-white text-[10px] font-bold flex items-center justify-center">B</span>
                    <span>Research on radioactivity</span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02]" />
                </div>
                <div className="tactile-btn-white w-full p-2.5 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-slate-100 text-[10px] font-bold flex items-center justify-center">C</span>
                  <span>Inventing the telephone</span>
                </div>
              </div>

              {/* Highlight callout pill */}
              <div className="mt-2 p-2 rounded-xl bg-[#FFF7E6] border border-amber-200 text-[10px] text-amber-900 font-bold flex items-center gap-1.5">
                <Bookmark className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Evidence highlighted in Paragraph 1</span>
              </div>
            </div>
          </div>

          {/* Right phone: Activity 3 Cloze Watercolor Mockup */}
          <div className="absolute right-4 sm:right-12 bottom-[-90px] sm:bottom-[-60px] w-[270px] sm:w-[320px] h-[480px] sm:h-[520px] bg-white rounded-[36px] p-3 shadow-2xl border-2 border-slate-200 border-b-6 border-b-slate-300 transform rotate-6 hover:rotate-3 transition-transform duration-300 overflow-hidden select-none">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-3.5 bg-slate-200 rounded-full mx-auto mb-3" />
            
            {/* Phone Screen Content */}
            <div className="bg-[#F7F9FA] rounded-[24px] p-3.5 h-[calc(100%-28px)] overflow-hidden flex flex-col text-left border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="clarity-pill-green text-[10px]">
                  Activity 3 • Visual Cloze
                </span>
                <span className="clarity-pill text-[10px]">6 Blanks</span>
              </div>

              {/* Thumbnail of authentic artwork */}
              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 mb-2 shadow-2xs">
                <img
                  src="/activity3-street.jpg"
                  alt="Street Scene"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Word bank chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#EAF7FF] border border-sky-200 text-sky-800 text-[9px] font-bold">numerous</span>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[9px] font-bold">cyclists</span>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[9px] font-bold">transportation</span>
              </div>

              {/* Cloze text preview */}
              <p className="text-[10px] text-slate-600 font-sans leading-relaxed line-clamp-3">
                "...with <strong className="text-green-800 bg-green-50 px-1 border border-green-200 rounded font-bold">numerous</strong> bicycles and motor vehicles sharing the road..."
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
