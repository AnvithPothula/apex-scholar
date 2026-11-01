/**
 * Per-question response log — the thing every adaptive feature runs on.
 *
 * As of 2026-09-20 production held 92 users, 47 practice tests and **zero**
 * per-question response records. What responses exist are item arrays buried
 * inside practice-test documents: not queryable, not joinable across sources,
 * and missing which distractor was chosen. Elo, IRT, BKT and knowledge tracing
 * all consume the same tuple — (student, item, correct, when) — and nothing was
 * writing it.
 *
 * So this collection exists before anything reads it. Every week it does not
 * exist is a week of data that cannot be recovered later.
 *
 * Two fields earn their place beyond the obvious ones:
 *
 *   chosen      WHICH distractor, not just right/wrong. A 4-option item carries
 *               about two bits; storing only `correct` throws three quarters of
 *               it away. Once distractors are mapped to misconceptions, this is
 *               what turns "got it wrong" into "thinks the CLT is about the
 *               population distribution".
 *   msToAnswer  fast+wrong is a confident misconception (re-teach); slow+wrong
 *               is an unknown (introduce). Null where the surface genuinely
 *               cannot measure it — see below — rather than guessed.
 *
 * Append-only by rule (firestore.rules allows create, never update or delete).
 * A response is a record of something that happened; there is no legitimate
 * reason to edit one, and an editable history is not evidence.
 *
 * Storage: one `responseSets` document per test or diagnostic, holding its rows
 * in `rows`, rather than one `responses` document per answer (2026-10-24).
 * Firebase's free plan allows 20,000 writes a day for the whole site, and a
 * 50-question test spent 50 of them here alone. A set costs one write and one
 * read. Rows keep the same fields, minus `at`: Firestore does not allow
 * serverTimestamp() inside an array, so a set's rows share its `at`.
 * getMyResponses and email-weekly read both collections and return the same
 * flat rows as before, so older `responses` documents still count.
 */
import { collection, doc, writeBatch, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firestore';

export const SOURCES = ['practiceTest', 'diagnostic', 'flashcard', 'review', 'lesson'];

// Firestore caps a batch at 500 writes. Only the legacy one-document-per-row
// path below comes near it.
const BATCH_LIMIT = 450;

// Rows per responseSets document. A practice test is ~60 items, so a set is one
// document in practice; past this a call splits into several rather than
// risking Firestore's 1 MiB document limit. firestore.rules enforces the same
// cap, and responseLog.test.js checks the two agree.
export const ROWS_PER_SET = 250;

const asInt = (v) => (Number.isInteger(v) ? v : null);
const asStr = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/**
 * Normalise one row. Returns null if the row is not worth storing — an entry
 * with no item id cannot be joined to anything, so it is noise, not data.
 */
export function normalizeRow(row, uid) {
  if (!row || !uid) return null;
  const itemId = asStr(row.itemId);
  if (!itemId) return null;
  if (typeof row.correct !== 'boolean') return null;
  const ms = Number(row.msToAnswer);
  return {
    // `userId`, not `uid`: firestore.rules' ownsIncoming() checks
    // request.resource.data.userId, and the whole codebase follows that. Naming
    // it `uid` here compiled, passed its mocked tests, and would have had every
    // single write rejected at runtime — an empty log that looks like it works.
    userId: uid,
    itemId,
    subject: asStr(row.subject),
    unit: asStr(row.unit),
    source: SOURCES.includes(row.source) ? row.source : 'practiceTest',
    // Skipped items are logged with chosen: null and correct: false. Dropping
    // them would bias every later estimate — a student skipping a whole unit is
    // exactly the signal an adaptive system wants.
    chosen: asInt(row.chosen),
    correct: row.correct,
    // Clamp rather than trust. A tab left open overnight produces a 40,000,000ms
    // "answer" that would wreck any mean; 10 minutes is past the point where the
    // number means anything about the student.
    msToAnswer: Number.isFinite(ms) && ms > 0 ? Math.min(Math.round(ms), 600000) : null,
    at: serverTimestamp(),
  };
}

/** A normalised row as stored inside a set: the set carries userId and `at`. */
function setRow({ userId, at, ...rest }) {
  return rest;
}

/**
 * Write responses: one responseSets document per call (per ROWS_PER_SET rows).
 * Never throws and never blocks the caller — a logging hiccup must not cost a
 * student their results screen.
 * Returns the number of rows written (0 on any failure), for tests.
 */
export async function logResponses(uid, rows) {
  if (!uid || !Array.isArray(rows) || rows.length === 0) return 0;
  const clean = rows.map((r) => normalizeRow(r, uid)).filter(Boolean);
  if (!clean.length) return 0;
  try {
    const col = collection(db, 'responseSets');
    const batch = writeBatch(db);
    for (let i = 0; i < clean.length; i += ROWS_PER_SET) {
      const chunk = clean.slice(i, i + ROWS_PER_SET);
      const sources = [...new Set(chunk.map((r) => r.source))];
      const subjects = [...new Set(chunk.map((r) => r.subject).filter(Boolean))];
      batch.set(doc(col), {
        userId: uid,
        source: sources.length === 1 ? sources[0] : 'mixed',
        subject: subjects.length === 1 ? subjects[0] : null,
        count: chunk.length,
        rows: chunk.map(setRow),
        at: serverTimestamp(),
      });
    }
    await batch.commit();
    return clean.length;
  } catch (e) {
    // The rules for responseSets ship with `firebase deploy --only
    // firestore:rules`, separately from the site. If the site goes out first,
    // every set is refused; fall back to the old per-row documents so no
    // answers are lost in between.
    if (e?.code === 'permission-denied') return logRowsLegacy(clean);
    console.debug('[responseLog] write failed (non-fatal)', e?.message || e);
    return 0;
  }
}

async function logRowsLegacy(clean) {
  try {
    const col = collection(db, 'responses');
    for (let i = 0; i < clean.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      for (const r of clean.slice(i, i + BATCH_LIMIT)) batch.set(doc(col), r);
      await batch.commit();
    }
    return clean.length;
  } catch (e) {
    console.debug('[responseLog] write failed (non-fatal)', e?.message || e);
    return 0;
  }
}

/**
 * Flat rows from responseSets documents, in the shape a `responses` document
 * has: each row gets the set's userId and `at`.
 */
export function flattenSets(sets) {
  const out = [];
  for (const set of sets || []) {
    if (!set || !Array.isArray(set.rows)) continue;
    for (const r of set.rows) {
      if (r && typeof r === 'object') out.push({ ...r, userId: set.userId, at: set.at ?? null });
    }
  }
  return out;
}

/** Single-row convenience for the review and flashcard paths. */
export const logResponse = (uid, row) => logResponses(uid, [row]);

/**
 * This student's own logged answers, for per-topic mastery: rows from their
 * responseSets plus any older one-per-answer `responses` documents. [] on
 * failure: a read error must never blank the Progress page.
 *
 * ponytail: no orderBy (that needs a userId+at composite index), so past the
 * cap it's an arbitrary selection rather than the newest. Add the index and
 * orderBy('at', 'desc') once anyone answers that many.
 */
export async function getMyResponses(uid, max = 2000) {
  if (!uid) return [];
  const mine = (name, n) => getDocs(query(collection(db, name), where('userId', '==', uid), limit(n)))
    .then((snap) => snap.docs.map((d) => d.data()))
    .catch((e) => {
      console.debug(`[responseLog] ${name} read failed (non-fatal)`, e?.message || e);
      return [];
    });
  // A set is one read for a whole test, so this stays far below the 2,000 reads
  // the one-document-per-answer log cost a heavy user on every Progress visit.
  const [sets, legacy] = await Promise.all([
    mine('responseSets', Math.max(1, Math.ceil(max / 10))),
    mine('responses', max),
  ]);
  return [...flattenSets(sets), ...legacy].slice(0, max);
}
