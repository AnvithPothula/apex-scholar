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
    if (!revealed) return 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-transparent';
    if (idx === correctIndex) return 'bg-emerald-900/40 border border-emerald-500 text-emerald-100';
    if (idx === selectedIdx) return 'bg-red-900/40 border border-red-500 text-red-100';
    return 'bg-slate-700/40 text-slate-400 border border-transparent opacity-60';
  };

  return (
    <div className="p-4 rounded-lg border border-slate-600 bg-slate-800/70">
      <p className="font-medium text-slate-100 mb-3">{question}</p>
      <div className="space-y-2">
        {choices.map((ch, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={revealed || disabled}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-all ${getChoiceStyle(idx)} ${!revealed && !disabled ? 'cursor-pointer' : 'cursor-default'}`}
            aria-label={`Choose option ${idx + 1}`}
          >
            <span className="font-semibold mr-1">{String.fromCharCode(65 + idx)}.</span>
            <span className="flex-1">{ch}</span>
            {revealed && idx === correctIndex && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {revealed && idx === selectedIdx && idx !== correctIndex && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Result banner */}
      {revealed && (
        <div className={`mt-3 px-3 py-2 rounded-md text-sm font-medium ${
          selectedIdx === correctIndex 
            ? 'bg-emerald-900/30 text-emerald-300' 
            : 'bg-red-900/30 text-red-300'
        }`}>
          {selectedIdx === correctIndex ? '✓ Correct!' : `✗ Incorrect — the answer is ${String.fromCharCode(65 + correctIndex)}.`}
        </div>
      )}

      {/* Explanations — only shown after answering */}
      {revealed && typeof correctIndex === 'number' && explanations?.length === choices.length && (
        <div className="mt-3 text-sm text-slate-300 border-t border-slate-600 pt-3">
          <p className="font-semibold mb-1">Explanations:</p>
          <ul className="list-disc ml-5 space-y-1">
            {explanations.map((exp, i) => (
              <li key={i} className={i === correctIndex ? 'text-emerald-300' : 'text-slate-400'}>
                <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}:</span>{exp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MCQCard;
