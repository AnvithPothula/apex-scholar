import React, { useState } from 'react';

export const NOUNS = [
  { nom: 'puella', acc: 'puellam', en: 'girl' },
  { nom: 'puer', acc: 'puerum', en: 'boy' },
  { nom: 'canis', acc: 'canem', en: 'dog' },
  { nom: 'rex', acc: 'regem', en: 'king' },
  { nom: 'agricola', acc: 'agricolam', en: 'farmer' },
];
const VERBS = [
  { la: 'videt', en: 'sees' },
  { la: 'amat', en: 'loves' },
  { la: 'vocat', en: 'calls' },
  { la: 'audit', en: 'hears' },
];
const ORDERS = { SOV: ['S', 'O', 'V'], OSV: ['O', 'S', 'V'], VSO: ['V', 'S', 'O'], OVS: ['O', 'V', 'S'] };

/** The Latin words in the chosen order, each tagged with its role, plus the English. Exported for tests. */
export function buildSentence(subject, object, verb, order) {
  const part = { S: { w: subject.nom, role: 'S' }, O: { w: object.acc, role: 'O' }, V: { w: verb.la, role: 'V' } };
  const words = ORDERS[order].map((k) => part[k]);
  words[0] = { ...words[0], w: words[0].w[0].toUpperCase() + words[0].w.slice(1) };
  return { words, english: `The ${subject.en} ${verb.en} the ${object.en}.` };
}

const ROLE = {
  S: 'text-primary-400 border-primary-500',
  O: 'text-warning-400 border-warning-500',
  V: 'text-content-primary border-border-strong',
};

/**
 * Pick a subject, an object, a verb and a word order. The English never
 * changes with the order: the nominative and accusative endings decide who
 * does what.
 */
export default function CaseLab() {
  const [s, setS] = useState(0);
  const [o, setO] = useState(2);
  const [v, setV] = useState(0);
  const [order, setOrder] = useState('SOV');
  const subject = NOUNS[s];
  const object = NOUNS[o === s ? (s + 1) % NOUNS.length : o];
  const { words, english } = buildSentence(subject, object, VERBS[v], order);

  const select = (label, value, set, options) => (
    <label className="block text-caption text-content-muted">{label}
      <select value={value} onChange={(e) => set(Number(e.target.value))}
        className="mt-1 block w-full bg-base-800 border border-border-strong rounded px-2 py-1.5 text-body-sm text-content-primary">
        {options.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
      </select>
    </label>
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · case lab</p>
      <div className="grid grid-cols-3 gap-2">
        {select('Subject', s, setS, NOUNS.map((n) => n.en))}
        {select('Object', o === s ? (s + 1) % NOUNS.length : o, setO, NOUNS.map((n) => n.en))}
        {select('Verb', v, setV, VERBS.map((x) => x.en))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3" role="group" aria-label="Word order">
        {Object.keys(ORDERS).map((k) => (
          <button key={k} type="button" onClick={() => setOrder(k)} aria-pressed={order === k}
            className={`px-2.5 py-1 rounded-md border text-caption ${order === k ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>
            {ORDERS[k].join('–')}
          </button>
        ))}
      </div>
      <p className="mt-4 flex flex-wrap gap-2 text-h4 font-semibold" aria-label="Latin sentence">
        {words.map((w) => <span key={w.role} className={`px-2 py-0.5 rounded border ${ROLE[w.role]}`}>{w.w}</span>)}
      </p>
      <p className="text-body text-content-primary mt-3" aria-live="polite">{english}</p>
      <p className="text-caption text-content-muted mt-2">
        <span className="text-primary-400">{subject.nom}</span> is nominative (the subject);{' '}
        <span className="text-warning-400">{object.acc}</span> is accusative (the direct object). Change the word order: the meaning stays the same.
      </p>
    </div>
  );
}
