// Robust evidence quote matcher supporting ellipses, quotes, and punctuation variations
export const findQuoteRange = (
  fullText: string,
  quote: string
): { start: number; end: number } | null => {
  if (!fullText || !quote) return null;

  // 1. Clean the quote: remove leading/trailing '...', '…', and whitespace
  const cleanQuote = quote
    .replace(/^[\s.…]+|[\s.…]+$/g, '')
    .trim();

  if (!cleanQuote) return null;

  // Try exact match first
  let idx = fullText.indexOf(cleanQuote);
  if (idx !== -1) {
    return { start: idx, end: idx + cleanQuote.length };
  }

  // Try case-insensitive
  idx = fullText.toLowerCase().indexOf(cleanQuote.toLowerCase());
  if (idx !== -1) {
    return { start: idx, end: idx + cleanQuote.length };
  }

  // Normalize apostrophes: ’ -> '
  const normText = fullText.replace(/’/g, "'");
  const normQuote = cleanQuote.replace(/’/g, "'");
  idx = normText.toLowerCase().indexOf(normQuote.toLowerCase());
  if (idx !== -1) {
    return { start: idx, end: idx + cleanQuote.length };
  }

  // Multi-word fallback: match beginning phrase
  const words = normQuote.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    const startPhrase = words.slice(0, 3).join(' ');
    const sIdx = normText.toLowerCase().indexOf(startPhrase.toLowerCase());
    if (sIdx !== -1) {
      if (words.length >= 5) {
        const endPhrase = words.slice(-3).join(' ');
        const eIdx = normText.toLowerCase().indexOf(endPhrase.toLowerCase(), sIdx);
        if (eIdx !== -1) {
          return { start: sIdx, end: eIdx + endPhrase.length };
        }
      }
      return { start: sIdx, end: Math.min(fullText.length, sIdx + cleanQuote.length) };
    }
  }

  return null;
};
