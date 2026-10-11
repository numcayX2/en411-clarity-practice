// Web Speech API wrapper for natural English pronunciation with word-level boundary callbacks
export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onWord?: (charIndex: number, charLength: number, word: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const speakText = (text: string, rateOrOptions: number | SpeakOptions = 0.95): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const options: SpeakOptions = typeof rateOrOptions === 'number' 
      ? { rate: rateOrOptions } 
      : rateOrOptions;

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny') ||
          v.name.includes('Guy'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (options.onStart) {
      utterance.onstart = () => options.onStart?.();
    }

    if (options.onWord) {
      utterance.onboundary = (e) => {
        if (e.name === 'word' || !e.name) {
          const charIndex = e.charIndex;
          // Accurately isolate single word boundary from text
          const sub = text.slice(charIndex);
          const match = sub.match(/^[^\s,.;:!?—"'\(\)]+/);
          const singleWordLength = match ? match[0].length : 1;
          // Strictly clamp charLength so it never groups multiple words across whitespace
          const charLength = singleWordLength;
          const word = text.slice(charIndex, charIndex + charLength);
          options.onWord?.(charIndex, charLength, word);
        }
      };
    }

    const handleDone = () => {
      options.onEnd?.();
      resolve();
    };

    utterance.onend = handleDone;
    utterance.onerror = handleDone;

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

