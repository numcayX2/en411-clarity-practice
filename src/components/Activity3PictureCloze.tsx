import React, { useState } from 'react';
import { activity3Data } from '../data/examData';
import * as Dialog from '@radix-ui/react-dialog';
import { Maximize2, X, CheckCircle2, XCircle, RotateCcw, Lightbulb, Sparkles, Flag, Volume2 } from 'lucide-react';
import { speakText } from '../utils/speech';

interface Activity3Props {
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  flaggedQuestions: Set<string>;
  onToggleFlag: (questionId: string) => void;
  mode: 'practice' | 'exam';
}

export const Activity3PictureCloze: React.FC<Activity3Props> = ({
  answers,
  onSelectAnswer,
  flaggedQuestions,
  onToggleFlag,
  mode,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedBankWord, setSelectedBankWord] = useState<string | null>(null);

  // Calculate used words
  const usedWords = new Set<string>();
  activity3Data.clozeItems.forEach((item) => {
    const val = answers[`act3_b${item.id}`];
    if (val) usedWords.add(val.toLowerCase());
  });

  const availableWords = activity3Data.wordBank.filter(
    (word) => !usedWords.has(word.toLowerCase()) || (selectedBankWord && selectedBankWord.toLowerCase() === word.toLowerCase())
  );

  const handleBankWordClick = (word: string) => {
    if (selectedBankWord === word) {
      setSelectedBankWord(null);
    } else {
      setSelectedBankWord(word);
      const firstEmptyItem = activity3Data.clozeItems.find(
        (item) => !answers[`act3_b${item.id}`]
      );
      if (firstEmptyItem) {
        onSelectAnswer(`act3_b${firstEmptyItem.id}`, word);
        setSelectedBankWord(null);
      }
    }
  };

  const handleBlankClick = (blankId: number) => {
    const key = `act3_b${blankId}`;
    const currentValue = answers[key];

    if (currentValue) {
      onSelectAnswer(key, '');
      if (selectedBankWord === currentValue) {
        setSelectedBankWord(null);
      }
    } else if (selectedBankWord) {
      onSelectAnswer(key, selectedBankWord);
      setSelectedBankWord(null);
    }
  };

  const handleResetAll = () => {
    activity3Data.clozeItems.forEach((item) => {
      onSelectAnswer(`act3_b${item.id}`, '');
    });
    setSelectedBankWord(null);
  };

  const handleSpeakFullParagraph = () => {
    let text = "The picture depicts a crowded street in an Asian country, with ";
    text += answers['act3_b1'] || "blank 1";
    text += " bicycles and motor vehicles sharing the road. This indicates that the area experiences heavy traffic. ";
    text += answers['act3_b2'] || "blank 2";
    text += " cyclists have baskets attached to their bicycles, suggesting that cycling is a common means of ";
    text += answers['act3_b3'] || "blank 3";
    text += ". However, the traffic situation appears somewhat chaotic. ";
    text += answers['act3_b4'] || "blank 4";
    text += " are riding on both sides of the center line and are moving in the same direction. Moreover, there appear to be no designated lanes for bicycles or motorcycles, because different types of transportation are sharing the road without clear separation. Based on the surrounding architecture, the area may be a popular tourist ";
    text += answers['act3_b5'] || "blank 5";
    text += " or shopping district. Two tall buildings ";
    text += answers['act3_b6'] || "blank 6";
    text += " in the distance, suggesting that the area may also be a commercial or business center.";

    speakText(text);
  };

  const filledCount = activity3Data.clozeItems.filter((i) => answers[`act3_b${i.id}`]).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="clarity-pill-green text-xs">
            Part 3 • Picture-Based Cloze Passage
          </span>
          <h2 className="text-lg font-display font-black text-slate-900 mt-2">
            Fill in the Blanks with the Word Bank
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Click a word from the bank to place it, or click any filled blank to return it.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleSpeakFullParagraph}
            className="tactile-btn-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Read Passage</span>
          </button>
          <button
            onClick={handleResetAll}
            className="tactile-btn-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800">
            {filledCount} / 6 Filled
          </div>
        </div>
      </div>

      {/* Main Grid: Artwork on left / top, Text & Bank on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Artwork Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs overflow-hidden">
          <div className="relative group cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
            <img
              src={activity3Data.imageSrc}
              alt="Crowded Asian street scene with cyclists and buildings"
              className="w-full h-auto object-cover max-h-[460px] transition-transform duration-300 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="tactile-btn-white inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold">
                <Maximize2 className="w-4 h-4" />
                Enlarge Picture
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(true); }}
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 shadow-xs cursor-pointer hover:bg-white"
              title="Expand image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-slate-50 border-t-2 border-slate-200 text-xs text-slate-600 font-medium leading-relaxed">
            <span className="clarity-pill-gold mr-1.5 text-[10px]">Visual Clue</span> Cyclists with front baskets, dense traffic, mixed vehicles sharing road, traditional shops, and distant skyscrapers.
          </div>
        </div>

        {/* Word Bank & Paragraph */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Word Bank Box */}
          <div className="bg-[#EAF9E7] p-5 rounded-2xl border-2 border-[#58CC02]/40 border-b-4 border-b-[#46A302]/50 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#347802]" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#347802]">
                  Word Bank Choices
                </h4>
              </div>
              <span className="clarity-pill-green text-[11px]">
                {availableWords.length} Available
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {activity3Data.wordBank.map((word) => {
                const isUsed = usedWords.has(word.toLowerCase());
                const isSelected = selectedBankWord === word;

                return (
                  <button
                    key={word}
                    onClick={() => handleBankWordClick(word)}
                    disabled={isUsed && !isSelected}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF7E6] border-2 border-[#FF9600] border-b-4 border-b-[#E58700] text-amber-950 font-extrabold active:border-b-2'
                        : isUsed
                        ? 'bg-slate-200/60 text-slate-400 line-through border-2 border-slate-200 shadow-none opacity-50 cursor-default'
                        : 'tactile-btn-white'
                    }`}
                  >
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>
            {selectedBankWord && (
              <p className="mt-3 text-xs text-amber-900 font-bold bg-[#FFF7E6] p-2.5 rounded-xl border border-amber-300 animate-fade-in">
                👉 Selected: <u>{selectedBankWord}</u>. Click any blank below to insert it!
              </p>
            )}
          </div>

          {/* Cloze Paragraph Container */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs font-sans text-slate-800 text-base sm:text-lg leading-loose">
            <p className="text-justify indent-8">
              The picture depicts a crowded street in an Asian country, with{' '}
              {renderBlank(1)}
              {' '}bicycles and motor vehicles sharing the road. This indicates that the area experiences heavy traffic.{' '}
              {renderBlank(2)}
              {' '}cyclists have baskets attached to their bicycles, suggesting that cycling is a common means of{' '}
              {renderBlank(3)}
              {'. However, the traffic situation appears somewhat chaotic. '}
              {renderBlank(4)}
              {' '}are riding on both sides of the center line and are moving in the same direction. Moreover, there appear to be no designated lanes for bicycles or motorcycles, because different types of transportation are sharing the road without clear separation. Based on the surrounding architecture, the area may be a popular tourist{' '}
              {renderBlank(5)}
              {' '}or shopping district. Two tall buildings{' '}
              {renderBlank(6)}
              {' '}in the distance, suggesting that the area may also be a commercial or business center.
            </p>
          </div>

          {/* Explanations & Clues list in Practice Mode */}
          {mode === 'practice' && (
            <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Practice Explanations & Grammar Collocations</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                {activity3Data.clozeItems.map((item) => {
                  const val = answers[`act3_b${item.id}`];
                  const isCorrect = val?.toLowerCase() === item.correctWord.toLowerCase();
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        val
                          ? isCorrect
                            ? 'bg-[#EAF9E7] border-[#58CC02]/40 text-green-950'
                            : 'bg-[#FEECEC] border-[#FF4B4B]/40 text-red-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>Blank {item.id} ({item.correctWord})</span>
                        {val && (
                          isCorrect ? (
                            <span className="text-[#347802] flex items-center gap-1 font-bold text-[11px] bg-[#EAF9E7] px-1.5 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : (
                            <span className="text-[#D92525] flex items-center gap-1 font-bold text-[11px] bg-[#FEECEC] px-1.5 py-0.5 rounded-md">
                              <XCircle className="w-3.5 h-3.5" /> Try Again
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                        {item.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal for full screen picture inspection */}
      <Dialog.Root open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-2xl z-50 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-slate-900 pb-3 border-b border-slate-200 px-2">
              <span className="font-display font-extrabold text-sm uppercase">Full Artwork Dossier • Activity 3</span>
              <Dialog.Close className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
            <div className="py-4 max-h-[75vh] overflow-auto flex justify-center">
              <img
                src={activity3Data.imageSrc}
                alt="Enlarged street scene"
                className="max-h-[70vh] w-auto rounded-2xl object-contain border border-slate-200 shadow-sm"
              />
            </div>
            <div className="text-xs text-slate-600 text-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              Cyclists with front baskets, crowded road, lack of bike lanes, and background modern skyscrapers.
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );

  function renderBlank(blankId: number) {
    const key = `act3_b${blankId}`;
    const currentValue = answers[key];
    const item = activity3Data.clozeItems.find((ci) => ci.id === blankId);
    const isCorrect = currentValue?.toLowerCase() === item?.correctWord.toLowerCase();
    const isFlagged = flaggedQuestions.has(key);
    const showFeedback = mode === 'practice' && !!currentValue;

    return (
      <span className="inline-flex items-center mx-1 align-baseline relative font-sans">
        <button
          onClick={() => handleBlankClick(blankId)}
          title={currentValue ? `Click to remove "${currentValue}"` : "Click to fill blank"}
          className={`min-w-[130px] px-3.5 py-1.5 rounded-xl text-sm font-mono transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            currentValue
              ? showFeedback
                ? isCorrect
                  ? 'bg-[#EAF9E7] border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-green-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                  : 'bg-[#FEECEC] border-2 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-red-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
                : 'bg-[#EAF7FF] border-2 border-[#1CB0F6] border-b-4 border-b-[#1899D6] text-sky-950 font-extrabold active:border-b-2 active:translate-y-[2px]'
              : selectedBankWord
              ? 'bg-[#FFF7E6] border-2 border-dashed border-[#FF9600] text-amber-900 font-bold animate-pulse'
              : 'bg-slate-50 border-2 border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400 font-bold'
          }`}
        >
          {currentValue ? (
            <>
              <span>{currentValue}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded-md ml-1">✕</span>
            </>
          ) : (
            <span className="text-xs font-mono font-bold text-slate-400">
              {blankId}). ________
            </span>
          )}
        </button>

        {/* Flag button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFlag(key); }}
          className={`ml-1.5 p-1 rounded-lg border transition-all cursor-pointer ${
            isFlagged ? 'bg-[#FFF7E6] border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
          }`}
          title={isFlagged ? "Flagged for review" : "Flag blank"}
        >
          <Flag className={`w-3 h-3 ${isFlagged ? 'fill-current' : ''}`} />
        </button>
      </span>
    );
  }
};
