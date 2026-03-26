import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const MCQCard = ({ mcq, onSelect, disabled }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const revealed = selectedIdx !== null;

  if (!mcq) return null;
  const { question, choices = [], explanations = [], correctIndex } = mcq;

  const handleSelect = (idx) => {
    if (revealed || disabled) return;
    setSelectedIdx(idx);
    onSelect?.(idx);
  };

  const getChoiceStyle = (idx) => {
    if (!revealed) return 'bg-base-800 hover:bg-base-750 text-content-primary border border-border';
    if (idx === correctIndex) return 'bg-success-900 border border-success-500 text-success-400';
    if (idx === selectedIdx) return 'bg-error-900 border border-error-500 text-error-400';
    return 'bg-base-800 text-content-muted border border-border opacity-60';
  };

  return (
    <div className="p-4 rounded-md border border-border bg-base-850">
      <p className="font-medium text-content-primary mb-3">{question}</p>
      <div className="space-y-2">
        {choices.map((ch, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={revealed || disabled}
            className={`w-full text-left px-3 py-2 rounded-sm flex items-center gap-2 transition-all ${getChoiceStyle(idx)} ${!revealed && !disabled ? 'cursor-pointer' : 'cursor-default'}`}
            aria-label={`Choose option ${idx + 1}`}
          >
            <span className="font-semibold mr-1">{String.fromCharCode(65 + idx)}.</span>
            <span className="flex-1">{ch}</span>
            {revealed && idx === correctIndex && <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-success-400 flex-shrink-0" />}
            {revealed && idx === selectedIdx && idx !== correctIndex && <XCircle strokeWidth={1.5} className="w-4 h-4 text-error-400 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Result banner */}
      {revealed && (
        <div className={`mt-3 px-3 py-2 rounded-sm text-sm font-medium ${
          selectedIdx === correctIndex
            ? 'bg-success-900/30 text-success-300'
            : 'bg-error-900/30 text-error-300'
        }`}>
          {selectedIdx === correctIndex ? '✓ Correct!' : `✗ Incorrect — the answer is ${String.fromCharCode(65 + correctIndex)}.`}
        </div>
      )}

      {/* Explanations — only shown after answering */}
      {revealed && typeof correctIndex === 'number' && explanations?.length === choices.length && (
        <div className="mt-3 text-sm text-content-secondary border-t border-border-strong pt-3">
          <p className="font-semibold mb-1">Explanations:</p>
          <ul className="list-disc ml-5 space-y-1">
            {explanations.map((exp, i) => (
              <li key={i} className={i === correctIndex ? 'text-success-300' : 'text-content-muted'}>
                <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}:</span>{exp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(MCQCard);
