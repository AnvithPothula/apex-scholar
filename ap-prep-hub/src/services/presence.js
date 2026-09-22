/**
 * Signup and last-seen stamps.
 *
 * As of 2026-09-21 no user document carried a timestamp of any kind. That makes
 * the questions that decide what to build unanswerable: when did these 92
 * people arrive, did the onboarding rebuild change anything for people who saw
 * it, is a cohort from March behaving differently from one from August. The
 * funnel could only be measured as a single undifferentiated blob.
 *
 * Two fields, written from the client on auth:
 *   createdAt   once, and never overwritten — for existing users this is the
 *               first sign-in AFTER this shipped, not their real signup. That
 *               is honest and still useful; `createdAtIsBackfill` marks them so
 *               no one later mistakes the 92 for a September cohort.
 *   lastSeenAt  throttled to one write per user per day. Retention is measured
 *               in days, so per-session precision buys nothing and costs a
 *               write on every page load.
 */
const DAY_MS = 24 * 60 * 60 * 1000;
const THROTTLE_KEY = 'apex.lastSeen.v1';

/** True when this browser has already stamped today. */
export function shouldStamp(now = Date.now(), read = safeRead) {
  const prev = Number(read(THROTTLE_KEY));
  if (!Number.isFinite(prev) || prev <= 0) return true;
  return now - prev >= DAY_MS;
}

function safeRead(k) {
  try { return localStorage.getItem(k); } catch { return null; }
}
function safeWrite(k, v) {
  try { localStorage.setItem(k, v); } catch { /* private window — stamp every load, harmless */ }
}

/**
 * Record presence. Never throws, never blocks render.
 * `existing` is the already-fetched user document, so this costs no extra read.
 */
export async function recordPresence(uid, existing, deps) {
  if (!uid || !deps) return false;
  const { db, doc, setDoc, serverTimestamp } = deps;
  const now = Date.now();
  if (!shouldStamp(now)) return false;
  const patch = { lastSeenAt: serverTimestamp() };
  // Only stamp createdAt if the document genuinely lacks one. A user who
  // signed up in March must not be relabelled as a September arrival.
  if (!existing || !existing.createdAt) {
    patch.createdAt = serverTimestamp();
    patch.createdAtIsBackfill = true;
  }
  try {
    await setDoc(doc(db, 'users', uid), patch, { merge: true });
    safeWrite(THROTTLE_KEY, String(now));
    return true;
  } catch {
    return false;   // offline or rules hiccup — presence is never worth an error
  }
}
