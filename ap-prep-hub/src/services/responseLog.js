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
 */
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firestore';

export const SOURCES = ['practiceTest', 'diagnostic', 'flashcard', 'review'];

// Firestore caps a batch at 500 writes. A practice test is ~60 items, so this
// only ever bites if a caller passes something pathological — chunk anyway
// rather than losing the tail of a long session silently.
const BATCH_LIMIT = 450;

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

/**
 * Write responses. Never throws and never blocks the caller — a logging hiccup
 * must not cost a student their results screen.
 * Returns the number of rows written (0 on any failure), for tests.
 */
export async function logResponses(uid, rows) {
  if (!uid || !Array.isArray(rows) || rows.length === 0) return 0;
  const clean = rows.map((r) => normalizeRow(r, uid)).filter(Boolean);
  if (!clean.length) return 0;
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

/** Single-row convenience for the review and flashcard paths. */
export const logResponse = (uid, row) => logResponses(uid, [row]);
