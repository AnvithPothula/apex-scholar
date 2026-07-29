/**
 * Spaced repetition (SM-2) over questions the user got wrong.
 *
 * The retention half of the practice-first pivot: a missed question is not a
 * dead end, it comes back on a schedule until it sticks.
 *
 * Storage: ONE doc at users/{uid}/progress/reviewQueue (that path is already
 * allowed by firestore.rules, so this ships without a rules deploy).
 * ponytail: single doc caps at 1MB, so the queue is trimmed to MAX_CARDS
 * (oldest-reviewed first). Move to a per-card subcollection if users ever
 * legitimately hold more than that.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const MAX_CARDS = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Grades a student can give themselves, mapped to SM-2 quality scores. */
export const GRADE = { again: 2, hard: 3, good: 4, easy: 5 };

const clampEase = (ef) => Math.max(1.3, Math.min(3.0, ef));

/**
 * Pure SM-2 step. Returns the card's next scheduling state.
 *
 * @param {object} card  { interval, ease, reps }  (missing fields = new card)
 * @param {number} quality 0-5; below 3 is a lapse
 * @param {number} now   epoch ms (injected so tests are deterministic)
 */
export function review(card = {}, quality = GRADE.good, now = Date.now()) {
  const q = Math.max(0, Math.min(5, Number(quality) || 0));
  const prevEase = Number(card.ease) || 2.5;
  const prevReps = Number(card.reps) || 0;
  const prevInterval = Number(card.interval) || 0;

  // SM-2 ease update runs on every grade, including lapses.
  const ease = clampEase(prevEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  let reps;
  let interval;
  if (q < 3) {
    // Lapse: back to the start of the ladder, but keep the (now lower) ease.
    reps = 0;
    interval = 1;
  } else {
    reps = prevReps + 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.max(1, Math.round(prevInterval * ease));
  }

  return {
    ...card,
    ease,
    reps,
    interval,
    lapses: (Number(card.lapses) || 0) + (q < 3 ? 1 : 0),
    lastReviewed: now,
    due: now + interval * DAY_MS,
  };
}

/** Build a review card from a question the user missed. */
export function cardFromMiss({ question, subject, unit, userAnswer, correctAnswer, explanation }, now = Date.now()) {
  const text = String(question || '').trim();
  if (!text) return null;
  return {
    id: cardId(subject, text),
    subject: subject || '',
    unit: unit || null,
    question: text.slice(0, 1000),
    userAnswer: userAnswer == null ? '' : String(userAnswer).slice(0, 500),
    correctAnswer: correctAnswer == null ? '' : String(correctAnswer).slice(0, 500),
    explanation: String(explanation || '').slice(0, 1500),
    ease: 2.5,
    reps: 0,
    interval: 0,
    lapses: 0,
    createdAt: now,
    // Due immediately — you just got it wrong.
    due: now,
  };
}

/** Stable id so re-missing the same question updates one card instead of piling up. */
export function cardId(subject, questionText) {
  const key = `${subject || ''}|${String(questionText || '').trim().toLowerCase()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return `c${(h >>> 0).toString(36)}`;
}

/** Cards ready to study, hardest-overdue first. */
export function dueCards(cards = [], now = Date.now(), limit = 20) {
  return cards
    .filter((c) => c && (c.due == null || c.due <= now))
    .sort((a, b) => (a.due || 0) - (b.due || 0))
    .slice(0, limit);
}

/** Keep the queue inside one Firestore doc: drop the longest-scheduled cards first. */
export function trim(cards = [], max = MAX_CARDS) {
  if (cards.length <= max) return cards;
  return [...cards].sort((a, b) => (a.interval || 0) - (b.interval || 0)).slice(0, max);
}

// ---- Firestore layer -----------------------------------------------------

const queueRef = (uid) => doc(db, 'users', uid, 'progress', 'reviewQueue');

export async function getQueue(uid) {
  if (!uid) return [];
  try {
    const snap = await getDoc(queueRef(uid));
    return snap.exists() ? snap.data().cards || [] : [];
  } catch (e) {
    console.error('[srs] getQueue failed', e);
    return [];
  }
}

async function saveQueue(uid, cards) {
  await setDoc(queueRef(uid), { cards: trim(cards), updatedAt: serverTimestamp() });
}

/**
 * Add every miss from a finished test to the queue (existing cards are reset
 * to due-now rather than duplicated).
 */
export async function addMisses(uid, misses = [], now = Date.now()) {
  if (!uid || !misses.length) return 0;
  try {
    const existing = await getQueue(uid);
    const byId = new Map(existing.map((c) => [c.id, c]));
    let added = 0;
    for (const miss of misses) {
      const card = cardFromMiss(miss, now);
      if (!card) continue;
      const prior = byId.get(card.id);
      // Missed again: keep its history, but make it due now and knock the ease down.
      byId.set(card.id, prior ? { ...review(prior, GRADE.again, now), due: now } : card);
      added += 1;
    }
    await saveQueue(uid, [...byId.values()]);
    return added;
  } catch (e) {
    console.error('[srs] addMisses failed', e);
    return 0;
  }
}

/** Grade one card and persist the new schedule. */
export async function gradeCard(uid, id, quality, now = Date.now()) {
  if (!uid || !id) return null;
  try {
    const cards = await getQueue(uid);
    const idx = cards.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = review(cards[idx], quality, now);
    const next = [...cards];
    next[idx] = updated;
    await saveQueue(uid, next);
    return updated;
  } catch (e) {
    console.error('[srs] gradeCard failed', e);
    return null;
  }
}

const srs = { GRADE, review, cardFromMiss, cardId, dueCards, trim, getQueue, addMisses, gradeCard };
export default srs;
