import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

/** A small deck of flip cards: tap a card to see the back. */
export default function FlipCards({ cards = [] }) {
  const [flipped, setFlipped] = useState({});
  const toggle = (i) => setFlipped((f) => ({ ...f, [i]: !f[i] }));
  return (
    <div className="my-5">
      <p className="text-label text-content-muted uppercase tracking-wide mb-2">Flashcards · tap to flip</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {cards.map((c, i) => (
          <button
            key={c.front}
            type="button"
            onClick={() => toggle(i)}
            aria-pressed={!!flipped[i]}
            className={`min-h-[84px] p-3.5 rounded-lg border text-left transition-colors ${flipped[i] ? 'border-primary-500 bg-base-800' : 'border-border-strong bg-base-850 hover:border-content-muted'}`}
          >
            <span className="block text-caption text-content-muted mb-1">{flipped[i] ? 'Answer' : 'Prompt'}</span>
            <span className="block text-body-sm text-content-primary">{flipped[i] ? c.back : c.front}</span>
          </button>
        ))}
      </div>
      {Object.values(flipped).some(Boolean) && (
        <button type="button" onClick={() => setFlipped({})} className="mt-2 inline-flex items-center gap-1 text-caption text-content-muted hover:text-content-secondary">
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Flip all back
        </button>
      )}
    </div>
  );
}
