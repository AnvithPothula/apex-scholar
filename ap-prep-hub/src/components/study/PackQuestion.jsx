import React, { useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';

/**
 * One multiple-choice question with feedback after the pick. `q` is already
 * shuffled (utils/studyPack.shuffleQuestion). Calls onAnswer once.
 */
export default function PackQuestion({ q, label, onAnswer, answered: initial = null }) {
  const [picked, setPicked] = useState(initial);
  const shownAt = useRef(Date.now());
  const down = useRef(null);
  const done = picked !== null;

  const choose = (i, e) => {
    if (done) return;
    // Choices are selectable text (so a student can highlight one and ask
    // about it). Dragging across a choice still fires a click, so a pointer
    // that moved, or a live selection, means selecting, not answering.
    if (e && down.current && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6) return;
    const sel = typeof window !== 'undefined' && window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) return;
    setPicked(i);
    onAnswer?.({ correct: i === q.answer, chosen: i, ms: Date.now() - shownAt.current });
  };

  return (
    <div className="my-4 p-4 rounded-lg border border-border-strong bg-base-850">
      {label && <p className="text-label text-content-muted uppercase tracking-wide mb-2">{label}</p>}
      <MarkdownRenderer content={q.question} className="text-body text-content-primary mb-3" />
      <div className="space-y-2" role="radiogroup" aria-label="Answer choices">
        {q.choices.map((c, i) => {
          const right = i === q.answer;
          const tone = !done
            ? 'border-border-strong bg-base-800 hover:border-content-muted'
            : right ? 'border-success-500 bg-success-900/40'
              : i === picked ? 'border-error-500 bg-error-900/40' : 'border-border-subtle bg-base-800 opacity-70';
          return (
            // A div, not a <button>: Chrome won't start a text selection inside a button.
            <div key={c} role="radio" aria-checked={picked === i} aria-disabled={done} tabIndex={done ? -1 : 0}
              onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }}
              onClick={(e) => choose(i, e)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(i); } }}
              className={`w-full flex items-start gap-3 p-3 text-left rounded-lg border transition-colors text-body-sm text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${done ? '' : 'cursor-pointer'} ${tone}`}>
              <span className="font-semibold text-content-secondary">{String.fromCharCode(65 + i)}.</span>
              <MarkdownRenderer content={c} className="flex-1" />
              {done && right && <Check className="w-4 h-4 text-success-400 shrink-0" aria-label="Correct answer" />}
              {done && !right && i === picked && <X className="w-4 h-4 text-error-400 shrink-0" aria-label="Your answer" />}
            </div>
          );
        })}
      </div>
      {done && (
        <div className="mt-3 text-body-sm text-content-secondary" aria-live="polite">
          <MarkdownRenderer content={q.explanations[picked]} />
          {picked !== q.answer && <MarkdownRenderer content={q.explanations[q.answer]} className="text-content-primary mt-1" />}
        </div>
      )}
    </div>
  );
}
