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
import { collection, doc, documentId, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firestore';
import errorLogger from '../utils/errorLogger';

const localKey = (uid, slug) => `apex.pack.v1.${uid || 'guest'}.${slug}`;
const docId = (slug) => `pack_${slug.replace(/\//g, '__')}`;
const slugOf = (id) => id.slice('pack_'.length).replace(/__/g, '/');

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

// The remote pack docs for one account, kept for the session so moving
// between /study and a class page doesn't read them again. Writes from this tab
// go through saveRemote, which keeps the copy current.
const CACHE_MS = 10 * 60 * 1000;
let remoteCache = null; // { uid, at, docs: Map<slug, data> }

async function remotePackDocs(uid) {
  if (remoteCache && remoteCache.uid === uid && Date.now() - remoteCache.at < CACHE_MS) return remoteCache.docs;
  // One query for the pack_ docs that exist, instead of a getDoc per pack:
  // that was 54 reads (one per pack, started or not) on every Learn page view.
  // Now it costs one read per pack actually started, minimum one.
  const snap = await getDocs(query(
    collection(db, 'users', uid, 'progress'),
    where(documentId(), '>=', 'pack_'),
    where(documentId(), '<', 'pack`'), // '`' sorts right after '_'
  ));
  const docs = new Map();
  snap.forEach((d) => docs.set(slugOf(d.id), d.data()));
  remoteCache = { uid, at: Date.now(), docs };
  return docs;
}

/** Progress for several packs at once, for the class and unit lists. */
export async function loadAllPackProgress(uid, slugs) {
  let remote = new Map();
  if (uid) {
    try {
      remote = await remotePackDocs(uid);
    } catch (e) {
      errorLogger.warn('pack progress list read failed', { error: e?.message });
    }
  }
  const entries = slugs.map((slug) => [slug, newer(readLocal(uid, slug), remote.get(slug) || null)]);
  return Object.fromEntries(entries.filter(([, v]) => v));
}

export function saveLocal(uid, slug, data) {
  writeLocal(uid, slug, data);
}

export async function saveRemote(uid, slug, data) {
  if (!uid) return;
  try {
    // JSON round-trip drops undefined fields, which Firestore rejects.
    const clean = JSON.parse(JSON.stringify({ ...data, slug }));
    await setDoc(doc(db, 'users', uid, 'progress', docId(slug)), clean);
    if (remoteCache?.uid === uid) remoteCache.docs.set(slug, clean);
  } catch (e) {
    errorLogger.warn('pack progress save failed', { slug, error: e?.message });
  }
}
