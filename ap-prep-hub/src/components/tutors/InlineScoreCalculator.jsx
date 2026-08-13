import React, { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ExternalLink } from 'lucide-react';
import { getScoreModel, slugFor } from '../../constants/apScoreModels';
import { computeComposite, compositeToScore, pointsToNextScore, clampRawsForModel } from '../../utils/apScore';
import { createPageUrl } from '../../utils/helpers';

/**
 * A live score calculator embedded in a tutor answer.
 *
 * The tutor emits a fenced ```apex-score block containing
 * `{"subject": "AP Biology", "mcq": 50}` and this renders it, pre-filled, with
 * working sliders. Reading "you'd need about 26 FRQ points" is one thing;
 * dragging the slider and watching the 4 turn into a 5 is the thing students
 * actually came for.
 *
 * Numbers come from the same model the standalone calculator uses, so the two
 * can never disagree.
 */

/** Parse the tutor's block. Returns null on anything malformed — a broken
 *  widget must degrade to nothing, never to a wrong score. */
export function parseScoreSpec(raw) {
  let spec;
  try {
    spec = JSON.parse(String(raw || '').trim());
  } catch {
    return null;
  }
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return null;
  const subject = typeof spec.subject === 'string' ? spec.subject.trim() : '';
  if (!subject) return null;

  const model = getScoreModel(subject);
  // A generic model has no real section shape for this exam, so pre-filling one
  // would invent structure the student would reasonably trust.
  if (!model || model.generic) return null;

  return { subject, model, raws: clampRawsForModel(model, spec) };
}

export default function InlineScoreCalculator({ spec }) {
  const parsed = useMemo(() => parseScoreSpec(spec), [spec]);
  const [raws, setRaws] = useState(() => (parsed ? parsed.raws : {}));
  // A conversation can contain SEVERAL of these widgets. Fixed ids like
  // "isc-mcq" collided across them, and duplicate ids break <label for>:
  // clicking the second widget's label focused the first widget's input.
  const uid = useId();

  if (!parsed) return null;
  const { subject, model } = parsed;

  const setRaw = (id, value) => {
    const max = model.sections.find((s) => s.id === id)?.maxRaw ?? 0;
    const n = value === '' ? '' : Math.max(0, Math.min(max, Number(value) || 0));
    setRaws((prev) => ({ ...prev, [id]: n }));
  };

  const { composite, compositeMax } = computeComposite(model, raws);
  const score = compositeToScore(model, composite);
  const next = pointsToNextScore(model, composite);
  const scoreColor = score >= 4 ? 'text-success-400' : score === 3 ? 'text-warning-400' : 'text-error-400';

  return (
    <div className="my-3 rounded-lg border border-border-strong bg-base-900 p-3 not-prose">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-primary-400 shrink-0" strokeWidth={1.5} />
        <span className="text-sm font-medium text-content-primary">{model.label} score estimate</span>
      </div>

      <div className="space-y-3">
        {model.sections.map((s) => (
          <div key={s.id}>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <label htmlFor={`${uid}-${s.id}`} className="text-xs text-content-secondary">{s.label}</label>
              <span className="text-xs text-content-muted shrink-0">out of {s.maxRaw}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={s.maxRaw}
                step="1"
                aria-label={`${s.label} slider`}
                value={Number(raws[s.id]) || 0}
                onChange={(e) => setRaw(s.id, e.target.value)}
                className="flex-1 min-w-0 accent-primary-400 cursor-pointer"
              />
              <input
                id={`${uid}-${s.id}`}
                type="number"
                min="0"
                max={s.maxRaw}
                inputMode="numeric"
                value={raws[s.id] ?? ''}
                onChange={(e) => setRaw(s.id, e.target.value)}
                placeholder="0"
                className="w-16 shrink-0 bg-base-800 border border-border-strong rounded-md p-1.5 text-sm text-content-primary text-right focus:outline-none focus:ring-2 focus:ring-content-muted"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
        <div>
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-xs text-content-muted ml-2">
            {Math.round(composite)}/{compositeMax}
          </span>
        </div>
        <p className="text-xs text-content-muted text-right">
          {next ? `${next.pointsNeeded} more for a ${next.nextScore}` : 'Top band'}
        </p>
      </div>

      <p className="text-xs text-content-muted mt-2">
        Estimate — College Board does not publish its cut points.{' '}
        <Link
          to={`${createPageUrl('ApScoreCalculator')}/${slugFor(subject)}`}
          className="text-primary-400 hover:text-primary-500 underline underline-offset-2 inline-flex items-center gap-1"
        >
          Full calculator <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
        </Link>
      </p>
    </div>
  );
}
