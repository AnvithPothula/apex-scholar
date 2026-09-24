/**
 * Practice test → AP score, on the SAME per-exam model the score calculator uses.
 *
 * A practice test is rarely a full exam: it might be 12 multiple-choice
 * questions, or one DBQ. So each exam section is filled in from the matching
 * part of the test as a percentage, scaled to that section's real raw maximum.
 * Sections the test didn't cover are PREDICTED from how the student did on the
 * parts it did cover, and reported as predicted so the calculator can say so.
 *
 * ponytail: prediction is "same percentage as what you did answer". Students
 * typically score a little lower on free response than multiple choice; a
 * per-subject MCQ→FRQ adjustment would need national section means, which the
 * College Board doesn't publish.
 */

import { getScoreModel, slugFor } from '../constants/apScoreModels';
import { computeComposite, compositeToScore } from './apScore';

// History-style sections that practice tests generate as their own types.
const NAMED = new Set(['saq', 'dbq', 'leq']);

const bucketOfType = (type) => (type === 'mcq' ? 'mcq' : NAMED.has(type) ? type : 'frq');
const bucketOfSection = (id) => (id.startsWith('mcq') ? 'mcq' : NAMED.has(id) ? id : 'frq');

/**
 * @param {string} subject
 * @param {Array<{type:string, score:number, maxPoints:number, ungraded?:boolean}>} items
 *   one per question; ungraded responses are ignored (they carry no evidence)
 * @returns {null | {model, raws, predicted:string[], measured:string[],
 *   composite:number, compositeMax:number, percent:number, score:number}}
 */
export function estimateFromTest(subject, items = []) {
  const buckets = {};
  for (const it of items) {
    if (!it || it.ungraded) continue;
    const max = Number(it.maxPoints) || 0;
    if (max <= 0) continue;
    const b = bucketOfType(it.type);
    buckets[b] = buckets[b] || { earned: 0, max: 0 };
    buckets[b].earned += Math.max(0, Math.min(max, Number(it.score) || 0));
    buckets[b].max += max;
  }
  const fractions = Object.fromEntries(
    Object.entries(buckets).map(([b, v]) => [b, v.earned / v.max])
  );
  const observed = Object.values(fractions);
  if (!observed.length) return null;
  // Each covered part counts equally, so ten MCQs don't drown out one essay.
  const overall = observed.reduce((a, b) => a + b, 0) / observed.length;

  const model = getScoreModel(subject);
  const raws = {};
  const predicted = [];
  const measured = [];
  for (const sec of model.sections) {
    let b = bucketOfSection(sec.id);
    // A generic "free response" test result also covers a named section
    // (e.g. AP African American Studies' SAQ/DBQ) when nothing more specific exists.
    if (fractions[b] === undefined && b !== 'mcq' && fractions.frq !== undefined) b = 'frq';
    const known = fractions[b] !== undefined;
    raws[sec.id] = Math.round((known ? fractions[b] : overall) * sec.maxRaw);
    (known ? measured : predicted).push(sec.id);
  }

  const { composite, compositeMax } = computeComposite(model, raws);
  return {
    model,
    raws,
    predicted,
    measured,
    composite,
    compositeMax,
    percent: compositeMax > 0 ? Math.round((composite / compositeMax) * 100) : 0,
    score: compositeToScore(model, composite),
  };
}

/**
 * Estimate for a SAVED test: the one stored with it, or — for tests saved
 * before estimates were stored, which were scored on the old one-size curve —
 * re-derived from its questions, so history agrees with the calculator.
 */
export function estimateForSavedTest(subject, results, questions = []) {
  if (results?.scoreEstimate?.raws) {
    return { ...results.scoreEstimate, score: results.apScore };
  }
  const typeById = new Map((questions || []).map((q) => [q.id, q.type]));
  return estimateFromTest(
    subject,
    (results?.questionResults || []).map((r) => ({ ...r, type: typeById.get(r.questionId) }))
  );
}

/** Deep link that opens the calculator on this subject with the sliders set. */
export function calculatorUrl(subject, estimate) {
  if (!estimate) return null;
  const params = new URLSearchParams({ from: 'test' });
  Object.entries(estimate.raws).forEach(([id, v]) => params.set(id, String(v)));
  if (estimate.predicted.length) params.set('est', estimate.predicted.join(','));
  return `/ap-score-calculator/${slugFor(subject)}?${params}`;
}
