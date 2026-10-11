import React from 'react';
import { ArrowRight, Sparkles, Clock, CheckCircle2, Zap } from 'lucide-react';

export const CtaBand: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#F7F9FA] border-t-2 border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tactile Clarity Banner Card */}
        <div className="rounded-3xl p-8 sm:p-14 lg:p-16 text-center bg-gradient-to-br from-emerald-50 via-sky-50/60 to-emerald-50/80 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-tactile relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            
            {/* Eyebrow badge */}
            <div className="clarity-pill-green mb-6 py-1.5 px-4 shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>FINAL REVIEW SPRINT</span>
            </div>

            {/* Headline */}
            <h2 className="text-display font-display font-black text-slate-900 tracking-tight leading-tight-title mb-5">
              Ready to test your readiness for Monday?
            </h2>

            {/* Subcopy */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-sans leading-relaxed mb-8 max-w-xl">
              Run through the full 32-question review simulation now. Retake as many times as you need to achieve 100% confidence.
            </p>

            {/* Tactile Chunky buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <a
                href="/practice?mode=exam"
                className="tactile-btn-green w-full sm:w-auto px-8 py-4 text-sm font-extrabold uppercase tracking-wide group"
              >
                <span>Start Full Exam Simulation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="/practice"
                className="tactile-btn-white w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-700"
              >
                Practice Untimed
              </a>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-sans font-bold text-slate-700">
              <span className="tactile-card px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#58CC02] stroke-[2.5]" /> 32 Verified Questions
              </span>
              <span className="tactile-card px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-4 h-4 text-sky-500 stroke-[2.5]" /> 30-Minute Timer
              </span>
              <span className="tactile-card px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-500 stroke-[2.5]" /> Free & Unlimited Retakes
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

