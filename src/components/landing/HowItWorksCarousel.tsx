import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, Sparkles, Zap } from 'lucide-react';

export const HowItWorksCarousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      eyebrow: "STEP 01 • READING COMPREHENSION",
      title: "Interactive passage evidence locators.",
      description: "Never guess where an answer came from. Clicking 'Locate in Story' instantly scrolls to the exact sentence and flashes an animated highlighter box.",
      tag: "Activities 1 & 4",
      uiMock: (
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 text-left font-sans shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-display">
              <BookOpen className="w-4 h-4 text-sky-600" />
              The Life and Work of Marie Curie
            </span>
            <span className="clarity-pill-gold text-[10px]">
              ¶1 Evidence
            </span>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed mb-4">
            Marie Curie was born Maria Sklodowska in Poland in 1867.{' '}
            <mark className="bg-[#FFF0B3] text-amber-950 font-bold px-1.5 py-0.5 rounded-lg border border-[#FFD026]">
              She became well known for her groundbreaking research on radioactivity and was awarded two Nobel Prizes.
            </mark>{' '}
            She received the Nobel Prize in Physics in 1903 and Chemistry in 1911.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-extrabold text-slate-900 block mb-1">Q1. What is Marie Curie famous for?</span>
            <div className="flex items-center gap-2 text-green-950 font-extrabold bg-[#EAF9E7] border border-[#58CC02]/40 p-2 rounded-xl">
              <Check className="w-4 h-4 text-[#58CC02] stroke-[3]" />
              <span>Correct Answer: B. Her research on radioactivity</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      eyebrow: "STEP 02 • SITUATION ANALYSIS",
      title: "True/False critical logic breakdown.",
      description: "Analyze the academic work-study dialogue between the student and advisor Mr. Dan with detailed rationales on why unsupported claims are strictly false.",
      tag: "Activity 2",
      uiMock: (
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 text-left font-sans shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-display">
              <FileText className="w-4 h-4 text-amber-600" />
              Work-Study Program Consultation
            </span>
            <span className="clarity-pill text-[10px]">
              10 Statements
            </span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-800 font-semibold pr-2">1. The student is concerned about paying off student loans.</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#EAF9E7] border border-[#58CC02]/40 text-[#347802] font-bold text-[10px]">TRUE</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-800 font-semibold pr-2">2. Mr. Dan immediately approves 20 hours a week.</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FEECEC] border border-[#FF4B4B]/40 text-[#D92525] font-bold text-[10px]">FALSE</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-800 font-semibold pr-2">5. The student must take the signed form to the library.</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FEECEC] border border-[#FF4B4B]/40 text-[#D92525] font-bold text-[10px]">FALSE</span>
            </div>
          </div>
          <div className="text-[11px] text-amber-900 font-medium bg-[#FFF7E6] p-2.5 rounded-xl border border-amber-200">
            Advisor Note: "Advises 10 hours initially to protect grades & scholarship; form goes to Job Center."
          </div>
        </div>
      ),
    },
    {
      eyebrow: "STEP 03 • VISUAL CLOZE & VOCABULARY",
      title: "Authentic artwork with word bank collocations.",
      description: "Inspect the high-resolution Asian street scene painting, drag or tap words from the bank, and master grammatical collocations before the test.",
      tag: "Activity 3",
      uiMock: (
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 text-left font-sans shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-display">
              <Sparkles className="w-4 h-4 text-green-600" />
              Street Scene Cloze Passage
            </span>
            <span className="clarity-pill-green text-[10px]">
              6 Blanks
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-3 py-1 rounded-xl bg-[#EAF7FF] border border-sky-300 text-sky-800 font-bold text-xs shadow-2xs">numerous</span>
            <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs">cyclists</span>
            <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs">transportation</span>
          </div>
          <p className="text-xs text-slate-700 leading-loose bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            The picture depicts a crowded street in an Asian country, with{' '}
            <span className="px-2.5 py-1 rounded-lg bg-[#EAF9E7] border border-[#58CC02] text-green-950 font-bold">
              numerous ✓
            </span>{' '}
            bicycles and motor vehicles sharing the road...
          </p>
        </div>
      ),
    },
  ];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const current = slides[activeSlide];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b-2 border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="clarity-pill-blue">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>How It Works</span>
            </div>

            <h2 className="text-section-title font-display font-black text-slate-900 tracking-tight">
              Everything you need to ace the review exam.
            </h2>

            <p className="text-body-clear">
              {current.description}
            </p>

            {/* Carousel navigation controls */}
            <div className="pt-4 flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePrev}
                  className="tactile-btn-white w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 cursor-pointer"
                  title="Previous slide"
                  aria-label="Previous slide"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="tactile-btn-white w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 cursor-pointer"
                  title="Next slide"
                  aria-label="Next slide"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-3 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx ? 'w-8 bg-[#58CC02]' : 'w-3 bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`Slide ${idx + 1}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Card with product-UI mock */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-6 sm:p-8 bg-[#F0FDF4] border-2 border-[#58CC02]/30 border-b-6 border-b-[#46A302]/40 shadow-xs transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <span className="clarity-pill-green text-[11px]">
                  {current.eyebrow}
                </span>
                <span className="clarity-pill text-xs">
                  {current.tag}
                </span>
              </div>

              <div className="transition-all duration-300">
                {current.uiMock}
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-600 bg-white/90 border border-green-200 p-3 rounded-2xl shadow-2xs">
                <span>{current.title}</span>
                <span>Slide {activeSlide + 1} / {slides.length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
