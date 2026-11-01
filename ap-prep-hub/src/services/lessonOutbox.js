/**
 * Lesson answers waiting to be written.
 *
 * A study pack used to write every checkpoint answer the moment it happened:
 * one responseSets document per answer (32 for one unit) plus a review-queue
 * read and write per miss. Now answers collect here and go out together, like
 * a practice test's, in one response set and one queue update.
 *
 * Kept in localStorage, not just memory, because the natural end of a lesson
 * is closing the tab, and a write started while the page unloads often never
 * arrives. Whatever didn't get out goes on the next visit to Learn. Cleared
 * before sending, so a flush can lose a batch on a failed write (as a single
 * write always could) but never sends one twice.
 */
import { logResponses } from './responseLog';
import * as srs from './srs';

const key = (uid) => `apex.lessonOutbox.v1.${uid}`;
const memory = new Map(); // private windows, where localStorage throws

function read(uid) {
  try {
    const raw = localStorage.getItem(key(uid));
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to memory */ }
  return memory.get(uid) || { rows: [], misses: [] };
}

function write(uid, box) {
  memory.set(uid, box);
  try { localStorage.setItem(key(uid), JSON.stringify(box)); } catch { /* memory copy only */ }
}

function clear(uid) {
  memory.delete(uid);
  try { localStorage.removeItem(key(uid)); } catch { /* nothing stored */ }
}

/** Queue one answer (and its miss, if any). Returns how many answers are waiting. */
export function queueAnswer(uid, row, miss = null) {
  if (!uid) return 0;
  const box = read(uid);
  box.rows.push(row);
  if (miss) box.misses.push(miss);
  write(uid, box);
  return box.rows.length;
}

/** Send everything waiting for this account. Safe to call when nothing is. */
export function flushOutbox(uid) {
  if (!uid) return;
  const { rows = [], misses = [] } = read(uid);
  if (!rows.length && !misses.length) return;
  clear(uid);
  if (rows.length) logResponses(uid, rows);
  if (misses.length) srs.addMisses(uid, misses);
}
