import React, { useMemo, useRef, useState, useId } from 'react';
import { LineChart } from 'lucide-react';
import { parseGraphSpec } from '../../utils/widgetSpec';

/**
 * Interactive graph embedded in a tutor answer (```apex-graph).
 *
 * The tutor writes the function and its parameters; the student drags sliders
 * and watches the curve respond: a derivative's slope, a projectile's
 * trajectory, a demand curve shifting, a normal distribution widening. Seeing
 * "b controls the period" beats reading it.
 *
 * Expressions are compiled by utils/mathExpr (never eval'd), and a spec that
 * fails validation renders a one-line note instead of a wrong-looking graph.
 */

const W = 480;
const H = 280;
const PAD = { l: 44, r: 14, t: 14, b: 34 };
const SAMPLES = 240;
const CURVE_CLASSES = ['text-primary-400', 'text-info-400', 'text-warning-400', 'text-error-400'];

/** "Nice" tick step for a span: 1, 2 or 5 times a power of ten. */
function niceStep(span, target = 5) {
  const raw = span / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / pow;
  return (m >= 5 ? 10 : m >= 2 ? 5 : m >= 1 ? 2 : 1) * pow;
}

function ticks(lo, hi) {
  const step = niceStep(hi - lo);
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) {
    out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return out;
}

const fmt = (v) => {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(2);
  return String(Math.round(v * 1000) / 1000);
};

function sample(curve, scope, [x0, x1]) {
  const pts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = x0 + ((x1 - x0) * i) / SAMPLES;
    let y;
    try { y = curve.fn({ ...scope, x }); } catch { y = NaN; }
    pts.push([x, y]);
  }
  return pts;
}

/** y-range that fits the curves at their starting parameters, ignoring spikes. */
function fitY(spec, scope) {
  const ys = [];
  spec.curves.forEach((c) => sample(c, scope, spec.xRange).forEach(([, y]) => Number.isFinite(y) && ys.push(y)));
  if (!ys.length) return [-10, 10];
  ys.sort((a, b) => a - b);
  let lo = ys[Math.floor(ys.length * 0.02)];
  let hi = ys[Math.ceil(ys.length * 0.98) - 1];
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12;
  lo -= pad; hi += pad;
  // Keep the x-axis in view when it is nearly in view anyway.
  if (lo > 0 && lo < (hi - lo) * 0.5) lo = 0;
  if (hi < 0 && -hi < (hi - lo) * 0.5) hi = 0;
  return [lo, hi];
}

export default function GraphWidget({ spec: raw }) {
  const spec = useMemo(() => parseGraphSpec(raw), [raw]);
  const uid = useId();
  const svgRef = useRef(null);
  const [values, setValues] = useState(() =>
    Object.fromEntries((spec?.params || []).map((p) => [p.name, p.value]))
  );
  const [hoverX, setHoverX] = useState(null);

  // Fixed once from the starting parameters, so moving a slider visibly moves
  // the curve instead of the axes re-fitting around it.
  const yRange = useMemo(
    () => (spec ? spec.yRange || fitY(spec, Object.fromEntries(spec.params.map((p) => [p.name, p.value]))) : [0, 1]),
    [spec]
  );

  if (!spec) {
    return (
      <p className="not-prose my-2 text-xs text-content-muted italic">
        (The tutor tried to draw a graph here, but it couldn't be displayed.)
      </p>
    );
  }

  const [x0, x1] = spec.xRange;
  const [y0, y1] = yRange;
  const sx = (x) => PAD.l + ((x - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (y) => PAD.t + (1 - (y - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const scope = values;

  const paths = spec.curves.map((c) => {
    let d = '';
    let pen = false;
    let prev = null;
    const span = y1 - y0;
    sample(c, scope, spec.xRange).forEach(([x, y]) => {
      // Break the line at gaps and at asymptote jumps instead of drawing a
      // vertical stroke through them.
      const ok = Number.isFinite(y) && Math.abs(y - (y0 + y1) / 2) < span * 20;
      if (!ok || (prev !== null && Math.abs(y - prev) > span * 2)) { pen = false; prev = ok ? y : null; if (!ok) return; }
      const cy = Math.max(-H, Math.min(2 * H, sy(y)));
      d += `${pen ? 'L' : 'M'}${sx(x).toFixed(1)},${cy.toFixed(1)}`;
      pen = true;
      prev = y;
    });
    return d;
  });

  const xTicks = ticks(x0, x1);
  const yTicks = ticks(y0, y1);
  const axisX = y0 <= 0 && y1 >= 0 ? sy(0) : null;
  const axisY = x0 <= 0 && x1 >= 0 ? sx(0) : null;

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px < PAD.l || px > W - PAD.r) { setHoverX(null); return; }
    setHoverX(x0 + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (x1 - x0));
  };

  const readout = hoverX === null ? null : spec.curves.map((c) => {
    try { return c.fn({ ...scope, x: hoverX }); } catch { return NaN; }
  });

  return (
    // Fixed width (capped to the bubble): a chat bubble shrinks to its content,
    // so a w-full graph collapsed to the width of the sentence above it.
    <div className="not-prose my-4 w-[36rem] max-w-full rounded-lg border border-border-strong bg-base-900 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-base-850">
        <LineChart className="w-4 h-4 text-primary-400 shrink-0" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-content-primary">{spec.title || 'Interactive graph'}</span>
      </div>

      <div className="px-2 pt-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto touch-none select-none"
          role="img"
          aria-label={`${spec.title || 'Graph'}: ${spec.curves.map((c) => `y = ${c.expr}`).join('; ')}`}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHoverX(null)}
        >
          <defs>
            <clipPath id={`${uid}-clip`}>
              <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
            </clipPath>
          </defs>

          {/* grid */}
          <g className="text-border" stroke="currentColor" strokeWidth="1">
            {xTicks.map((t) => <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={PAD.t} y2={H - PAD.b} opacity="0.5" />)}
            {yTicks.map((t) => <line key={`gy${t}`} x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} opacity="0.5" />)}
          </g>
          {/* axes */}
          <g className="text-content-muted" stroke="currentColor" strokeWidth="1.25">
            {axisX !== null && <line x1={PAD.l} x2={W - PAD.r} y1={axisX} y2={axisX} />}
            {axisY !== null && <line x1={axisY} x2={axisY} y1={PAD.t} y2={H - PAD.b} />}
          </g>
          {/* tick labels */}
          <g className="text-content-muted" fill="currentColor" fontSize="11">
            {xTicks.map((t) => <text key={`lx${t}`} x={sx(t)} y={H - PAD.b + 14} textAnchor="middle">{fmt(t)}</text>)}
            {yTicks.map((t) => <text key={`ly${t}`} x={PAD.l - 6} y={sy(t) + 3} textAnchor="end">{fmt(t)}</text>)}
          </g>
          {spec.xLabel && (
            <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" fontSize="11" className="text-content-secondary" fill="currentColor">{spec.xLabel}</text>
          )}
          {spec.yLabel && (
            <text x={12} y={(PAD.t + H - PAD.b) / 2} textAnchor="middle" fontSize="11" transform={`rotate(-90 12 ${(PAD.t + H - PAD.b) / 2})`} className="text-content-secondary" fill="currentColor">{spec.yLabel}</text>
          )}

          {/* curves */}
          <g clipPath={`url(#${uid}-clip)`}>
            {paths.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" className={CURVE_CLASSES[i]} />
            ))}
            {hoverX !== null && (
              <g>
                <line x1={sx(hoverX)} x2={sx(hoverX)} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" className="text-content-muted" strokeDasharray="3 3" />
                {readout.map((y, i) => Number.isFinite(y) && (
                  <circle key={i} cx={sx(hoverX)} cy={sy(y)} r="3.5" fill="currentColor" className={CURVE_CLASSES[i]} />
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* legend / readout */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2 text-xs">
        {spec.curves.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-content-secondary">
            <span className={`inline-block w-3 h-0.5 rounded ${CURVE_CLASSES[i]} bg-current`} />
            <span className="font-mono">{c.label}</span>
            {readout && <span className="text-content-muted">= {fmt(readout[i])}</span>}
          </span>
        ))}
        {hoverX !== null && <span className="text-content-muted">at x = {fmt(hoverX)}</span>}
      </div>

      {spec.params.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 px-3 py-3 border-t border-border bg-base-850">
          {spec.params.map((p) => (
            <div key={p.name}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <label htmlFor={`${uid}-${p.name}`} className="text-xs text-content-secondary">{p.label}</label>
                <span className="text-xs font-mono text-content-primary">{fmt(values[p.name])}</span>
              </div>
              <input
                id={`${uid}-${p.name}`}
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={values[p.name]}
                onChange={(e) => setValues((v) => ({ ...v, [p.name]: Number(e.target.value) }))}
                className="w-full accent-primary-500"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
