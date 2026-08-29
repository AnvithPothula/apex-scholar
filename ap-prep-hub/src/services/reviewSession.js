/**
 * Pure helpers for the Review study loop.
 *
 * Separate from Review.jsx because that page transitively imports firebase,
 * which cannot load under jsdom — the same reason srs.test.js stubs Firestore.
 */

import { review, GRADE } from './srs';

const DAY = 24 * 60 * 60 * 1000;

/** "today" / "tomorrow" / "in 5 days" — for prose. */
export function formatDue(due, now = Date.now()) {
  const days = Math.round((due - now) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * Compact interval for a grade button ("10m", "1d", "3mo").
 *
 * Anki shows this on every button and it is the single thing that makes SM-2
 * legible: without it "Good" and "Easy" are two unlabelled doors. `review()`
 * is pure, so the real scheduler answers the question — no second model of the
 * algorithm to drift.
 */
export function intervalLabel(card, gradeKey, now = Date.now()) {
  const quality = GRADE[gradeKey];
  if (!card || quality == null) return '';
  const next = review(card, quality, now);
  const days = (next.due - now) / DAY;
  if (days < 1) return `${Math.max(1, Math.round(days * 24 * 60))}m`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

/**
 * Which grade the interactive answer implies.
 *
 * Got it wrong -> "again", full stop. Got it right -> "good"; the student can
 * still say hard or easy, but the common case should not need a decision.
 * Returns null when there is nothing to infer (legacy reveal-only cards).
 */
export function suggestedGrade({ interactive, picked, correctIndex }) {
  if (!interactive || picked == null) return null;
  return picked === correctIndex ? 'good' : 'again';
}

/**
 * Keyboard mapping for the loop.
 *
 * Reviewing is rapid-fire: reaching for the mouse between every card is what
 * makes a queue feel like a chore. Digits and letters both work because MCQ
 * options are lettered on screen but numbered on a keypad.
 *
 * @returns {{type:'choose',index:number}|{type:'grade',key:string}|{type:'reveal'}|null}
 */
export function keyAction(key, { revealed, optionCount = 0, gradeKeys = [] }) {
  const k = String(key || '');

  if (!revealed) {
    if (optionCount > 0) {
      const digit = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
      const alpha = /^[a-zA-Z]$/.test(k) ? k.toUpperCase().charCodeAt(0) - 65 : -1;
      const idx = digit >= 0 ? digit : alpha;
      if (idx >= 0 && idx < optionCount) return { type: 'choose', index: idx };
      return null;
    }
    // Reveal-only card: space or enter flips it.
    if (k === ' ' || k === 'Enter') return { type: 'reveal' };
    return null;
  }

  // After the reveal the digits mean grades, not options.
  const digit = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
  if (digit >= 0 && digit < gradeKeys.length) return { type: 'grade', key: gradeKeys[digit] };
  if (k === ' ' || k === 'Enter') return { type: 'grade', key: 'good' };
  return null;
}

/**
 * Deterministic shuffle.
 *
 * Math.random() would reshuffle on every React re-render, so a card could move
 * under your cursor mid-answer. Seeding from the session start means the order
 * is fixed for the session but different next time.
 */
export function shuffle(items = [], seed = 1) {
  const out = [...items];
  let s = Number(seed) || 1;
  const rand = () => {
    // xorshift32 — small, no dependency, good enough for card order.
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return Math.abs(s) / 2 ** 31;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The cards for a session, given the chosen subjects and order.
 *
 * `subjects` empty means every subject — the start screen treats "none picked"
 * as "all", which is what a student expects from a filter they never touched.
 */
export function buildSession(due = [], { subjects = [], order = 'scheduled', seed = 1, limit = 30 } = {}) {
  const wanted = new Set(subjects);
  const filtered = wanted.size
    ? due.filter((c) => wanted.has(c.subject || 'Practice'))
    : due;
  const ordered = order === 'random' ? shuffle(filtered, seed) : filtered;
  return ordered.slice(0, limit);
}
