import React, { useState } from 'react';

/** Java's s.substring(from, to): the value, or the exception it throws. Exported for tests. */
export function javaSubstring(s, from, to = s.length) {
  if (from < 0 || to > s.length || from > to) return { error: 'StringIndexOutOfBoundsException' };
  return { value: s.slice(from, to) };
}

/**
 * The AP String methods on a word you choose: indices under each character,
 * substring with two sliders (including out-of-range values, which throw),
 * indexOf, equals and compareTo.
 */
export default function StringLab() {
  const [s, setS] = useState('computer');
  const [from, setFrom] = useState(3);
  const [to, setTo] = useState(6);
  const [find, setFind] = useState('put');
  const [other, setOther] = useState('compute');
  const sub = javaSubstring(s, from, to);
  const tail = javaSubstring(s, from);
  const cmp = s < other ? 'a negative number' : s > other ? 'a positive number' : '0';
  const q = (v) => `"${v}"`;
  const Out = ({ r }) => (r.error
    ? <span className="text-error-400">{r.error}</span>
    : <span className="text-content-primary">{q(r.value)}</span>);

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · String methods</p>
      <label className="block text-body-sm text-content-primary">
        String s =
        <input value={s} maxLength={14} onChange={(e) => { setS(e.target.value); setFrom(0); setTo(Math.min(3, e.target.value.length)); }}
          className="ml-2 w-40 bg-base-800 border border-border-strong rounded px-2 py-1 font-mono text-content-primary" aria-label="String value" />
      </label>
      <div className="flex flex-wrap mt-3 font-mono" aria-label="Characters and their indices">
        {[...s].map((c, i) => (
          <div key={i} className={`w-7 text-center border border-border-subtle ${i >= from && i < to && !sub.error ? 'bg-primary-900/50' : ''}`}>
            <div className="text-body-sm text-content-primary h-6 leading-6">{c === ' ' ? '␣' : c}</div>
            <div className="text-caption text-content-muted">{i}</div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <label className="block text-body-sm text-content-primary">from = <strong className="font-mono">{from}</strong>
          <input type="range" min="0" max={s.length + 1} value={from} onChange={(e) => setFrom(Number(e.target.value))} className="w-full accent-primary-500" aria-label="from index" />
        </label>
        <label className="block text-body-sm text-content-primary">to = <strong className="font-mono">{to}</strong>
          <input type="range" min="0" max={s.length + 1} value={to} onChange={(e) => setTo(Number(e.target.value))} className="w-full accent-primary-500" aria-label="to index" />
        </label>
      </div>
      <dl className="mt-3 text-body-sm font-mono space-y-1.5" aria-live="polite">
        <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-content-secondary">s.length()</dt><dd className="text-content-primary">{s.length}</dd></div>
        <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-content-secondary">s.substring({from}, {to})</dt><dd><Out r={sub} /></dd></div>
        <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-content-secondary">s.substring({from})</dt><dd><Out r={tail} /></dd></div>
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <dt className="text-content-secondary">s.indexOf(<input value={find} maxLength={8} onChange={(e) => setFind(e.target.value)} aria-label="indexOf argument"
            className="w-20 bg-base-800 border border-border-strong rounded px-1 text-content-primary" />)</dt>
          <dd className="text-content-primary">{s.indexOf(find)}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <dt className="text-content-secondary">s.equals(<input value={other} maxLength={14} onChange={(e) => setOther(e.target.value)} aria-label="Other string"
            className="w-24 bg-base-800 border border-border-strong rounded px-1 text-content-primary" />)</dt>
          <dd className="text-content-primary">{String(s === other)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-content-secondary">s.compareTo({q(other)})</dt><dd className="text-content-primary">{cmp}</dd></div>
      </dl>
      <p className="text-caption text-content-muted mt-2">
        substring(from, to) includes from and stops before to, so its length is to − from. Indices run 0 to length() − 1; to may equal length().
      </p>
    </div>
  );
}
