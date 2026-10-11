/**
 * ReadingParagraph.tsx — renders one `PreparedBlock` as stable word spans.
 *
 * Key design decision (inherited from the Activity 1 viewer): each word is its
 * own `<span key={start}>` carrying its absolute character offset, and the
 * classes applied to it never change glyph metrics (no font-weight, no padding,
 * no border). Two payoffs:
 *  1. The active-word highlight cannot reflow the line — if it did, every word
 *     would shift while the pill is mid-transition toward the old position.
 *  2. The spans are stable across renders, so React updates one className per
 *     word instead of remounting the paragraph on every boundary event.
 *
 * The component is presentational: the caller owns the paragraph container, the
 * highlight layers and any vocabulary tooltip (via `renderVocabWord`).
 */

import React from 'react';
import type { PreparedBlock } from '../utils/readingTokens';

/** A glossed term occurrence, in absolute character offsets inside one block. */
export interface VocabRange {
  start: number;
  end: number;
  term: string;
}

export interface ReadingParagraphProps {
  block: PreparedBlock;
  /** Word range of the evidence quote located by "Locate in …", snapped to tokens. */
  evidence: { start: number; end: number } | null;
  /** Character range of the word being spoken (-1 when none). */
  activeStart: number;
  activeEnd: number;
  vocabRanges?: VocabRange[];
  className?: string;
  onWordRef: (blockId: number, start: number, el: HTMLElement | null) => void;
}

export const ReadingParagraph: React.FC<ReadingParagraphProps> = ({
  block,
  evidence,
  activeStart,
  activeEnd,
  vocabRanges,
  className,
  onWordRef,
}) => {
  const nodes: React.ReactNode[] = [];
  /** Start offset of the open evidence run (-1 when no run is open). */
  let runKey = -1;
  let run: React.ReactNode[] = [];
  /** Open vocabulary hotspot: the range start it wraps (-1 when none). */
  let vocabStart = -1;
  let vocabTerm = '';
  let vocabRun: React.ReactNode[] = [];

  const flushRun = () => {
    if (runKey < 0) return;
    nodes.push(
      <mark key={`ev-${runKey}`} className="ev-run">
        {run}
      </mark>
    );
    runKey = -1;
    run = [];
  };

  /** Close the open hotspot and hand it back as a single node. */
  const takeVocab = (): React.ReactNode | null => {
    if (vocabStart < 0) return null;
    const hotspot = (
      <span
        key={`v-${vocabStart}`}
        data-vocab-term={vocabTerm}
        tabIndex={0}
        className="rv-vocab"
      >
        {vocabRun}
      </span>
    );
    vocabStart = -1;
    vocabTerm = '';
    vocabRun = [];
    return hotspot;
  };

  for (const token of block.tokens) {
    const inEvidence = evidence !== null && token.start >= evidence.start && token.end <= evidence.end;
    /** A multi-word term is one hotspot, not one per word — so the whitespace
     * inside it continues the run (but can never open one). */
    const range = vocabRanges?.find((candidate) => token.start >= candidate.start && token.end <= candidate.end);
    const isHotspot = range !== undefined && (token.isWord || vocabStart >= 0);

    // Close a finished hotspot first: it belongs to the run that was open
    // before this token, so opening the evidence run here would swallow it.
    if (vocabStart >= 0 && (range === undefined || range.start !== vocabStart)) {
      const previous = takeVocab();
      if (previous) {
        if (runKey >= 0) run.push(previous);
        else nodes.push(previous);
      }
    }
    if (isHotspot && range && range.start !== vocabStart) {
      vocabStart = range.start;
      vocabTerm = range.term;
    }

    // The evidence run must close before the next token is emitted, otherwise
    // the trailing punctuation of the previous sentence lands inside it.
    if (!inEvidence) flushRun();
    if (inEvidence && runKey < 0) runKey = token.start;

    let node: React.ReactNode;

    if (token.isWord) {
      const isActive = activeStart >= 0 && token.start >= activeStart && token.end <= activeEnd;
      const isEvidenceAnchor = evidence !== null && token.start === evidence.start;
      node = (
        <span
          key={token.start}
          ref={(el) => onWordRef(block.id, token.start, el)}
          data-word={token.start}
          data-evidence-anchor={isEvidenceAnchor ? '' : undefined}
          className={isActive ? 'rv-word rv-word--active' : 'rv-word'}
        >
          {token.text}
        </span>
      );
    } else {
      // Whitespace and punctuation carry a key too: unkeyed children in these
      // arrays are matched by index, so toggling the evidence run would shuffle
      // the raw text nodes around the keyed word spans.
      node = <React.Fragment key={`t-${token.start}`}>{token.text}</React.Fragment>;
    }

    if (isHotspot) vocabRun.push(node);
    else if (inEvidence) run.push(node);
    else nodes.push(node);
  }

  const trailing = takeVocab();
  if (trailing) {
    if (runKey >= 0) run.push(trailing);
    else nodes.push(trailing);
  }
  flushRun();

  return <p className={className}>{nodes}</p>;
};