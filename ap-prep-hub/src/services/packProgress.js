/**
 * Study-pack progress: where the student is in a unit (mode, answers) and what
 * each topic's status is (mastered / shaky), so a pack resumes on any device
 * and the adaptive plan has history to work from.
 *
 * Signed in: users/{uid}/progress/pack_<subject>__<unit> (owner-only by the
 * existing rule), with a localStorage copy so the page can render before the
 * read lands. Guests: localStorage only; their progress is adopted by the
 * account the first time they sign in on that browser.
 *
 * Saved shape: { v, updatedAt (ms), topics, pass, summary }.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firestore';
import errorLogger from '../utils/errorLogger';

const localKey = (uid, slug) => `apex.pack.v1.${uid || 'guest'}.${slug}`;
const docId = (slug) => `pack_${slug.replace(/\//g, '__')}`;

export function readLocal(uid, slug) {
  try {
    const own = localStorage.getItem(localKey(uid, slug));
    // A guest who signs in keeps what they did as a guest.
    const raw = own ?? (uid ? localStorage.getItem(localKey(null, slug)) : null);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(uid, slug, data) {
  try {
    localStorage.setItem(localKey(uid, slug), JSON.stringify(data));
  } catch {
    // Private mode or quota: progress lasts for this visit only.
  }
}

/** The more recently updated of two saved copies. Exported for tests. */
export function newer(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return (b.updatedAt || 0) > (a.updatedAt || 0) ? b : a;
}

export async function loadPackProgress(uid, slug) {
  const local = readLocal(uid, slug);
  if (!uid) return local;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'progress', docId(slug)));
    return newer(local, snap.exists() ? snap.data() : null);
  } catch (e) {
    errorLogger.warn('pack progress read failed', { slug, error: e?.message });
    return local;
  }
}

/** Progress for several packs at once, for the class and unit lists. */
export async function loadAllPackProgress(uid, slugs) {
  const entries = await Promise.all(slugs.map(async (slug) => [slug, await loadPackProgress(uid, slug)]));
  return Object.fromEntries(entries.filter(([, v]) => v));
}

export function saveLocal(uid, slug, data) {
  writeLocal(uid, slug, data);
}

export async function saveRemote(uid, slug, data) {
  if (!uid) return;
  try {
    // JSON round-trip drops undefined fields, which Firestore rejects.
    await setDoc(doc(db, 'users', uid, 'progress', docId(slug)), JSON.parse(JSON.stringify({ ...data, slug })));
  } catch (e) {
    errorLogger.warn('pack progress save failed', { slug, error: e?.message });
  }
}
