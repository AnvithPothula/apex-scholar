/**
 * AP composite scoring engine.
 *
 * Pure and model-driven so every subject uses one code path — the previous
 * approach applied a single 75/50/40/30 percentage curve to all 36 subjects
 * (A6), which is systematically wrong wherever section weights differ.
 */

import { getScoreModel } from '../constants/apScoreModels';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * @param {object} model  from getScoreModel
 * @param {Record<string, number>} raws  section id -> raw points earned
 * @returns {{composite:number, compositeMax:number, sections:Array}}
 */
export function computeComposite(model, raws = {}) {
  let composite = 0;
  const sections = model.sections.map((s) => {
    const raw = clamp(Number(raws[s.id]) || 0, 0, s.maxRaw);
    // Guard against a malformed model: a zero maxRaw would divide by zero.
    const earned = s.maxRaw > 0 ? (raw / s.maxRaw) * s.weight : 0;
    composite += earned;
    return { ...s, raw, earned: Math.round(earned * 10) / 10 };
  });
  return {
    composite: Math.round(composite * 10) / 10,
    compositeMax: model.compositeMax,
    sections,
  };
}

/** Composite -> 1..5 using the model's cut points. */
export function compositeToScore(model, composite) {
  const c = Number(composite) || 0;
  if (c >= model.cutoffs[5]) return 5;
  if (c >= model.cutoffs[4]) return 4;
  if (c >= model.cutoffs[3]) return 3;
  if (c >= model.cutoffs[2]) return 2;
  return 1;
}

/** Composite points still needed for the next score up, or null at a 5. */
export function pointsToNextScore(model, composite) {
  const current = compositeToScore(model, composite);
  if (current >= 5) return null;
  const target = model.cutoffs[current + 1];
  return { nextScore: current + 1, pointsNeeded: Math.max(0, Math.ceil(target - composite)) };
}

/**
 * Full result for a subject.
 * @param {string} subject
 * @param {Record<string, number>} raws
 */
export function scoreFor(subject, raws) {
  const model = getScoreModel(subject);
  const { composite, compositeMax, sections } = computeComposite(model, raws);
  const score = compositeToScore(model, composite);
  return {
    model,
    sections,
    composite,
    compositeMax,
    percent: compositeMax > 0 ? Math.round((composite / compositeMax) * 100) : 0,
    score,
    next: pointsToNextScore(model, composite),
    isGeneric: Boolean(model.generic),
  };
}

/**
 * The curve as display rows — every competitor hides this, which is exactly why
 * showing it is the differentiator.
 */
export function curveRows(model) {
  const order = [5, 4, 3, 2, 1];
  return order.map((s) => {
    const min = s === 1 ? 0 : model.cutoffs[s];
    const max = s === 5 ? model.compositeMax : model.cutoffs[s + 1] - 1;
    return {
      score: s,
      min,
      max,
      percentMin: Math.round((min / model.compositeMax) * 100),
    };
  });
}

/**
 * Back-compat shim for the old percentage-only helper in PracticeTests.
 * Uses the real model when the subject has one (closing A6).
 */
export function percentToApScore(percent, subject) {
  const model = getScoreModel(subject);
  const composite = (clamp(Number(percent) || 0, 0, 100) / 100) * model.compositeMax;
  return compositeToScore(model, composite);
}

/**
 * Compact description of a subject's scoring model, for an AI tutor prompt.
 *
 * Students constantly ask "how many can I miss and still get a 4?" and the
 * tutor had no idea — it knew the curriculum but nothing about the curve, so it
 * either refused or guessed. This hands it the same numbers the score
 * calculator uses, so both surfaces answer identically.
 *
 * Returns null for unmodelled subjects rather than describing the generic
 * 50/50 fallback as if it were that exam's real curve.
 */
export function scoringBriefFor(subject) {
  const model = getScoreModel(subject);
  if (!model || model.generic) return null;

  const sections = model.sections
    .map((sec) => `${sec.label}: ${sec.maxRaw} raw points, weighted to ${sec.weight} of the composite`)
    .join('\n  ');

  const rows = curveRows(model)
    .map((r) => `Score ${r.score}: composite ${r.min}\u2013${r.max} (${r.percentMin}%+)`)
    .join('\n  ');

  return `SCORING MODEL for ${model.label} (composite out of ${model.compositeMax}):
  ${sections}
  ${rows}
Use these numbers when the student asks what they need for a given score, and
show the arithmetic. State plainly that cutoffs are estimates: College Board
does not publish the curve and it shifts year to year. Never invent a different
curve, and never promise a score.`;
}

/**
 * Clamp a bag of raw section scores to a model's sections.
 *
 * Shared by the tutor's inline calculator (which parses AI-authored JSON) and
 * the standalone page (which parses URL params). Both take numbers from a
 * source that can be wrong — an LLM, or a hand-edited query string — so both
 * need the same clamping, and having one copy means they cannot disagree.
 * Unknown keys and non-numbers are dropped rather than guessed at.
 */
export function clampRawsForModel(model, input = {}) {
  const out = {};
  if (!model || !Array.isArray(model.sections)) return out;
  model.sections.forEach((sec) => {
    const v = Number(input[sec.id]);
    if (Number.isFinite(v)) out[sec.id] = Math.max(0, Math.min(sec.maxRaw, Math.round(v)));
  });
  return out;
}
