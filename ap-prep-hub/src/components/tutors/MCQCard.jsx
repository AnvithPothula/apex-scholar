import React from 'react';

const MCQCard = ({ mcq, onSelect, disabled }) => {
  if (!mcq) return null;
  const { question, choices = [], explanations = [], correctIndex } = mcq;
  return (
    <div className="p-4 rounded-lg border border-slate-600 bg-slate-800/70">
      <p className="font-medium text-slate-100 mb-3">{question}</p>
      <div className="space-y-2">
        {choices.map((ch, idx) => (
          <button
            key={idx}
            onClick={() => onSelect?.(idx)}
            disabled={disabled}
            className="w-full text-left px-3 py-2 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-200 disabled:opacity-60"
            aria-label={`Choose option ${idx + 1}`}
          >
            <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
            {ch}
          </button>
        ))}
      </div>
      {typeof correctIndex === 'number' && explanations?.length === choices.length && (
        <div className="mt-3 text-sm text-slate-300">
          <p className="font-semibold mb-1">Why each option:</p>
          <ul className="list-disc ml-5 space-y-1">
            {explanations.map((exp, i) => (
              <li key={i} className={i === correctIndex ? 'text-emerald-300' : 'text-slate-300'}>
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
