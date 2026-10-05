/**
 * First-run check: pick a subject, answer 10 banked questions, get a predicted
 * AP score with an honest range and what to do today.
 *
 * Pure helpers only, so the rules are testable without React or Firestore.
 */

import { AP_EXAM_DATES_2027, SUBJECT_KEY_TO_EXAM_NAME } from '../constants/apExamDates';
import { AP_SCORE_MODELS, canonicalSubject } from '../constants/apScoreModels';
import { estimateFromTest } from './testToScore';

export const FIRST_RUN_QUESTIONS = 10;
/** Below this the bank can't support a score claim; send them elsewhere. */
export const FIRST_RUN_MIN_QUESTIONS = 6;

export const FIRST_RUN_DONE_KEY = 'apex.firstRun.done';
export const FIRST_RUN_PENDING_KEY = 'apex.firstRun.pending';

/** Exam subjects that have a score model, i.e. a multiple-choice section to predict from. */
export const FIRST_RUN_SUBJECTS = Object.keys(AP_EXAM_DATES_2027)
  .filter((name) => AP_SCORE_MODELS[canonicalSubject(name)])
  .sort();

/** Curriculum key ("biology") for an exam name, or null. */
export function subjectKeyFor(examName) {
  const hit = Object.entries(SUBJECT_KEY_TO_EXAM_NAME).find(([, n]) => n === examName);
  return hit ? hit[0] : null;
}

/** The first of a user's saved subjects that the first-run check supports. */
export function defaultSubject(subjectKeys = []) {
  for (const key of subjectKeys || []) {
    const name = SUBJECT_KEY_TO_EXAM_NAME[key];
    if (name && FIRST_RUN_SUBJECTS.includes(name)) return name;
  }
  return null;
}

/** Whole days from `now` to the exam's main sitting, or null when unknown/past. */
export function daysToExam(examName, now = new Date()) {
  const info = AP_EXAM_DATES_2027[examName];
  if (!info?.date) return null;
  const [y, m, d] = info.date.split('-').map(Number);
  const exam = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((exam - today) / 86400000);
  return days >= 0 ? days : null;
}

/**
 * Wilson score interval for k of n. z = 1.28 is an 80% interval: wide enough to
 * be honest about ten questions, narrow enough to still say something.
 */
export function wilson(k, n, z = 1.28) {
  if (!n) return [0, 1];
  const p = k / n;
  const z2 = z * z;
  const centre = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

const scoreAt = (subject, fraction) =>
  estimateFromTest(subject, [{ type: 'mcq', score: fraction * 1000, maxPoints: 1000 }]);

/**
 * Predicted AP score plus the range the ten answers actually support.
 * Free response is predicted at the multiple-choice rate (see testToScore.js).
 */
export function predictFromCheck(subject, correct, total) {
  const estimate = estimateFromTest(subject, [{ type: 'mcq', score: correct, maxPoints: total }]);
  if (!estimate) return null;
  const [lo, hi] = wilson(correct, total);
  return { estimate, low: scoreAt(subject, lo).score, high: scoreAt(subject, hi).score };
}

/** Concepts the student missed, most-missed first. */
export function missedConcepts(questions, answers) {
  const counts = new Map();
  questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) return;
    const c = (q.concept || '').trim();
    if (c) counts.set(c, (counts.get(c) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

/**
 * Where "/" should send someone. Returns null while the answer isn't known yet
 * (auth resolving, or a signed-in user's profile still loading), so the caller
 * renders nothing instead of bouncing a returning user through /start.
 */
export function homePath({ user, isGuest, localDone }) {
  if (localDone) return '/ai-tutors';
  if (isGuest) return '/start';
  if (!user || !user.profileLoaded) return null;
  return user.firstRunAt || user.firstRunSkippedAt ? '/ai-tutors' : '/start';
}
