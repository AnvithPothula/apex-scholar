import React, { useState } from 'react';

const BASE = [12, 14, 15, 15, 16, 17, 18, 18, 19, 20];
const median = (s) => (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2);

/**
 * Summary statistics the AP way: Q1 and Q3 are the medians of the lower and
 * upper halves, leaving out the median itself when n is odd; s divides by
 * n − 1; outliers lie beyond 1.5 × IQR from the quartiles. Exported for tests.
 */
export function summarize(values) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const half = Math.floor(n / 2);
  const q1 = median(s.slice(0, half));
  const q3 = median(s.slice(n % 2 ? half + 1 : half));
  const mean = s.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  const iqr = q3 - q1;
  return {
    min: s[0], q1, median: median(s), q3, max: s[n - 1], mean, sd, iqr, range: s[n - 1] - s[0],
    lowFence: q1 - 1.5 * iqr, highFence: q3 + 1.5 * iqr,
    outliers: s.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr),
  };
}

const X0 = 10; const X1 = 62; // axis range
const W = 300;
const sx = (v) => 14 + ((v - X0) / (X1 - X0)) * (W - 28);
const f1 = (n) => n.toFixed(1);

/**
 * Eleven quiz scores; drag the top one. The mean, standard deviation and range
 * chase it; the median and IQR barely move. Past the upper fence it's an outlier.
 */
export default function OutlierPull() {
  const [x, setX] = useState(21);
  const data = [...BASE, x];
  const st = summarize(data);
  const stack = {};

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · resistant vs nonresistant statistics</p>
      <svg viewBox={`0 0 ${W} 122`} className="w-full max-w-md mx-auto block" role="img"
        aria-label={`Dotplot of 11 scores with the largest at ${x}. Mean ${f1(st.mean)}, median ${st.median}${st.outliers.length ? `; ${x} is an outlier` : ''}`}>
        <line x1="14" y1="80" x2={W - 14} y2="80" className="stroke-border-strong" />
        {[10, 20, 30, 40, 50, 60].map((t) => (
          <text key={t} x={sx(t)} y="94" fontSize="9" textAnchor="middle" className="fill-content-muted">{t}</text>
        ))}
        {/* upper fence */}
        <line x1={sx(Math.min(st.highFence, X1))} y1="20" x2={sx(Math.min(st.highFence, X1))} y2="80" strokeDasharray="3 3" className="stroke-warning-400" />
        <text x={sx(Math.min(st.highFence, X1)) + 3} y="28" fontSize="9" className="fill-warning-400">Q3 + 1.5·IQR</text>
        {data.map((v, i) => {
          stack[v] = (stack[v] || 0) + 1;
          const outlier = st.outliers.includes(v);
          return <circle key={i} cx={sx(v)} cy={80 - stack[v] * 6} r="2.6" className={outlier ? 'fill-error-400' : i === data.length - 1 ? 'fill-accent-400' : 'fill-primary-500'} />;
        })}
        {/* mean and median markers */}
        {/* separate rows so the two markers never cover each other */}
        <polygon points={`${sx(st.median) - 4},99 ${sx(st.median) + 4},99 ${sx(st.median)},106`} className="fill-success-400" />
        <polygon points={`${sx(st.mean) - 4},118 ${sx(st.mean) + 4},118 ${sx(st.mean)},111`} className="fill-info-400" />
      </svg>
      <p className="text-caption text-content-muted text-center">
        <span className="text-info-400">▲</span> mean · <span className="text-success-400">▼</span> median · <span className="text-accent-400">●</span> the value you move
      </p>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">Largest score: <strong>{x}</strong></span>
        <input type="range" min="20" max="60" step="1" value={x} onChange={(e) => setX(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${x}`} />
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
        {[['Mean', f1(st.mean)], ['SD (s)', f1(st.sd)], ['Range', st.range], ['Median', st.median], ['IQR', st.iqr], ['Q1, Q3', `${st.q1}, ${st.q3}`]].map(([k, v], i) => (
          <div key={k} className={`p-2 rounded-md ${i < 3 ? 'bg-base-800' : 'bg-base-800 ring-1 ring-success-500/40'}`}>
            <div className="text-body font-semibold text-content-primary">{v}</div>
            <div className="text-caption text-content-muted">{k}</div>
          </div>
        ))}
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {st.outliers.length
          ? `${x} is beyond the upper fence (${f1(st.highFence)}), so it's an outlier. The mean, SD and range jumped; the median and IQR (outlined) didn't move: they're resistant.`
          : `The upper fence is Q3 + 1.5 × IQR = ${st.q3} + 1.5 × ${st.iqr} = ${f1(st.highFence)}. Drag the score past it.`}
      </p>
    </div>
  );
}
