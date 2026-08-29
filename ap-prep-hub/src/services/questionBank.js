/**
 * Pre-generated MCQ bank.
 *
 * Every diagnostic used to cost a live Gemini call — 15 questions generated
 * from scratch, per student, per attempt, for content that is identical for
 * everybody. On the free tier that is the single largest quota drain in the
 * app. The bank generates each question once, ever, and serves it from
 * Firestore.
 *
 * Storage shape, chosen so a diagnostic costs 2 reads instead of 200:
 *
 *   questionBankIndex/{subjectSlug}   { units: { [unitKey]: bundleCount } }
 *   questionBank/{subjectSlug}__{unitKey}__{i}
 *                                     { subject, unit, questions: [...] }
 *
 * Questions are stored in bundles of ~20 rather than one doc each, so picking a
 * random bundle is a single document read. Firestore's random-field sampling
 * trick would need a composite index and one read per question.
 *
 * WRITES ARE ADMIN-ONLY (see firestore.rules). The bank is world-readable and
 * shared by every student, so a client that could write to it could put a wrong
 * answer key in front of everyone. Seeding runs from scripts/seed-question-bank.mjs
 * with service-account credentials.
 */

// No static imports: scripts/seed-question-bank.mjs loads this file directly to
// share slugify/bundleId/isUsableQuestion, and it can only load import-free
// modules. Firestore and the logger are pulled in dynamically below, which this
// file was already doing to keep the SDK out of the eager bundle.

/** Bundle size used by the seeder. Exported so the reader can size its sampling. */
export const BUNDLE_SIZE = 20;

/** Diagnostics ask for a whole-course assessment rather than one unit. */
export const GENERAL_UNIT = 'general';

/** Stable, filesystem-safe key for a subject or unit name. */
export function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function bundleId(subject, unit, index) {
  return `${slugify(subject)}__${slugify(unit) || GENERAL_UNIT}__${index}`;
}

export function indexId(subject) {
  return slugify(subject);
}

/**
 * Which bundles to read for `count` questions.
 *
 * Reads one more bundle than strictly needed so the sample is drawn from a
 * wider pool — otherwise a student retaking a diagnostic sees the same 15 of 20
 * questions every time. Capped at 3 so a large bank never turns into a big read.
 */
export function pickBundles(bundleCount, count, rand = Math.random) {
  if (!Number.isInteger(bundleCount) || bundleCount <= 0) return [];
  const needed = Math.min(bundleCount, Math.min(3, Math.ceil(count / BUNDLE_SIZE) + 1));
  const chosen = new Set();
  // Bounded: at most 3 distinct values from `bundleCount` slots, and the loop
  // exits on the size check rather than trusting rand() to stop colliding.
  for (let guard = 0; chosen.size < needed && guard < bundleCount * 4; guard++) {
    chosen.add(Math.floor(rand() * bundleCount) % bundleCount);
  }
  return [...chosen];
}

/**
 * Reject anything the UI would render wrongly.
 *
 * Bank content is shared and long-lived, so a malformed question written months
 * ago would keep surfacing. Cheaper to drop it here than to guess a repair.
 */
export function isUsableQuestion(q) {
  if (!q || typeof q.question !== 'string' || !q.question.trim()) return false;
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return false;
  if (q.choices.some((c) => typeof c !== 'string' || !c.trim())) return false;
  if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
  if (!Array.isArray(q.explanations) || q.explanations.length !== 4) return false;
  return true;
}

/**
 * Models fence their JSON; take the outermost array.
 *
 * Twenty questions with four explanations each sits near the output-token
 * ceiling, so a response is regularly cut off mid-object and the array never
 * closes. Rather than throw the whole call away, salvage back to the last
 * complete object. The seeder still rejects the bundle if too little survived.
 */
export function extractQuestionArray(text) {
  const start = text.indexOf('[');
  if (start === -1) return null;

  const end = text.lastIndexOf(']');
  if (end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // fall through to salvage
    }
  }

  // Walk the array tracking nesting, and remember where each top-level object
  // ended. String-aware, so a "]" or "}" inside a question doesn't fool it.
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastComplete = -1;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escaped) { escaped = false; continue; }
    if (c === '\\') { escaped = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') {
      depth--;
      if (depth === 1 && c === '}') lastComplete = i;
    }
  }
  if (lastComplete === -1) return null;
  try {
    return JSON.parse(`${text.slice(start, lastComplete + 1)}]`);
  } catch {
    return null;
  }
}

/** Shuffle + take, dropping unusable entries and duplicate stems. */
export function sampleQuestions(bundles, count, rand = Math.random) {
  const seen = new Set();
  const pool = [];
  for (const b of bundles || []) {
    for (const q of (b && b.questions) || []) {
      if (!isUsableQuestion(q)) continue;
      const key = q.question.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push(q);
    }
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// The index rarely changes and every diagnostic reads it. One read per session
// per subject rather than one per attempt.
const indexCache = new Map();

/** Test seam — the cache would otherwise leak between cases. */
export function _clearIndexCache() {
  indexCache.clear();
}

async function readIndex(subject) {
  const key = indexId(subject);
  if (indexCache.has(key)) return indexCache.get(key);

  const { db } = await import('../config/firestore');
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'questionBankIndex', key));
  const data = snap.exists() ? snap.data() : null;
  indexCache.set(key, data);
  return data;
}

/**
 * Questions for `subject` from the bank. Returns [] whenever the bank can't
 * serve — an empty bank, a missing index, offline, a rules change. Callers fall
 * back to live generation, so a bank failure must never surface as an error.
 */
export async function getBankQuestions(subject, { unit = GENERAL_UNIT, count = 15 } = {}) {
  try {
    const index = await readIndex(subject);
    const bundleCount = index?.units?.[slugify(unit) || GENERAL_UNIT];
    const picks = pickBundles(bundleCount, count);
    if (!picks.length) return [];

    const { db } = await import('../config/firestore');
    const { doc, getDoc } = await import('firebase/firestore');
    const snaps = await Promise.all(
      picks.map((i) => getDoc(doc(db, 'questionBank', bundleId(subject, unit, i))))
    );
    const bundles = snaps.filter((s) => s.exists()).map((s) => s.data());
    return sampleQuestions(bundles, count);
  } catch (err) {
    const { default: errorLogger } = await import('../utils/errorLogger');
    errorLogger.warn('questionBank: falling back to live generation', err);
    return [];
  }
}
