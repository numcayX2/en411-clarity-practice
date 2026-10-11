import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ZoomIn, ZoomOut, Bookmark, BookOpen, Highlighter } from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';
import { findQuoteRange } from '../utils/textHighlight';

interface Paragraph {
  id: number;
  text: string;
}

interface PassageViewerProps {
  title: string;
  subtitle?: string;
  paragraphs: Paragraph[];
  highlightQuote?: string | null;
  highlightParagraphId?: number | null;
  onClearHighlight?: () => void;
}

export const PassageViewer: React.FC<PassageViewerProps> = ({
  title,
  subtitle,
  paragraphs,
  highlightQuote,
  highlightParagraphId,
  onClearHighlight,
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isReading, setIsReading] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('en411_highlight_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const toggleHighlight = () => {
    setHighlightEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('en411_highlight_enabled', String(next));
        window.dispatchEvent(new CustomEvent('en411_highlight_change', { detail: next }));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (customEvent.detail !== undefined) {
        setHighlightEnabled(customEvent.detail);
      }
    };
    window.addEventListener('en411_highlight_change', handleSync);
    return () => window.removeEventListener('en411_highlight_change', handleSync);
  }, []);

  const [readingState, setReadingState] = useState<{
    paraId: number | null;
    start: number;
    end: number;
  }>({ paraId: null, start: -1, end: -1 });

  const [pillStyle, setPillStyle] = useState<{
    paraId: number;
    left: number;
    top: number;
    width: number;
    height: number;
    hasAnimated: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const activeWordRef = useRef<HTMLElement | null>(null);
  const activeHighlightRef = useRef<HTMLElement | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    if (highlightQuote) {
      if (!highlightEnabled) {
        setHighlightEnabled(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('en411_highlight_enabled', 'true');
        }
      }
      if (containerRef.current) {
        setTimeout(() => {
          const el = containerRef.current?.querySelector('.evidence-target');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [highlightQuote, highlightParagraphId]);

  // Clean up speech when unmounting
  useEffect(() => {
    return () => {
      stopRequestedRef.current = true;
      stopSpeech();
    };
  }, []);

  // Update sliding pill position smoothly whenever reading word changes
  useEffect(() => {
    if (activeWordRef.current && readingState.paraId !== null && readingState.start >= 0) {
      const paraEl = paraRefs.current.get(readingState.paraId);
      if (paraEl) {
        const paraRect = paraEl.getBoundingClientRect();
        const wordRect = activeWordRef.current.getBoundingClientRect();
        const isSamePara = pillStyle?.paraId === readingState.paraId;

        const baseFontSize = fontSize === 'sm' ? 14 : fontSize === 'lg' ? 18 : 16;
        const snugHeight = Math.round(baseFontSize * 1.35); // 19px - 24px snug to font glyphs
        const verticalCenter = wordRect.top + (wordRect.height / 2);
        const snugTop = verticalCenter - (snugHeight / 2) - paraRect.top;

        setPillStyle({
          paraId: readingState.paraId,
          left: wordRect.left - paraRect.left,
          top: snugTop,
          width: wordRect.width,
          height: snugHeight,
          hasAnimated: isSamePara,
        });

        // Gently keep spoken word in viewport
        activeWordRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    } else {
      setPillStyle(null);
    }
  }, [readingState, fontSize]);

  const handleReadAloud = async () => {
    if (isReading) {
      stopRequestedRef.current = true;
      stopSpeech();
      setIsReading(false);
      setReadingState({ paraId: null, start: -1, end: -1 });
      setPillStyle(null);
      return;
    }

    setIsReading(true);
    stopRequestedRef.current = false;

    for (let i = 0; i < paragraphs.length; i++) {
      if (stopRequestedRef.current) break;
      const para = paragraphs[i];
      setReadingState({ paraId: para.id, start: -1, end: -1 });

      await speakText(para.text, {
        rate: 0.9,
        onWord: (charIndex, charLength) => {
          if (!stopRequestedRef.current) {
            setReadingState({
              paraId: para.id,
              start: charIndex,
              end: charIndex + charLength,
            });
          }
        },
      });
    }

    setIsReading(false);
    setReadingState({ paraId: null, start: -1, end: -1 });
    setPillStyle(null);
  };

  const cycleFontSize = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (fontSize === 'sm') setFontSize('base');
      else if (fontSize === 'base') setFontSize('lg');
    } else {
      if (fontSize === 'lg') setFontSize('base');
      else if (fontSize === 'base') setFontSize('sm');
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-lg leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  const renderParagraphContent = (para: Paragraph) => {
    const text = para.text;
    const isThisParaReading = highlightEnabled && readingState.paraId === para.id && readingState.start >= 0;
    const wordRange = isThisParaReading
      ? { start: Math.max(0, readingState.start), end: Math.min(text.length, readingState.end) }
      : null;

    const evidenceRange = (highlightEnabled && highlightQuote) ? findQuoteRange(text, highlightQuote) : null;

    if (!wordRange && !evidenceRange) {
      return text;
    }

    // Collect all critical boundary points within [0, text.length]
    const rawPoints = [0, text.length];
    if (wordRange) {
      rawPoints.push(wordRange.start, wordRange.end);
    }
    if (evidenceRange) {
      rawPoints.push(evidenceRange.start, evidenceRange.end);
    }

    // Deduplicate and sort ascending
    const points = Array.from(new Set(rawPoints.filter((p) => p >= 0 && p <= text.length))).sort((a, b) => a - b);

    const segments: React.ReactNode[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const pStart = points[i];
      const pEnd = points[i + 1];
      if (pStart >= pEnd) continue;

      const chunk = text.slice(pStart, pEnd);
      const isWord = wordRange && pStart >= wordRange.start && pEnd <= wordRange.end;
      const isEvidence = evidenceRange && pStart >= evidenceRange.start && pEnd <= evidenceRange.end;

      if (isWord) {
        segments.push(
          <span
            key={`w-${pStart}-${pEnd}`}
            ref={activeWordRef}
            className="relative z-10 inline font-black text-slate-950"
          >
            {chunk}
          </span>
        );
      } else if (isEvidence) {
        segments.push(
          <mark
            key={`e-${pStart}-${pEnd}`}
            ref={(el) => {
              if (el) activeHighlightRef.current = el;
            }}
            className="evidence-target relative z-10"
          >
            {chunk}
          </mark>
        );
      } else {
        segments.push(
          <span key={`t-${pStart}-${pEnd}`} className="relative z-10">
            {chunk}
          </span>
        );
      }
    }

    return segments;
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 overflow-hidden flex flex-col h-full shadow-xs">
      {/* Passage Header / Toolbar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-extrabold text-slate-900 leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2">
          {highlightQuote && (
            <button
              onClick={onClearHighlight}
              className="clarity-pill-gold text-xs cursor-pointer hover:bg-amber-100 transition-colors"
              title="Clear highlighted evidence"
            >
              <span>Highlighted</span>
              <span className="text-[10px] ml-0.5">✕</span>
            </button>
          )}

          {/* Text size */}
          <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => cycleFontSize('down')}
              disabled={fontSize === 'sm'}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
              title="Smaller text"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 px-2">
              {fontSize === 'sm' ? 'A-' : fontSize === 'lg' ? 'A+' : 'A'}
            </span>
            <button
              onClick={() => cycleFontSize('up')}
              disabled={fontSize === 'lg'}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
              title="Larger text"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Highlight on/off switch */}
          <button
            type="button"
            role="switch"
            aria-checked={highlightEnabled}
            onClick={toggleHighlight}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 select-none ${
              highlightEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-950 border-b-3 shadow-2xs hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600'
            }`}
            title={highlightEnabled ? 'Highlighting is ON (click to turn OFF)' : 'Highlighting is OFF (click to turn ON)'}
          >
            <Highlighter className={`w-3.5 h-3.5 ${highlightEnabled ? 'text-amber-600' : 'text-slate-400'}`} />
            <span
              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                highlightEnabled ? 'bg-amber-400' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  highlightEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              {highlightEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Read aloud */}
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              isReading
                ? 'tactile-btn-red animate-pulse'
                : 'tactile-btn-blue'
            }`}
            title="Read passage aloud using speech synthesis"
          >
            {isReading ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Passage Text Content */}
      <div
        ref={containerRef}
        className={`p-6 overflow-y-auto space-y-4 font-sans text-slate-800 ${getFontSizeClass()} flex-1 select-text leading-relaxed`}
      >
        {paragraphs.map((para) => {
          const isTargetPara = highlightParagraphId === para.id;
          const isReadingThisPara = readingState.paraId === para.id;
          return (
            <div
              key={para.id}
              ref={(el) => {
                if (el) paraRefs.current.set(para.id, el);
                else paraRefs.current.delete(para.id);
              }}
              className={`relative py-3.5 pr-4 pl-12 transition-colors rounded-2xl ${
                isTargetPara ? 'bg-[#FFF9E6] border border-[#FFD026]' : ''
              }`}
            >
              {/* Smooth moving highlighter pill */}
              {highlightEnabled && isReadingThisPara && pillStyle && pillStyle.paraId === para.id && (
                <div
                  className="absolute pointer-events-none rounded-md bg-[#FFD814] ring-2 ring-[#EAB308] shadow-sm z-0"
                  style={{
                    transform: `translate3d(${pillStyle.left - 2}px, ${pillStyle.top}px, 0)`,
                    width: `${pillStyle.width + 4}px`,
                    height: `${pillStyle.height}px`,
                    transition: pillStyle.hasAnimated
                      ? 'transform 0.18s cubic-bezier(0.2, 0.8, 0.25, 1), width 0.18s cubic-bezier(0.2, 0.8, 0.25, 1)'
                      : 'opacity 0.12s ease',
                    opacity: 1,
                  }}
                />
              )}

              <span className="absolute left-3 top-3.5 z-10 text-[10px] font-mono font-black text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md select-none pointer-events-none">
                ¶{para.id}
              </span>
              <p className="relative z-10 leading-relaxed indent-6">
                {renderParagraphContent(para)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Passage Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          Official Review Dossier
        </span>
        <span className="clarity-pill text-[11px]">
          {paragraphs.length} Paragraphs
        </span>
      </div>
    </div>
  );
};
