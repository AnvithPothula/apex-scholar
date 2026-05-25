/**
 * Per-user curriculum progress (Khan-Academy-style completion + practice).
 *
 * Stored per user at users/{uid}/curriculumProgress/apush:
 *   {
 *     completedTopics: { [topicId]: true },
 *     practice:        { [topicId]: { correct, total } },
 *     updatedAt
 *   }
 *
 * User-owned (see firestore.rules → users/{userId}/curriculumProgress).
 */

import { doc, getDoc, setDoc, updateDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const progressRef = (uid) => doc(db, 'users', uid, 'curriculumProgress', 'apush');

const EMPTY = { completedTopics: {}, practice: {} };

export async function getProgress(uid) {
  if (!uid) return { ...EMPTY };
  try {
    const snap = await getDoc(progressRef(uid));
    const d = snap.exists() ? snap.data() : {};
    return { completedTopics: d.completedTopics || {}, practice: d.practice || {} };
  } catch (e) {
    console.error('[curriculum] getProgress failed', e);
    return { ...EMPTY };
  }
}

/** Mark a topic complete (done=true) or clear it (done=false). */
export async function setTopicComplete(uid, topicId, done = true) {
  if (!uid || !topicId) return;
  try {
    if (done) {
      await setDoc(
        progressRef(uid),
        { completedTopics: { [topicId]: true }, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } else {
      // Ensure the doc exists, then remove just this key.
      await setDoc(progressRef(uid), { updatedAt: serverTimestamp() }, { merge: true });
      await updateDoc(progressRef(uid), { [`completedTopics.${topicId}`]: deleteField() });
    }
  } catch (e) {
    console.error('[curriculum] setTopicComplete failed', e);
  }
}

/** Record a topic's practice result (best-effort; overwrites prior for that topic). */
export async function recordPractice(uid, topicId, correct, total) {
  if (!uid || !topicId) return;
  try {
    await setDoc(
      progressRef(uid),
      { practice: { [topicId]: { correct, total } }, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error('[curriculum] recordPractice failed', e);
  }
}

/** Pure helper: completion stats for a unit given a completedTopics map. */
export function unitProgress(completedTopics = {}, unit) {
  const total = unit.topics.length;
  const completed = unit.topics.filter((t) => completedTopics[t.id]).length;
  return { completed, total, pct: total ? Math.round((completed / total) * 100) : 0 };
}

const curriculumProgress = { getProgress, setTopicComplete, recordPractice, unitProgress };
export default curriculumProgress;
