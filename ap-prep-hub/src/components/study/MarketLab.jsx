import React, { useState } from 'react';

/**
 * A linear market: demand P = a − bQ, supply P = c + dQ, with an optional
 * price ceiling, price floor or per-unit tax on sellers. Returns quantities,
 * prices and the surplus areas the AP exam asks about. Exported for tests.
 */
export function market({ a, b, c, d, policy = 'none', level = 0 }) {
  const qStar = Math.max(0, (a - c) / (b + d));
  const pStar = a - b * qStar;
  const tsStar = 0.5 * qStar * (a - c);
  const area = (q, top, bottom, slopeTop, slopeBottom) =>
    // ∫0^q [(top − slopeTop·x) − (bottom + slopeBottom·x)] dx
    q * (top - bottom) - ((slopeTop + slopeBottom) * q * q) / 2;
  const out = { qStar, pStar, tsStar, policy, binding: false, shortage: 0, surplus: 0, revenue: 0 };

  if (policy === 'ceiling' && level < pStar) {
    const qs = Math.max(0, (level - c) / d);
    const qd = Math.max(0, (a - level) / b);
    Object.assign(out, { binding: true, q: qs, pBuyers: level, pSellers: level, shortage: qd - qs,
      cs: area(qs, a, level, b, 0), ps: area(qs, level, c, 0, d) });
  } else if (policy === 'floor' && level > pStar) {
    const qd = Math.max(0, (a - level) / b);
    const qs = Math.max(0, (level - c) / d);
    Object.assign(out, { binding: true, q: qd, pBuyers: level, pSellers: level, surplus: qs - qd,
      cs: area(qd, a, level, b, 0), ps: area(qd, level, c, 0, d) });
  } else if (policy === 'tax' && level > 0) {
    const q = Math.max(0, (a - c - level) / (b + d));
    const pb = a - b * q;
    Object.assign(out, { binding: true, q, pBuyers: pb, pSellers: pb - level, revenue: level * q,
      cs: 0.5 * q * (a - pb), ps: 0.5 * q * (pb - level - c),
      buyerShare: (pb - pStar) / level });
  } else {
    Object.assign(out, { q: qStar, pBuyers: pStar, pSellers: pStar, cs: 0.5 * qStar * (a - pStar), ps: 0.5 * qStar * (pStar - c) });
  }
  out.ts = out.cs + out.ps + out.revenue;
  out.dwl = Math.max(0, tsStar - out.ts);
  return out;
}

const W = 300;
const H = 220;
const PAD = { l: 34, r: 10, t: 10, b: 28 };
const QMAX = 100;
const PMAX = 130;
const X = (q) => PAD.l + (q / QMAX) * (W - PAD.l - PAD.r);
const Y = (p) => PAD.t + (1 - p / PMAX) * (H - PAD.t - PAD.b);
const poly = (pts) => pts.map(([q, p]) => `${X(q).toFixed(1)},${Y(p).toFixed(1)}`).join(' ');
const POLICIES = [['none', 'No policy'], ['ceiling', 'Price ceiling'], ['floor', 'Price floor'], ['tax', 'Per-unit tax']];

/**
 * Shift supply and demand, change how steep they are, and add a price
 * ceiling, price floor or per-unit tax. The graph shades consumer surplus,
 * producer surplus, tax revenue and deadweight loss, and the panel reports
 * them. Modeled on the surplus, price-ceiling, price-floor and tax-incidence
 * MicroSims in Dan McCreary's "Economics" (CC BY-NC-SA 4.0), rebuilt as one
 * Apex component.
 */
export default function MarketLab() {
  const [dShift, setDShift] = useState(0);
  const [sShift, setSShift] = useState(0);
  const [b, setB] = useState(1);
  const [d, setD] = useState(1);
  const [policy, setPolicy] = useState('none');
  const [level, setLevel] = useState(40);
  const a = 100 + dShift;
  const c = 10 + sShift;
  const m = market({ a, b, c, d, policy, level });
  const f = (n) => (Math.abs(n) < 0.05 ? '0' : n.toFixed(1));

  const choose = (p) => {
    setPolicy(p);
    // Start each policy where it binds, so its effect is visible at once.
    const base = market({ a, b, c, d });
    if (p === 'ceiling') setLevel(Math.max(0, Math.round(base.pStar - 15)));
    if (p === 'floor') setLevel(Math.min(PMAX, Math.round(base.pStar + 15)));
    if (p === 'tax') setLevel(20);
  };

  const shapes = [];
  if (m.q > 0) {
    if (policy === 'tax' && m.binding) {
      shapes.push({ k: 'cs', pts: [[0, a], [0, m.pBuyers], [m.q, m.pBuyers]], cls: 'fill-info-500' });
      shapes.push({ k: 'rev', pts: [[0, m.pBuyers], [m.q, m.pBuyers], [m.q, m.pSellers], [0, m.pSellers]], cls: 'fill-accent-500' });
      shapes.push({ k: 'ps', pts: [[0, c], [0, m.pSellers], [m.q, m.pSellers]], cls: 'fill-success-500' });
    } else {
      const pr = m.pBuyers;
      shapes.push({ k: 'cs', pts: [[0, a], [0, pr], [m.q, pr], [m.q, a - b * m.q]], cls: 'fill-info-500' });
      shapes.push({ k: 'ps', pts: [[0, c], [0, pr], [m.q, pr], [m.q, c + d * m.q]], cls: 'fill-success-500' });
    }
  }
  if (m.binding && m.dwl > 0.05) shapes.push({ k: 'dwl', pts: [[m.q, a - b * m.q], [m.q, c + d * m.q], [m.qStar, m.pStar]], cls: 'fill-error-400' });

  const levelRange = policy === 'tax' ? [0, 60] : [0, PMAX];
  const btn = (on) => `px-2.5 py-1 rounded border text-body-sm ${on ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`;
  const slider = (label, value, set, min, max, step, text) => (
    <label className="block">
      <span className="text-body-sm text-content-primary">{label}: <strong>{text}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))}
        className="w-full mt-1 accent-primary-500" aria-valuetext={text} />
    </label>
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · supply, demand and surplus</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Government policy">
        {POLICIES.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={policy === k} onClick={() => choose(k)} className={btn(policy === k)}>{label}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto block" role="img"
          aria-label={`Market graph: quantity traded ${f(m.q)} at buyer price ${f(m.pBuyers)}; deadweight loss ${f(m.dwl)}`}>
          {shapes.map((s) => <polygon key={s.k} points={poly(s.pts)} className={s.cls} opacity="0.45" />)}
          <line x1={X(0)} y1={Y(0)} x2={X(QMAX)} y2={Y(0)} className="stroke-border-strong" />
          <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(PMAX)} className="stroke-border-strong" />
          <line x1={X(0)} y1={Y(a)} x2={X(Math.min(QMAX, a / b))} y2={Y(Math.max(0, a - b * QMAX))} className="stroke-info-400" strokeWidth="2" />
          <line x1={X(0)} y1={Y(c)} x2={X(Math.min(QMAX, (PMAX - c) / d))} y2={Y(Math.min(PMAX, c + d * QMAX))} className="stroke-success-400" strokeWidth="2" />
          {policy === 'tax' && m.binding && (
            <line x1={X(0)} y1={Y(c + level)} x2={X(Math.min(QMAX, (PMAX - c - level) / d))} y2={Y(Math.min(PMAX, c + level + d * QMAX))} className="stroke-success-400" strokeWidth="1.5" strokeDasharray="4 3" />
          )}
          {(policy === 'ceiling' || policy === 'floor') && (
            <line x1={X(0)} y1={Y(level)} x2={X(QMAX)} y2={Y(level)} className="stroke-warning-400" strokeWidth="1.5" strokeDasharray="5 3" />
          )}
          <text x={X(Math.min(QMAX, a / b)) - 2} y={Y(Math.max(0, a - b * QMAX)) - 4} fontSize="10" textAnchor="end" className="fill-info-400">D</text>
          <text x={X(Math.min(QMAX, (PMAX - c) / d)) - 4} y={Y(Math.min(PMAX, c + d * QMAX)) + 10} fontSize="10" textAnchor="end" className="fill-success-400">S</text>
          <text x={X(QMAX)} y={H - 6} fontSize="9" textAnchor="end" className="fill-content-muted">Quantity</text>
          <text x="4" y={PAD.t + 6} fontSize="9" className="fill-content-muted">Price</text>
          <circle cx={X(m.qStar)} cy={Y(m.pStar)} r="2.5" className="fill-content-primary" />
        </svg>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-body-sm">
          <dt className="text-content-muted">Equilibrium</dt><dd className="text-content-primary">P = {f(m.pStar)}, Q = {f(m.qStar)}</dd>
          {m.binding && policy !== 'tax' && <><dt className="text-content-muted">Quantity traded</dt><dd className="text-content-primary">{f(m.q)} at P = {f(m.pBuyers)}</dd></>}
          {m.shortage > 0 && <><dt className="text-content-muted">Shortage</dt><dd className="text-warning-400">{f(m.shortage)} units</dd></>}
          {m.surplus > 0 && <><dt className="text-content-muted">Surplus</dt><dd className="text-warning-400">{f(m.surplus)} units</dd></>}
          {policy === 'tax' && m.binding && <>
            <dt className="text-content-muted">With the tax</dt><dd className="text-content-primary">Q = {f(m.q)}</dd>
            <dt className="text-content-muted">Buyers pay</dt><dd className="text-content-primary">{f(m.pBuyers)} (up {f(m.pBuyers - m.pStar)})</dd>
            <dt className="text-content-muted">Sellers keep</dt><dd className="text-content-primary">{f(m.pSellers)} (down {f(m.pStar - m.pSellers)})</dd>
            <dt className="text-content-muted">Buyers bear</dt><dd className="text-content-primary">{Math.round(m.buyerShare * 100)}% of the tax</dd>
            <dt className="text-accent-400">Tax revenue</dt><dd className="text-content-primary">{f(m.revenue)}</dd>
          </>}
          <dt className="text-info-400">Consumer surplus</dt><dd className="text-content-primary">{f(m.cs)}</dd>
          <dt className="text-success-400">Producer surplus</dt><dd className="text-content-primary">{f(m.ps)}</dd>
          <dt className="text-error-400">Deadweight loss</dt><dd className="text-content-primary">{f(m.dwl)}</dd>
          <dt className="text-content-muted">Total surplus</dt><dd className="text-content-primary">{f(m.ts)} of {f(m.tsStar)} possible</dd>
        </dl>
      </div>
      {policy !== 'none' && (
        <div className="mt-3">
          {slider(policy === 'tax' ? 'Tax per unit' : policy === 'ceiling' ? 'Ceiling price' : 'Floor price', level, setLevel, levelRange[0], levelRange[1], 1, String(level))}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
        {slider('Shift demand', dShift, setDShift, -30, 20, 1, dShift > 0 ? `right by ${dShift}` : dShift < 0 ? `left by ${-dShift}` : 'none')}
        {slider('Shift supply', sShift, setSShift, -10, 30, 1, sShift > 0 ? `left (up) by ${sShift}` : sShift < 0 ? `right (down) by ${-sShift}` : 'none')}
        {slider('Demand steepness', b, setB, 0.5, 2, 0.1, b < 1 ? `${b.toFixed(1)} (flatter, more elastic)` : b > 1 ? `${b.toFixed(1)} (steeper, less elastic)` : '1.0')}
        {slider('Supply steepness', d, setD, 0.5, 2, 0.1, d < 1 ? `${d.toFixed(1)} (flatter, more elastic)` : d > 1 ? `${d.toFixed(1)} (steeper, less elastic)` : '1.0')}
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {policy === 'ceiling' && !m.binding ? 'This ceiling is above equilibrium, so it doesn\'t bind: nothing changes.'
          : policy === 'floor' && !m.binding ? 'This floor is below equilibrium, so it doesn\'t bind: nothing changes.'
          : policy === 'none' ? 'Blue is consumer surplus, green is producer surplus. With no policy, the market reaches the most total surplus it can.'
          : 'Red is deadweight loss: trades that would have helped both sides but no longer happen.'}
      </p>
    </div>
  );
}
