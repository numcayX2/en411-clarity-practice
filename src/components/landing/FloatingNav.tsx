import React, { useState } from 'react';
import { ChevronDown, ArrowRight, BookOpen, Sparkles, Clock, FileText, Menu, X } from 'lucide-react';

export const FloatingNav: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-5 left-0 right-0 z-50 px-4 flex flex-col items-center pointer-events-none">
      <nav className="pointer-events-auto max-w-4xl w-full bg-white/95 backdrop-blur-md border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-2xl px-5 py-2.5 flex items-center justify-between gap-4 transition-all shadow-sm">
        
        {/* Logo Mark Left */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#58CC02] border-2 border-[#46A302] border-b-4 border-b-[#46A302] text-white flex items-center justify-center font-display text-base font-black shadow-xs transition-transform group-hover:-translate-y-0.5">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-black leading-none tracking-tight text-slate-900">
              EN411
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Clarity Review
            </span>
          </div>
        </a>

        {/* Centred Text Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          {/* Dropdown Link */}
          <div className="relative" onMouseLeave={() => setDropdownOpen(false)}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 hover:text-slate-900 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <span>Activities</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-xl border-2 border-slate-200 border-b-4 border-b-slate-300 p-2 animate-scale-in">
                <a
                  href="/practice?tab=act1"
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="p-1.5 bg-sky-100 border border-sky-200 rounded-lg text-sky-700 mt-0.5 shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-slate-900">Activity 1: Marie Curie</span>
                    <span className="text-[10px] text-slate-500 font-medium">Reading comprehension • 10 Qs</span>
                  </div>
                </a>
                <a
                  href="/practice?tab=act2"
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="p-1.5 bg-amber-100 border border-amber-200 rounded-lg text-amber-700 mt-0.5 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-slate-900">Activity 2: Work-Study</span>
                    <span className="text-[10px] text-slate-500 font-medium">True / False analysis • 10 Qs</span>
                  </div>
                </a>
                <a
                  href="/practice?tab=act3"
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="p-1.5 bg-green-100 border border-green-200 rounded-lg text-green-700 mt-0.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-slate-900">Activity 3: Street Cloze</span>
                    <span className="text-[10px] text-slate-500 font-medium">Picture & word bank • 6 blanks</span>
                  </div>
                </a>
                <a
                  href="/practice?tab=act4"
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="p-1.5 bg-purple-100 border border-purple-200 rounded-lg text-purple-700 mt-0.5 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-slate-900">Activity 4: Chocolate Factory</span>
                    <span className="text-[10px] text-slate-500 font-medium">Business email • 6 Qs</span>
                  </div>
                </a>
              </div>
            )}
          </div>

          <a href="#how-it-works" className="hover:text-slate-900 px-2 py-1 rounded-lg transition-colors">
            How It Works
          </a>
          <a href="#toolkit" className="hover:text-slate-900 px-2 py-1 rounded-lg transition-colors">
            Toolkit
          </a>
          <a href="#bento" className="hover:text-slate-900 px-2 py-1 rounded-lg transition-colors">
            Architecture
          </a>
          <a href="#faq" className="hover:text-slate-900 px-2 py-1 rounded-lg transition-colors">
            FAQ
          </a>
        </div>

        {/* Right Actions: Mobile Toggle & Tactile CTA */}
        <div className="flex items-center gap-2">
          <a
            href="/practice"
            className="tactile-btn-green inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide group"
          >
            <span>Start Practicing</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border-2 border-slate-200"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-2 max-w-4xl w-full bg-white/98 backdrop-blur-md border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-2xl p-4 shadow-xl space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center border border-slate-200"
            >
              How It Works
            </a>
            <a
              href="#toolkit"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center border border-slate-200"
            >
              Toolkit
            </a>
            <a
              href="#bento"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center border border-slate-200"
            >
              Architecture
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center border border-slate-200"
            >
              FAQ
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Activities
            </span>
            <div className="space-y-1.5">
              <a
                href="/practice?tab=act1"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Act 1: Marie Curie (10 Qs)</span>
              </a>
              <a
                href="/practice?tab=act2"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Act 2: Work-Study (10 Qs)</span>
              </a>
              <a
                href="/practice?tab=act3"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                <span>Act 3: Street Cloze (6 Blanks)</span>
              </a>
              <a
                href="/practice?tab=act4"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Act 4: Chocolate Factory (6 Qs)</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
