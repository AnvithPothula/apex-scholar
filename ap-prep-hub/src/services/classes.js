/**
 * Classes / clubs — the join-link growth loop.
 *
 * One teacher or club lead creates a class, shares one link, and everyone who
 * opens it joins a shared roster with a leaderboard. This converts adoption
 * from N individual decisions into one adult's decision, which is how every
 * bottom-up edtech product (Kahoot, Quizlet, Canva for Education) actually grew.
 *
 * Data model
 *   classes/{code}                  the class. The document id IS the join code.
 *   classes/{code}/members/{uid}    one row per student, written only by that
 *                                   student, carrying denormalised stats.
 *   users/{uid}/classes/{code}      pointer so "my classes" is a user-scoped
 *                                   read instead of a collection-group query.
 *
 * Why the id is the code: joining is then a single `get` by id, so the rules
 * never need to allow a query across `classes` — which would let anyone
 * enumerate every class name in the app. `list` stays denied to non-owners.
 *
 * ponytail: leaderboard stats are written by each student's own client, so a
 * determined student could inflate their own row. That is the correct trade for
 * a study leaderboard with no stakes; move the aggregation server-side (a
 * Netlify function or a Cloud Function on practiceTests writes) if it ever
 * carries a grade.
 */

import { loadFirestore } from '../config/firestoreLazy';
import {
  generateClassCode,
  normalizeClassCode,
  sanitizeClassName,
  sanitizeDisplayName,
} from '../utils/classCode';

const MAX_MEMBERS_SHOWN = 100;

/**
 * Ownership check that tolerates both shapes: `ownerIds` (current, supports
 * co-teachers) and a bare `ownerId` (any class written before multi-owner).
 */
export function isOwnerOf(klass, uid) {
  if (!klass || !uid) return false;
  if (Array.isArray(klass.ownerIds)) return klass.ownerIds.includes(uid);
  return klass.ownerId === uid;
}

/** Owner list, normalised across both shapes. */
export function ownerIdsOf(klass) {
  if (!klass) return [];
  if (Array.isArray(klass.ownerIds)) return klass.ownerIds.filter(Boolean);
  return klass.ownerId ? [klass.ownerId] : [];
}

/** Create a class and return { id, name, ... }, or null on failure. */
export async function createClass(user, { name, subjects = [] } = {}) {
  if (!user?.uid) return null;
  // Every path returns null rather than throwing. A throw here would escape the
  // caller's `await` and leave its loading flag stuck on forever — which is
  // exactly what happens against undeployed rules, or on any network blip.
  try {
    const { db, doc, getDoc, setDoc, serverTimestamp } = await loadFirestore();

    // 31^8 makes a collision vanishingly unlikely, but "unlikely" would silently
    // hand two teachers the same roster, so check before writing.
    let code = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateClassCode();
      const snap = await getDoc(doc(db, 'classes', candidate));
      if (!snap.exists()) { code = candidate; break; }
    }
    if (!code) {
      console.error('[classes] could not allocate an unused join code');
      return null;
    }

    const payload = {
      name: sanitizeClassName(name),
      // Empty means "every subject counts". A non-empty list scopes the
      // leaderboard, so an AP Bio class isn't topped by someone's AP Psych run.
      subjects: Array.isArray(subjects) ? subjects.filter(Boolean).slice(0, 12) : [],
      // ownerIds is the authority (co-teachers); ownerId records the creator
      // for display only.
      ownerIds: [user.uid],
      ownerId: user.uid,
      ownerName: sanitizeDisplayName(user.displayName),
      // 0, not 1 — the joinClass call immediately below increments it. Seeding
      // it at 1 made every class report one more member than it had.
      memberCount: 0,
      archived: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'classes', code), payload);
    // The owner is a member too, so they appear on their own roster.
    await joinClass(user, code);
    return { id: code, ...payload };
  } catch (e) {
    console.error('[classes] createClass failed', e);
    return null;
  }
}

/** Fetch a class by join code without joining it (used by the join preview). */
export async function getClass(code) {
  const id = normalizeClassCode(code);
  if (!id) return null;
  try {
    const { db, doc, getDoc } = await loadFirestore();
    const snap = await getDoc(doc(db, 'classes', id));
    return snap.exists() ? { id, ...snap.data() } : null;
  } catch (e) {
    console.error('[classes] getClass failed', e);
    return null;
  }
}

/**
 * Join a class. Idempotent: re-joining refreshes the display name and never
 * resets stats, so a student clicking the link twice doesn't lose progress.
 *
 * @returns {'joined'|'already'|'notfound'|'error'}
 */
export async function joinClass(user, code, displayName) {
  if (!user?.uid) return 'error';
  const id = normalizeClassCode(code);
  if (!id) return 'notfound';

  try {
    const { db, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } = await loadFirestore();

    const classSnap = await getDoc(doc(db, 'classes', id));
    if (!classSnap.exists()) return 'notfound';

    const memberRef = doc(db, 'classes', id, 'members', user.uid);
    const existing = await getDoc(memberRef);
    const name = sanitizeDisplayName(displayName || user.displayName);

    if (existing.exists()) {
      await setDoc(memberRef, { displayName: name, lastActive: serverTimestamp() }, { merge: true });
      return 'already';
    }

    await setDoc(memberRef, {
      userId: user.uid,
      displayName: name,
      questionsAnswered: 0,
      correctAnswers: 0,
      testsTaken: 0,
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });

    // Pointer doc so "my classes" is a cheap user-scoped read. `subjects` is
    // denormalised here so recordTestForClasses can filter without re-reading
    // every class document after every test.
    await setDoc(doc(db, 'users', user.uid, 'classes', id), {
      classId: id,
      name: classSnap.data().name || '',
      subjects: Array.isArray(classSnap.data().subjects) ? classSnap.data().subjects : [],
      joinedAt: serverTimestamp(),
    });

    // Best-effort counter; the roster length is the source of truth.
    try {
      await updateDoc(doc(db, 'classes', id), { memberCount: increment(1) });
    } catch (e) {
      console.warn('[classes] memberCount bump failed (non-fatal)', e);
    }

    return 'joined';
  } catch (e) {
    console.error('[classes] joinClass failed', e);
    return 'error';
  }
}

/** Classes this user belongs to. */
export async function getMyClasses(uid) {
  if (!uid) return [];
  try {
    const { db, collection, getDocs } = await loadFirestore();
    const snap = await getDocs(collection(db, 'users', uid, 'classes'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('[classes] getMyClasses failed', e);
    return [];
  }
}

/**
 * Same as getMyClasses, but drops (and cleans up) pointers to classes that no
 * longer exist. This is how a deleted class disappears from a student's list:
 * the owner can't reach their pointer doc, so the student's own client prunes it
 * the next time it looks.
 */
export async function getMyClassesLive(uid) {
  const pointers = await getMyClasses(uid);
  if (!pointers.length) return [];
  try {
    const { db, doc, getDoc, deleteDoc } = await loadFirestore();
    const checked = await Promise.all(
      pointers.map(async (p) => {
        try {
          const snap = await getDoc(doc(db, 'classes', p.id));
          if (snap.exists()) return { ...p, ...snap.data(), id: p.id };
          await deleteDoc(doc(db, 'users', uid, 'classes', p.id)).catch(() => {});
          return null;
        } catch {
          // A read failure is not proof of deletion — keep the pointer.
          return p;
        }
      })
    );
    return checked.filter(Boolean);
  } catch (e) {
    console.error('[classes] getMyClassesLive failed', e);
    return pointers;
  }
}

/**
 * Roster sorted for a leaderboard: accuracy first, then volume as the
 * tiebreak, so a student who answered 200 questions outranks one who answered
 * 3 at the same percentage. Members with no attempts yet sort last rather than
 * appearing as 0% — not having started is not the same as scoring zero (A18).
 */
export async function getLeaderboard(code) {
  const id = normalizeClassCode(code);
  if (!id) return [];
  try {
    const { db, collection, getDocs } = await loadFirestore();
    const snap = await getDocs(collection(db, 'classes', id, 'members'));
    // Map everything, then sort, THEN cap. Capping first (the original order)
    // took an arbitrary 100 documents and ranked those — in a class of 150 the
    // actual top scorers could be missing from their own leaderboard.
    const rows = snap.docs.map((d) => {
      const m = d.data() || {};
      const answered = Number(m.questionsAnswered) || 0;
      const correct = Number(m.correctAnswers) || 0;
      return {
        uid: d.id,
        displayName: m.displayName || 'Anonymous',
        questionsAnswered: answered,
        correctAnswers: correct,
        testsTaken: Number(m.testsTaken) || 0,
        accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
      };
    });
    rows.sort((a, b) => {
      if (a.accuracy === null && b.accuracy === null) return b.questionsAnswered - a.questionsAnswered;
      if (a.accuracy === null) return 1;
      if (b.accuracy === null) return -1;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.questionsAnswered - a.questionsAnswered;
    });
    return rows.slice(0, MAX_MEMBERS_SHOWN);
  } catch (e) {
    console.error('[classes] getLeaderboard failed', e);
    return [];
  }
}

/**
 * Add one finished test to this student's row in every class they're in.
 * Best-effort and non-blocking: a leaderboard that misses a test is a far
 * smaller problem than a results screen that fails to render.
 */
export async function recordTestForClasses(uid, { questionsAnswered = 0, correctAnswers = 0, subject = null } = {}) {
  if (!uid || questionsAnswered <= 0) return 0;
  try {
    const all = await getMyClasses(uid);
    // A class with a subject list only counts tests in those subjects; a class
    // with none counts everything. Without this an AP Bio class leaderboard
    // could be topped by someone grinding a different subject entirely.
    const classes = all.filter((c) => {
      const scope = Array.isArray(c.subjects) ? c.subjects.filter(Boolean) : [];
      return scope.length === 0 || (subject && scope.includes(subject));
    });
    if (!classes.length) return 0;
    const { db, doc, setDoc, increment, serverTimestamp } = await loadFirestore();
    await Promise.all(
      classes.map((c) =>
        setDoc(
          doc(db, 'classes', c.id, 'members', uid),
          {
            userId: uid,
            questionsAnswered: increment(questionsAnswered),
            correctAnswers: increment(correctAnswers),
            testsTaken: increment(1),
            lastActive: serverTimestamp(),
          },
          { merge: true }
        ).catch((e) => console.warn(`[classes] stat update failed for ${c.id}`, e))
      )
    );
    return classes.length;
  } catch (e) {
    console.error('[classes] recordTestForClasses failed', e);
    return 0;
  }
}

/**
 * Delete a class. Owner only.
 *
 * Removes every roster row (the owner is allowed to, by rule) and then the
 * class itself. It cannot remove other students' `users/{uid}/classes/{id}`
 * pointers — no user may write another user's document, and weakening that rule
 * to allow it would be a far worse trade than leaving a stale pointer. Those
 * pointers self-heal: getMyClasses prunes any that no longer resolve.
 *
 * @returns {'deleted'|'notowner'|'error'}
 */
export async function deleteClass(uid, code) {
  const id = normalizeClassCode(code);
  if (!uid || !id) return 'error';
  try {
    const { db, doc, getDoc, getDocs, collection, deleteDoc } = await loadFirestore();
    const snap = await getDoc(doc(db, 'classes', id));
    if (!snap.exists()) return 'error';
    if (!isOwnerOf(snap.data(), uid)) return 'notowner';

    const members = await getDocs(collection(db, 'classes', id, 'members'));
    await Promise.all(
      members.docs.map((m) =>
        deleteDoc(doc(db, 'classes', id, 'members', m.id))
          .catch((e) => console.warn(`[classes] could not remove member ${m.id}`, e))
      )
    );
    await deleteDoc(doc(db, 'classes', id));
    // The owner's own pointer they can always remove.
    await deleteDoc(doc(db, 'users', uid, 'classes', id)).catch(() => {});
    return 'deleted';
  } catch (e) {
    console.error('[classes] deleteClass failed', e);
    return 'error';
  }
}

/**
 * Leave a class (removes the roster row and the pointer).
 *
 * The owner cannot leave: a class with no owner can never be deleted or
 * administered again, and silently orphaning a roster of students is worse than
 * refusing. They delete it instead.
 *
 * @returns {true|'owner'|false}
 */
export async function leaveClass(uid, code) {
  const id = normalizeClassCode(code);
  if (!uid || !id) return false;
  try {
    const { db, doc, getDoc, deleteDoc, updateDoc, increment } = await loadFirestore();

    const snap = await getDoc(doc(db, 'classes', id));
    // A sole owner may not leave — an ownerless class could never be deleted or
    // administered again. A co-owner may, because someone is still in charge.
    if (snap.exists() && isOwnerOf(snap.data(), uid) && ownerIdsOf(snap.data()).length <= 1) {
      return 'owner';
    }
    await deleteDoc(doc(db, 'classes', id, 'members', uid));
    await deleteDoc(doc(db, 'users', uid, 'classes', id));
    try {
      await updateDoc(doc(db, 'classes', id), { memberCount: increment(-1) });
    } catch (e) {
      console.warn('[classes] memberCount decrement failed (non-fatal)', e);
    }
    return true;
  } catch (e) {
    console.error('[classes] leaveClass failed', e);
    return false;
  }
}

/**
 * Promote a member to co-owner, or demote one. Owners only.
 *
 * Promotion is done from the roster rather than by typing an email, so no user
 * lookup by email is ever needed — that keeps a "search users by email" path
 * out of a product used by minors.
 *
 * @param {'promote'|'demote'} action
 * @returns {'ok'|'notowner'|'lastowner'|'notmember'|'error'}
 */
export async function setOwner(uid, code, targetUid, action = 'promote') {
  const id = normalizeClassCode(code);
  if (!uid || !id || !targetUid) return 'error';
  try {
    const { db, doc, getDoc, updateDoc } = await loadFirestore();
    const ref = doc(db, 'classes', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return 'error';
    const data = snap.data();
    if (!isOwnerOf(data, uid)) return 'notowner';

    const owners = ownerIdsOf(data);
    if (action === 'promote') {
      if (owners.includes(targetUid)) return 'ok';
      const member = await getDoc(doc(db, 'classes', id, 'members', targetUid));
      // Only someone already on the roster can be promoted, so ownership can't
      // be handed to an arbitrary uid.
      if (!member.exists()) return 'notmember';
      await updateDoc(ref, { ownerIds: [...owners, targetUid] });
      return 'ok';
    }

    if (owners.length <= 1) return 'lastowner';
    await updateDoc(ref, { ownerIds: owners.filter((o) => o !== targetUid) });
    return 'ok';
  } catch (e) {
    console.error('[classes] setOwner failed', e);
    return 'error';
  }
}

/** Absolute URL to hand to a teacher. */
export function joinUrl(code) {
  const id = normalizeClassCode(code);
  if (!id) return '';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://apex-scholar.com';
  return `${origin}/join/${id}`;
}

const classesService = {
  createClass,
  getClass,
  joinClass,
  getMyClasses,
  getMyClassesLive,
  getLeaderboard,
  recordTestForClasses,
  leaveClass,
  deleteClass,
  setOwner,
  isOwnerOf,
  ownerIdsOf,
  joinUrl,
};

export default classesService;
