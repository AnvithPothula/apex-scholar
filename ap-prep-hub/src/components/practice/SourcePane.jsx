/**
 * SourcePane — the stimulus/source half of the two-pane test layout.
 *
 * The real digital AP exam puts source material on the left and the question +
 * answer choices on the right, each scrolling independently, so you never lose
 * sight of the source while reading the options. This app used to stack
 * everything in one column, which meant a student on a stimulus question had to
 * scroll away from the passage to see the choices — exactly what the real
 * interface is designed to prevent.
 *
 * These blocks were previously inline in TestPanel, nested *inside* the question
 * container. That nesting is why a CSS-only fix was impossible: grid only
 * positions direct children, so a grid on the outer container put the source and
 * the question in the same cell. Hoisting them here is the whole refactor.
 *
 * Renders nothing when there's no source material, so `hasSourceMaterial` can
 * gate the split layout without this component ever producing an empty pane.
 */

import React from 'react';

/** True when a question carries anything worth showing in its own pane. */
export function hasSourceMaterial(q) {
  if (!q) return false;
  return Boolean(
    (Array.isArray(q.sources) && q.sources.length > 0) ||
    q.passage ||
    (Array.isArray(q.documents) && q.documents.length > 0) ||
    q.stimulus
  );
}

/** A source's attribution line, in Bluebook's small sans-serif. */
const Attribution = ({ children }) => (children ? <p className="font-sans text-sm text-[#555] mt-1">{children}</p> : null);

// Plain serif text on white, as Bluebook shows stimulus material: no cards,
// no coloured bars. Documents and sources run in one scrolling column with
// their labels, the way the exam lays them out.
export default function SourcePane({ currentQuestion }) {
  if (!hasSourceMaterial(currentQuestion)) return null;
  const q = currentQuestion;

  return (
    <div className="space-y-8">
      {q.sources?.length > 0 && q.sources.map((source, i) => (
        <section key={i}>
          <h4 className="font-sans font-bold">Source {String.fromCharCode(65 + i)}</h4>
          {source.title && <p className="font-semibold mt-1">{source.title}</p>}
          <Attribution>{[source.source, source.type].filter(Boolean).join(' · ')}</Attribution>
          <div className="mt-3 whitespace-pre-wrap">{source.content || source.description}</div>
        </section>
      ))}

      {q.passage && (
        <section>
          <Attribution>{q.passageInfo}</Attribution>
          <div className="mt-3 whitespace-pre-wrap">{q.passage}</div>
        </section>
      )}

      {q.documents?.length > 0 && q.documents.map((doc, i) => (
        <section key={i}>
          <h4 className="font-sans font-bold">Document {i + 1}</h4>
          <Attribution>{[doc.source && `Source: ${doc.source}`, doc.date].filter(Boolean).join(', ')}</Attribution>
          <div className="mt-3 whitespace-pre-wrap">{doc.content}</div>
        </section>
      ))}

      {/* Standalone stimulus (MCQ/SAQ) when it isn't expressed as documents */}
      {q.stimulus && !q.documents && (() => {
        const stim = String(q.stimulus || '');
        const sourceMatch = stim.match(/^\s*Source:\s*(.+?)\s*(?:\n|$)/i);
        const content = sourceMatch ? stim.replace(sourceMatch[0], '').trim() : stim;
        return (
          <section>
            <div className="whitespace-pre-wrap">{content}</div>
            <Attribution>{sourceMatch && `Source: ${sourceMatch[1].trim()}`}</Attribution>
          </section>
        );
      })()}
    </div>
  );
}
