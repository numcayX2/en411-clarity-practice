import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { vocabularyList, type VocabCard } from '../data/examData';
import { Volume2, X, Search, Sparkles, BookOpen } from 'lucide-react';
import { speakText } from '../utils/speech';

interface VocabularyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({ open, onOpenChange }) => {
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const activities = ['All', 'Activity 1', 'Activity 2', 'Activity 3', 'Activity 4'];

  const filteredVocab = vocabularyList.filter((item) => {
    const matchesActivity = selectedActivity === 'All' || item.activityRef === selectedActivity;
    const matchesSearch =
      item.word.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase()) ||
      item.thaiMeaning.includes(search);
    return matchesActivity && matchesSearch;
  });

  const handleSpeak = async (item: VocabCard) => {
    setSpeakingId(item.id);
    await speakText(`${item.word}. ${item.example}`);
    setSpeakingId(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-4xl max-h-[88vh] bg-white rounded-3xl shadow-2xl border-2 border-slate-200 z-50 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b-2 border-slate-200 text-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-display font-black text-slate-900 flex items-center gap-2">
                  Academic Vocabulary Deck
                  <span className="clarity-pill-blue text-xs font-bold">
                    {filteredVocab.length} words
                  </span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium mt-0.5">
                  Key terms from EN411 review units with phonetic guides, definitions, and Thai translations.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-white border-b-2 border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search word, definition, or แปลไทย..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-800"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {activities.map((act) => (
                <button
                  key={act}
                  onClick={() => setSelectedActivity(act)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedActivity === act
                      ? 'bg-[#EAF7FF] text-sky-800 border-2 border-sky-300 font-extrabold'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 bg-[#F7F9FA]">
            {filteredVocab.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500">
                <p className="text-base font-bold">No vocabulary words found matching "{search}"</p>
                <button
                  onClick={() => { setSearch(''); setSelectedActivity('All'); }}
                  className="mt-2 text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredVocab.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="text-lg font-display font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                          {item.word}
                        </h4>
                        <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-600">
                          {item.phonetic}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium italic">
                          {item.partOfSpeech}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSpeak(item)}
                        title="Listen to pronunciation"
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          speakingId === item.id
                            ? 'tactile-btn-gold animate-pulse'
                            : 'tactile-btn-blue p-2'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Thai Translation */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF7E6] border border-amber-200 text-amber-900 text-xs font-bold mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>แปล: {item.thaiMeaning}</span>
                    </div>

                    {/* Definition */}
                    <p className="text-xs text-slate-700 leading-relaxed mb-3">
                      <strong className="font-extrabold text-slate-900">Definition:</strong> {item.definition}
                    </p>

                    {/* Example */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-serif italic">
                      "{item.example}"
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                      {item.activityRef}
                    </span>
                    <span>Click speaker for audio</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-white border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
            <span>💡 Tip: Practicing word collocations helps with Activity 3 Cloze tests!</span>
            <Dialog.Close className="tactile-btn-white px-4 py-2 rounded-xl text-xs font-bold text-slate-700">
              Done
            </Dialog.Close>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
