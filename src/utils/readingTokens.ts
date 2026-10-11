/**
 * readingTokens.ts — pure text analysis + layout measurement for the read-aloud reader.
 *
 * Why this module exists (design notes):
 *  - Everything here is deterministic and side-effect free, so it can run inside
 *    `useMemo` on every render and be reasoned about (and tested) in isolation.
 *  - The ONLY DOM access is `Element.getClientRects()` in `rectsToBoxes()`, and it
 *    only READS layout. Highlight layers are positioned FROM those measurements,
 *    which means highlighting never mutates the text flow: no padding, no borders,
 *    no weight changes inside a paragraph => no reflow while reading.
 *  - Words/sentences are addressed by absolute character offsets into the block
 *    text. That single addressing scheme is what lets a speech-recognition style
 *    `charIndex` from the Web Speech API, a DOM word element and a click position
 *    all map onto the same coordinate system.
 */

/* ───────────────────────────── Word tokenisation ───────────────────────────── */

/**
 * Characters that terminate a word run.
 *
 * Deliberately NOT matched: `'` and `’` (apostrophes belong to the word —
 * "Curie’s" must be one clickable/readable unit) and `-` (hyphenated compounds
 * stay whole, matching how TTS engines report a word boundary).
 */
const WORD_BREAK_RE = /[\s\u00A0,.;:!?—–"“”()[\]{}…«»„|/]/;

/** True for whitespace/punctuation that separates words. */
export const isWordBreak = (ch: string): boolean => WORD_BREAK_RE.test(ch);

export interface Token {
  readonly text: string;
  /** Absolute offset of the first character, inside the block text. */
  readonly start: number;
  /** Absolute offset one past the last character. */
  readonly end: number;
  readonly isWord: boolean;
}

/**
 * Split text into alternating word / gap tokens that exactly cover the input.
 * Gap tokens are kept (instead of being dropped) so the renderer can group a
 * whole evidence run — words *and* the spaces between them — into one element.
 */
export const tokenize = (text: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const wordRun = !isWordBreak(text[i]);
    let j = i + 1;
    while (j < text.length && !isWordBreak(text[j]) === wordRun) j++;
    tokens.push({ text: text.slice(i, j), start: i, end: j, isWord: wordRun });
    i = j;
  }
  return tokens;
};

/**
 * The word run that starts at (or after) `offset`, used to clamp the character
 * length a speech engine reports: several engines hand back a boundary that
 * spans a whole clause, which would otherwise highlight half a sentence.
 */
export const wordAtOffset = (text: string, offset: number): { text: string; length: number } => {
  let end = offset;
  while (end < text.length && !isWordBreak(text[end])) end++;
  return { text: text.slice(offset, end), length: Math.max(0, end - offset) };
};

/* ────────────────────────────── Sentence splitting ─────────────────────────── */

/** Punctuation that still belongs to the sentence ending before it. */
const CLOSER_RE = /["”’')\]»]/;
const SPACE_RE = /[\s\u00A0]/;
const DIGIT_RE = /[0-9]/;
const LETTER_RE = /[A-Za-zÀ-ÿ]/;
/** A new sentence has to start with an uppercase letter, a digit or an opener. */
const SENTENCE_START_RE = /[A-Z0-9"'“‘(]/;

/** Abbreviations whose trailing dot must never end a sentence. */
const ABBREVIATIONS: Record<string, true> = {
  mr: true, mrs: true, ms: true, dr: true, prof: true, st: true, jr: true,
  sr: true, vs: true, etc: true, approx: true, no: true, fig: true, vol: true,
  inc: true, ltd: true, co: true, dept: true, est: true, min: true, max: true,
  al: true,
};

const nextNonSpace = (text: string, from: number): number => {
  let i = from;
  while (i < text.length && SPACE_RE.test(text[i])) i++;
  return i;
};

/** True when the dot at `dot` closes an abbreviation or an initial ("Dr.", "J."). */
const isAbbreviationAt = (text: string, dot: number): boolean => {
  let start = dot;
  while (start > 0 && LETTER_RE.test(text[start - 1])) start--;
  const word = text.slice(start, dot).toLowerCase();
  if (!word) return false;
  return word.length === 1 || ABBREVIATIONS[word] === true;
};

/**
 * Split a paragraph into sentence spans (absolute offsets, whitespace trimmed).
 *
 * Heuristics, in order of importance for a reading passage:
 *  - `3.5` / `U.S.` must not split  → guard for digit-dot-digit and single letters.
 *  - `Dr. Curie` / `e.g. this`      → abbreviation list + "next char is lowercase".
 *  - `stop." Then`                  → closing quotes/brackets belong to the sentence.
 *  - a paragraph without any terminator yields exactly one sentence.
 */
export const splitSentences = (text: string): { start: number; end: number }[] => {
  const out: { start: number; end: number }[] = [];
  const n = text.length;
  let start = -1;

  for (let i = 0; i < n; i++) {
    if (start < 0) {
      if (SPACE_RE.test(text[i])) continue;
      start = i;
    }
    const ch = text[i];
    if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== '…') continue;

    let end = i + 1;
    if (ch === '.') {
      while (end < n && text[end] === '.') end++; // "..." / "…" style ellipsis
      // Decimals are not sentence ends: "3.5 million".
      if (DIGIT_RE.test(text[i - 1]) && end < n && DIGIT_RE.test(text[end])) continue;
      if (isAbbreviationAt(text, i)) continue;
    }
    while (end < n && CLOSER_RE.test(text[end])) end++;

    const next = nextNonSpace(text, end);
    if (next < n && !SENTENCE_START_RE.test(text[next])) continue; // lowercase follows → not a break

    out.push({ start, end });
    start = -1;
    i = end - 1;
  }

  if (start >= 0) {
    let end = n;
    while (end > start && SPACE_RE.test(text[end - 1])) end--;
    out.push({ start, end });
  }
  return out;
};

/* ──────────────────── Speech unit schedule (the estimator) ─────────────────── */

/**
 * Extra speech time (in "characters") attached to a punctuation mark.
 * A comma is a short breath, a full stop a long one — modelling this is why the
 * interpolated highlight keeps pace with the voice instead of drifting early.
 */
const PAUSE_WEIGHT: Record<string, number> = {
  ',': 1.6, ';': 1.6, ':': 1.6, '.': 3, '!': 3, '?': 3, '…': 3, '—': 1.2, '–': 1.2,
};

/**
 * Cumulative "speech units" per character offset. `units[i]` is the amount of
 * talking that has to happen before offset `i` is reached:
 *
 *     units[i + 1] = units[i] + 1 + PAUSE_WEIGHT[text[i]]
 *
 * Time is then `units[i] * msPerUnit`, so learning a better `msPerUnit` (or a
 * different playback rate) costs nothing: the schedule is never rebuilt.
 */
export const buildUnits = (text: string): number[] => {
  const units: number[] = [0];
  for (let i = 0; i < text.length; i++) {
    units.push(units[i] + 1 + (PAUSE_WEIGHT[text[i]] ?? 0));
  }
  return units;
};

/**
 * Invert the schedule: which character offset is being spoken `elapsedMs` after
 * the range at `base` started? Binary search over `units` — the array is strictly
 * increasing because every character costs at least one unit.
 */
export const offsetForElapsed = (
  units: number[],
  base: number,
  end: number,
  msPerUnit: number,
  elapsedMs: number
): number => {
  const last = Math.max(base, end - 1);
  if (msPerUnit <= 0) return base;
  const target = units[base] + elapsedMs / msPerUnit;
  let lo = base;
  let hi = last;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (units[mid] <= target) lo = mid;
    else hi = mid - 1;
  }
  return Math.min(lo, last);
};

/* ─────────────────────────── Token/offset lookups ──────────────────────────── */

/** Index of the word containing `offset` (or the last word starting before it). */
export const wordIndexAt = (words: Token[], offset: number): number => {
  let lo = 0;
  let hi = words.length - 1;
  let res = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid].start <= offset) {
      res = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return res;
};

/** Index of the first word that ends after `offset` — used for click-to-read. */
export const wordIndexAtOrAfter = (words: Token[], offset: number): number => {
  for (let i = 0; i < words.length; i++) {
    if (words[i].end > offset) return i;
  }
  return words.length - 1;
};

/** Index of the sentence containing `offset` (offsets in the gap go forward). */
export const findSentenceIndexAt = (
  sentences: { start: number; end: number }[],
  offset: number
): number => {
  if (!sentences.length) return -1;
  let res = 0;
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].start <= offset) res = i;
    else break;
  }
  if (offset >= sentences[res].end && res + 1 < sentences.length) return res + 1;
  return res;
};

/** Index of the last token starting at or before `offset` (-1 when none). */
const tokenIndexAt = (tokens: Token[], offset: number): number => {
  let lo = 0;
  let hi = tokens.length - 1;
  let res = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (tokens[mid].start <= offset) {
      res = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return res;
};

/**
 * Snap a fuzzy character range (e.g. a quote found by string search) onto whole
 * word tokens, expanding OUTWARD and skipping leading/trailing punctuation.
 *
 * This guarantees every rendered word span is exactly one word token — so it can
 * be measured, highlighted and clicked as a unit — at the cost of at most one
 * character of visual slack at the edges of an evidence mark.
 */
export const snapRangeToTokens = (
  tokens: Token[],
  start: number,
  end: number
): { start: number; end: number } | null => {
  if (!tokens.length || end <= start) return null;

  let snappedStart = start;
  const from = Math.max(0, tokenIndexAt(tokens, start));
  for (let i = from; i < tokens.length; i++) {
    if (tokens[i].end > start && tokens[i].isWord) {
      snappedStart = tokens[i].start;
      break;
    }
  }

  let snappedEnd = end;
  const back = tokenIndexAt(tokens, end - 1);
  for (let i = back < 0 ? tokens.length - 1 : back; i >= 0; i--) {
    if (tokens[i].start < end && tokens[i].isWord) {
      snappedEnd = tokens[i].end;
      break;
    }
  }

  return snappedStart < snappedEnd ? { start: snappedStart, end: snappedEnd } : null;
};

/* ───────────────────────────── Prepared blocks ─────────────────────────────── */

export interface Sentence {
  readonly start: number;
  readonly end: number;
  /** Word tokens inside the sentence, in reading order. */
  readonly words: Token[];
}

export interface PreparedBlock {
  readonly id: number;
  readonly text: string;
  /** Alternating word/gap tokens covering the whole text. */
  readonly tokens: Token[];
  /** Spoken units; sentences with no words are filtered out. */
  readonly sentences: Sentence[];
  /** Cumulative speech-unit schedule (length = text.length + 1). */
  readonly units: number[];
}

/**
 * Everything the renderer and the speech engine need, computed once per passage.
 * Both sides receive the SAME object graph, so a snapshot's `sentenceIndex`
 * always indexes into the sentence array the DOM was rendered from.
 */
export const prepareBlock = (id: number, text: string): PreparedBlock => {
  const tokens = tokenize(text);
  const sentences: Sentence[] = [];
  for (const span of splitSentences(text)) {
    const words = tokens.filter((t) => t.isWord && t.start >= span.start && t.end <= span.end);
    if (words.length) sentences.push({ start: span.start, end: span.end, words });
  }
  return { id, text, tokens, sentences, units: buildUnits(text) };
};

/* ─────────────────────────── Geometry measurement ──────────────────────────── */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface BoxOptions {
  /** Horizontal/vertical breathing room added around every measured band. */
  padX: number;
  padY: number;
  /** Rects whose tops differ by less than this belong to the same text line. */
  lineTolerance: number;
  /** Two rects on one line closer than this are merged into a single band. */
  joinGap: number;
}

/**
 * Convert client rects into per-line boxes relative to a container origin.
 *
 * The maths: an inline `<span>` can be fragmented across several line boxes, and
 * `getBoundingClientRect()` returns the *union* of those fragments — which for a
 * wrapped sentence is a paragraph-sized rectangle. Grouping by line top and then
 * merging neighbours horizontally is what produces a band that hugs each line
 * instead of a box that swallows the trailing whitespace of the paragraph.
 *
 * Rects are returned in document order (top, then left) so `boxes[0]` is the
 * first line fragment — handy when exactly one box is needed (the word pill).
 */
export const rectsToBoxes = (
  els: Iterable<Element>,
  origin: { left: number; top: number },
  opts: BoxOptions
): Box[] => {
  const rects: DOMRect[] = [];
  for (const el of els) {
    for (const r of Array.from(el.getClientRects())) {
      if (r.width > 0 && r.height > 0) rects.push(r);
    }
  }
  if (!rects.length) return [];

  rects.sort((a, b) => a.top - b.top || a.left - b.left);

  // Pass 1 — cluster into text lines by vertical position.
  const lines: DOMRect[][] = [];
  for (const r of rects) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(line[0].top - r.top) <= opts.lineTolerance) line.push(r);
    else lines.push([r]);
  }

  // Pass 2 — merge horizontally adjacent fragments on each line, then pad.
  const boxes: Box[] = [];
  for (const line of lines) {
    line.sort((a, b) => a.left - b.left);
    let left = line[0].left;
    let right = line[0].right;
    let top = line[0].top;
    let bottom = line[0].bottom;
    const flush = () => {
      boxes.push({
        left: left - origin.left - opts.padX,
        top: top - origin.top - opts.padY,
        width: right - left + opts.padX * 2,
        height: bottom - top + opts.padY * 2,
      });
    };
    for (let i = 1; i < line.length; i++) {
      const r = line[i];
      if (r.left - right <= opts.joinGap) {
        right = Math.max(right, r.right);
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
      } else {
        flush();
        left = r.left;
        right = r.right;
        top = r.top;
        bottom = r.bottom;
      }
    }
    flush();
  }
  return boxes;
};

/** Layout origin of an absolutely positioned child: the padding box of `el`. */
export const contentOrigin = (el: HTMLElement): { left: number; top: number } => {
  const r = el.getBoundingClientRect();
  // clientLeft/clientTop are the border widths, i.e. the offset between the
  // border box (what getBoundingClientRect reports) and the padding box that
  // `position: absolute` children are laid out against.
  return { left: r.left + el.clientLeft, top: r.top + el.clientTop };
};

/** How the word pill should travel between two consecutive words. */
export type PillMotion = 'enter' | 'glide' | 'snap';

/**
 * Decide whether the golden pill may interpolate its transform.
 *
 * `glide` is only correct while both words sit on the same text line: a straight
 * interpolation from the end of line 1 to the start of line 2 would sweep the
 * pill diagonally through the middle of the paragraph. Wrapping lines — or
 * moving to another paragraph, whose coordinates are relative to a different
 * origin — must be an instant `snap` (the pill is re-keyed so it also plays its
 * short landing fade). `enter` is the first word of a playback run, which has
 * nothing to interpolate from.
 *
 * The tolerance of `0.6em` is smaller than any real line height (≈1.5em) and far
 * larger than sub-pixel jitter, so it separates "same baseline" from "next line".
 */
export const pillMotion = (
  previous: { blockId: number; top: number } | null,
  next: { blockId: number; top: number },
  fontPx: number
): PillMotion => {
  if (!previous) return 'enter';
  if (previous.blockId !== next.blockId) return 'snap';
  return Math.abs(previous.top - next.top) > fontPx * 0.6 ? 'snap' : 'glide';
};