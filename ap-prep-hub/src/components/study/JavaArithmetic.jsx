import React, { useState } from 'react';

/** How Java prints a double: always with a decimal point (3.0, not 3). Exported for tests. */
export function javaDouble(x) {
  const s = String(x);
  return /[.eE]/.test(s) ? s : `${s}.0`;
}

/**
 * Java's result for a op b, as it would print. `aDouble`/`bDouble` say whether
 * each operand is a double. int ÷ int truncates; int % 0 throws. Operands are
 * non-negative (the CED excludes negative % operands). Exported for tests.
 */
export function javaOp(a, aDouble, op, b, bDouble) {
  const dbl = aDouble || bDouble;
  if (!dbl && b === 0 && (op === '/' || op === '%')) return 'ArithmeticException';
  let v;
  if (op === '+') v = a + b;
  else if (op === '-') v = a - b;
  else if (op === '*') v = a * b;
  else if (op === '/') v = dbl ? a / b : Math.trunc(a / b);
  else v = a % b;
  return dbl ? javaDouble(v) : String(v);
}

const lit = (v, d) => (d ? javaDouble(v) : String(v));

/**
 * Integer vs. double arithmetic: pick two values and their types and see what
 * Java evaluates for / and %, plus the casts the exam loves.
 */
export default function JavaArithmetic() {
  const [a, setA] = useState(17);
  const [b, setB] = useState(5);
  const [aD, setAD] = useState(false);
  const [bD, setBD] = useState(false);
  const rows = [
    [`${lit(a, aD)} / ${lit(b, bD)}`, javaOp(a, aD, '/', b, bD)],
    [`${lit(a, aD)} % ${lit(b, bD)}`, javaOp(a, aD, '%', b, bD)],
    [`(double) ${a} / ${b}`, javaOp(a, true, '/', b, false)],
    [`(int) (${a} / ${javaDouble(b)})`, String(Math.trunc(a / b))],
  ];
  const typeBtn = (on, set, label) => (
    <div className="flex gap-1" role="group" aria-label={`${label} type`}>
      {[false, true].map((d) => (
        <button key={String(d)} type="button" onClick={() => set(d)} aria-pressed={on === d}
          className={`px-2 py-0.5 rounded border text-caption font-mono ${on === d ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>
          {d ? 'double' : 'int'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · Java arithmetic</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="flex items-center justify-between gap-2 text-body-sm text-content-primary"><span>a = <strong className="font-mono">{a}</strong></span>{typeBtn(aD, setAD, 'a')}</span>
          <input type="range" min="0" max="20" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full mt-1 accent-primary-500" aria-label="Value of a" />
        </label>
        <label className="block">
          <span className="flex items-center justify-between gap-2 text-body-sm text-content-primary"><span>b = <strong className="font-mono">{b}</strong></span>{typeBtn(bD, setBD, 'b')}</span>
          <input type="range" min="1" max="9" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full mt-1 accent-primary-500" aria-label="Value of b" />
        </label>
      </div>
      <table className="w-full mt-3 text-body-sm font-mono">
        <tbody>
          {rows.map(([expr, val]) => (
            <tr key={expr} className="border-t border-border-subtle">
              <td className="py-1.5 pr-3 text-content-secondary">{expr}</td>
              <td className="py-1.5 text-right text-content-primary">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {aD || bD
          ? 'At least one operand is a double, so / gives the full quotient and the result prints with a decimal point.'
          : `Both are ints, so / keeps only the integer part: ${a} / ${b} is ${Math.trunc(a / b)}, and % gives the remainder ${a % b}. (${b} × ${Math.trunc(a / b)} + ${a % b} = ${a})`}
      </p>
    </div>
  );
}
