/**
 * Mastery model — what the student is actually good and bad at.
 *
 * Computed from saved practice tests (users' `practiceTests` docs), which
 * already carry per-question results. Pure functions only: the caller fetches,
 * this file decides.
 *
 * Design rule: NEVER invent a weakness. An area needs MIN_SAMPLES answered
 * questions before it gets a verdict; below that it reports `insufficient` so
 * the UI can say "keep practicing" instead of guessing. (This replaces the
 * hardcoded strong/weak topic lists that used to show every user the same
 * fake "Basic Fundamentals" weakness.)
 */

const MIN_SAMPLES = 5;
const GREEN = 80;
const YELLOW = 60;

/** Human labels for the question-type keys used in a test's breakdown. */
const TYPE_LABELS = {
  mcq: 'Multiple choice',
  frq: 'Free response',
  saq: 'Short answer (SAQ)',
  dbq: 'Document-based (DBQ)',
  leq: 'Long essay (LEQ)',
  writing: 'Writing',
};

/**
 * A test the student opened and submitted without answering anything.
 *
 * Scoring it as 0% is arithmetically true but tells you nothing about what they
 * know — "you're weak at multiple choice" is the wrong conclusion from "you
 * didn't answer". Left in, a single abandoned test makes the app confidently
 * name a weakest area for someone who has never actually practiced.
 */
const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

/**
 * Did the student actually attempt this question?
 *
 * `userAnswers` is keyed by question id. When a test has no answer map at all
 * (older docs) we fall back to counting everything, since we can't tell.
 */
export function wasAttempted(test, questionResult) {
  const answers = test && test.userAnswers;
  if (!answers || typeof answers !== 'object') return true;
  const id = questionResult && questionResult.questionId;
  if (id === undefined || id === null) return true;
  return hasValue(answers[id]) || hasValue(answers[String(id)]);
}

export function isAbandoned(test) {
  const answers = test && test.userAnswers;
  if (!answers || typeof answers !== 'object') return true;
  return !Object.values(answers).some(hasValue);
}

/** red / yellow / green, or 'insufficient' when there isn't enough evidence. */
export function levelFor(accuracy, samples, minSamples = MIN_SAMPLES) {
  if (!samples || samples < minSamples) return 'insufficient';
  if (accuracy >= GREEN) return 'green';
  if (accuracy >= YELLOW) return 'yellow';
  return 'red';
}

const pct = (correct, total) => (total ? Math.round((correct / total) * 100) : 0);

/**
 * Roll up one subject's tests into an accuracy profile.
 *
 * Areas are keyed by question type (always present) and by unit when the test
 * recorded which units it covered.
 */
export function subjectMastery(subject, tests = []) {
  // An area tracks TWO different things and they must not be conflated:
  //   correct/total — POINTS, so an FRQ scoring 4/6 counts as partial credit
  //                   rather than a flat "wrong".
  //   count         — QUESTIONS, the honest measure of how much evidence we
  //                   have. A 6-point FRQ is one question, not six.
  // The old version used the saved `breakdown`, whose totals are maxPoints, and
  // then described them as "questions" — so 6 essays were reported as 36.
  const areas = new Map();
  const bump = (key, label, correct, total, count) => {
    if (!total) return;
    const a = areas.get(key) || { key, label, correct: 0, total: 0, count: 0 };
    a.correct += correct;
    a.total += total;
    a.count += count;
    areas.set(key, a);
  };

  let correct = 0;
  let total = 0;
  const apScores = [];
  let lastAt = null;

  for (const t of tests) {
    if (isAbandoned(t)) continue;
    const r = t.results || {};
    const all = Array.isArray(r.questionResults) ? r.questionResults : [];

    // Only questions the student ACTUALLY ATTEMPTED are evidence. Skipping a
    // question scores 0 on the exam, but it says nothing about what they know —
    // counting it as "wrong" is how answering 4 of 66 produced a confident
    // "you're weak at multiple choice, 0% across 60 questions".
    const qrs = all.filter((q) => wasAttempted(t, q));

    // Per-question truth is the most reliable signal; fall back to the summary
    // only when there are no per-question records at all.
    if (qrs.length) {
      const gotRight = qrs.filter((q) => q.correct).length;
      correct += gotRight;
      total += qrs.length;
    } else if (!all.length && typeof r.percentage === 'number') {
      correct += Math.round(r.percentage);
      total += 100;
    }

    if (typeof r.apScore === 'number') apScores.push(r.apScore);
    const at = toMillis(t.createdAt);
    if (at && (!lastAt || at > lastAt)) lastAt = at;

    // Prefer joining questionResults to questions: that yields a real per-type
    // QUESTION count. The saved breakdown only carries points.
    const typeById = new Map((Array.isArray(t.questions) ? t.questions : []).map((q) => [q.id, q.type]));
    if (qrs.length && typeById.size) {
      for (const r of qrs) {
        const raw = typeById.get(r.questionId);
        const type = TYPE_LABELS[raw] ? raw : 'writing';
        const max = Number(r.maxPoints) || 1;
        const got = Number(r.score) || 0;
        bump(`type:${type}`, TYPE_LABELS[type], got, max, 1);
      }
    } else if (!all.length) {
      // Fallback for older docs with no per-question records at all: points
      // only, and we cannot know the question count, so approximate it as the
      // point total. Guarded on `!all.length` so a test whose questions were
      // all filtered out as unattempted does NOT fall through to the raw
      // breakdown, which counts skipped questions as wrong.
      for (const [type, b] of Object.entries(r.breakdown || {})) {
        if (b && b.total) bump(`type:${type}`, TYPE_LABELS[type] || type.toUpperCase(), b.correct || 0, b.total, b.total);
      }
    }

    // Unit-level detail only exists on tests that recorded their unit filter.
    const units = Array.isArray(t.selectedUnits) ? t.selectedUnits : [];
    if (units.length === 1 && qrs.length) {
      const u = String(units[0]);
      bump(`unit:${u}`, u, qrs.filter((q) => q.correct).length, qrs.length, qrs.length);
    }
  }

  const scored = [...areas.values()].map((a) => {
    const accuracy = pct(a.correct, a.total);
    // Evidence is counted in questions, never points.
    return { ...a, accuracy, level: levelFor(accuracy, a.count) };
  });

  const accuracy = pct(correct, total);
  return {
    subject,
    attempts: tests.length,
    questionsAnswered: total,
    accuracy,
    level: levelFor(accuracy, total),
    latestAPScore: apScores.length ? apScores[apScores.length - 1] : null,
    bestAPScore: apScores.length ? Math.max(...apScores) : null,
    lastStudied: lastAt,
    areas: scored.sort((a, b) => a.accuracy - b.accuracy),
    // Only areas with real evidence behind them.
    weakAreas: scored.filter((a) => a.level === 'red' || a.level === 'yellow').sort((a, b) => a.accuracy - b.accuracy),
    strongAreas: scored.filter((a) => a.level === 'green').sort((a, b) => b.accuracy - a.accuracy),
  };
}

/** Group raw practiceTests docs by subject and score each one. */
export function masteryBySubject(tests = []) {
  const bySubject = new Map();
  for (const t of tests) {
    const s = (t && t.subject) || '';
    // Drop abandoned tests here too, so a subject whose only attempt was a blank
    // submission doesn't show up as a studied subject at all.
    if (!s || isAbandoned(t)) continue;
    if (!bySubject.has(s)) bySubject.set(s, []);
    bySubject.get(s).push(t);
  }
  return [...bySubject.entries()]
    .map(([subject, list]) => subjectMastery(subject, list))
    .sort((a, b) => (b.lastStudied || 0) - (a.lastStudied || 0));
}

/**
 * The one thing to fix next: the weakest area with enough evidence to trust,
 * across every subject. Drives the "Fix my weakest topic" flow.
 */
export function weakestArea(masteries = []) {
  let worst = null;
  for (const m of masteries) {
    for (const a of m.weakAreas) {
      const candidate = { ...a, subject: m.subject };
      if (!worst) { worst = candidate; continue; }
      if (candidate.accuracy < worst.accuracy) { worst = candidate; continue; }
      // Ties are common early on (several areas sitting at 0%). Break them by
      // evidence so "Focus next" is stable across reloads instead of flipping
      // between equally-bad areas.
      if (candidate.accuracy === worst.accuracy && candidate.count > worst.count) worst = candidate;
    }
  }
  return worst;
}

/** Firestore Timestamp | Date | number -> epoch ms (or null). */
function toMillis(v) {
  if (!v) return null;
  if (typeof v === 'number') return v;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.toDate === 'function') return v.toDate().getTime();
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

const mastery = { levelFor, subjectMastery, masteryBySubject, weakestArea, isAbandoned, MIN_SAMPLES };
export default mastery;
