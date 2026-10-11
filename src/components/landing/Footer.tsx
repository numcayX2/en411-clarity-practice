import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-white pt-16 pb-0 border-t-2 border-slate-200 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Logo & Disclaimer Left, Newsletter Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b-2 border-slate-100 items-start">
          
          {/* Left: Logo & Disclaimer */}
          <div className="lg:col-span-6 space-y-4">
            <a href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#58CC02] border-b-2 border-[#46A302] text-white flex items-center justify-center font-display text-xl font-black shadow-xs">
                E
              </div>
              <span className="font-display text-2xl font-black tracking-tight text-slate-900">
                EN411 REVIEW
              </span>
            </a>

            <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed max-w-md">
              EN411: English for Further Studies and Future Careers • Unit Review Practice Platform. Built for university students preparing for the Monday class assessment.
            </p>
          </div>

          {/* Right: Newsletter / Test Reminders Blurb & Input Pill */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="font-display text-lg font-black text-slate-900">
              Stay updated on review sessions & practice sets
            </h4>
            <p className="text-xs text-slate-500 font-sans">
              Get practice reminders, vocabulary flashcard updates, and sample answer keys sent to your inbox.
            </p>

            {subscribed ? (
              <div className="p-3.5 rounded-2xl bg-[#EAF9E7] border-2 border-[#58CC02]/40 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#58CC02] stroke-[2.5]" />
                <span>You're subscribed! Good luck on Monday's test!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your student email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2.5 text-xs bg-[#F7F9FA] text-slate-800 border-2 border-slate-200 rounded-xl focus:border-[#58CC02] focus:bg-white focus:outline-none font-sans transition-all"
                />
                <button
                  type="submit"
                  className="tactile-btn-green px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Link Columns */}
        <div className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs font-sans">
          <div>
            <h5 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#58CC02]" />
              Activities
            </h5>
            <ul className="space-y-2 text-slate-600 font-bold">
              <li><a href="/practice?tab=act1" className="hover:text-emerald-600 transition-colors">Act 1: Marie Curie (MCQ)</a></li>
              <li><a href="/practice?tab=act2" className="hover:text-emerald-600 transition-colors">Act 2: Work-Study (T/F)</a></li>
              <li><a href="/practice?tab=act3" className="hover:text-emerald-600 transition-colors">Act 3: Street Cloze</a></li>
              <li><a href="/practice?tab=act4" className="hover:text-emerald-600 transition-colors">Act 4: Chocolate Factory</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Modes
            </h5>
            <ul className="space-y-2 text-slate-600 font-bold">
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Practice & Learn Mode</a></li>
              <li><a href="/practice?mode=exam" className="hover:text-emerald-600 transition-colors">Mock Exam Simulation (30m)</a></li>
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Scorecard Diagnostic</a></li>
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Mistake Review</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Study Tools
            </h5>
            <ul className="space-y-2 text-slate-600 font-bold">
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Academic Vocabulary Deck</a></li>
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Text-to-Speech Narrator</a></li>
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Sentence Evidence Locator</a></li>
              <li><a href="/practice" className="hover:text-emerald-600 transition-colors">Progress Auto-Save</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Course Details
            </h5>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li>EN411 Course Curriculum</li>
              <li>English for Further Studies</li>
              <li>Future Careers Preparation</li>
              <li>Unit Review Class Assessment</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Tactile Display Wordmark (~28vw) with gentle fade */}
      <div className="w-full flex justify-center items-start overflow-hidden h-36 sm:h-52 md:h-64 lg:h-76 select-none pointer-events-none mt-4 border-t-2 border-slate-100">
        <span className="font-display font-black text-[28vw] leading-none tracking-tight bg-gradient-to-b from-slate-200/80 via-slate-100/30 to-transparent bg-clip-text text-transparent transform translate-y-3 sm:translate-y-6">
          EN411
        </span>
      </div>

    </footer>
  );
};

