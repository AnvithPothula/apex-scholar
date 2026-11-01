/**
 * Where an unfinished practice test is kept, so a student can resume it.
 *
 * Local-first. Every change goes to localStorage a few seconds after it
 * happens: free, and it survives a reload or a crash on this device. Firestore
 * (`testProgress/{uid}_inprogress`), which is what lets a student resume on
 * another device, gets a copy at most every CLOUD_SAVE_MS while answers change,
 * every CLOUD_IDLE_MS for the clock, and always when the tab is hidden or left.
 *
 * Why: Firebase's free plan allows 20,000 writes a day for the whole site.
 * Saving to Firestore a few seconds after every answer spent about 55 of them
 * per practice test, which alone capped the site near 350 tests a day.
 */

export const CLOUD_SAVE_MS = 3 * 60 * 1000;
export const CLOUD_IDLE_MS = 12 * 60 * 1000;

const localKey = (uid) => `apex.testProgress.v1.${uid}`;

/** Save to this browser. Returns false when storage is unavailable or full. */
export function saveLocalProgress(uid, data) {
  if (!uid) return false;
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** This browser's copy for this student, or null. */
export function loadLocalProgress(uid) {
  if (!uid) return null;
  try {
    const data = JSON.parse(localStorage.getItem(localKey(uid)) || 'null');
    return data && data.userId === uid ? data : null;
  } catch {
    return null;
  }
}

export function clearLocalProgress(uid) {
  if (!uid) return;
  try { localStorage.removeItem(localKey(uid)); } catch { /* nothing to clear */ }
}

/** When a copy was saved, in ms. Older Firestore copies only have lastSaved. */
export function savedAtMs(data) {
  if (!data) return 0;
  if (Number.isFinite(data.savedAtMs)) return data.savedAtMs;
  const ts = data.lastSaved;
  if (ts && typeof ts.toMillis === 'function') return ts.toMillis();
  return 0;
}

/** The newer of the two copies; either may be null. */
export function pickNewerProgress(local, cloud) {
  if (!local) return cloud || null;
  if (!cloud) return local;
  return savedAtMs(local) >= savedAtMs(cloud) ? local : cloud;
}

/**
 * Whether this save should also go to Firestore.
 *   force      the tab is being hidden or left
 *   localOk    the local save worked; if not, Firestore is the only copy, so
 *              every change goes there as before
 *   changed    answers, marks or the question moved since the last cloud copy
 */
export function cloudSaveDue({ force, localOk, changed, now, lastCloudWrite }) {
  if (force) return true;
  const since = now - lastCloudWrite;
  if (!localOk) return changed || since >= 2 * 60 * 1000; // the old cadence
  if (changed) return since >= CLOUD_SAVE_MS;
  return since >= CLOUD_IDLE_MS;
}
