/**
 * Who sees onboarding, and which version of it.
 *
 * The old flow was a seven-slide feature tour whose last slide said "Head to
 * Settings to select your AP subjects." Measured against production: 74 of 92
 * users completed it and 4 ended up with subjects set. It told; it never asked.
 *
 * Subjects are not a preference — they gate the Smart Scheduler, the exam
 * countdown, the weakest-area focus on the Practice hub, and per-subject
 * practice generation. A user without them is using a fraction of the app.
 *
 * So this version asks, and it is versioned: everyone who completed v1 is shown
 * v2 once, because the 88 users who never configured anything are exactly the
 * people who need the new step.
 *
 * No imports, so the rules stay testable without pulling in Firestore.
 */

/** Bump to re-show onboarding to everyone. */
export const ONBOARDING_VERSION = 2;

/** Versioned so a future bump doesn't collide with a stale flag. */
export const ONBOARDING_KEY = `apex.onboarding.v${ONBOARDING_VERSION}`;

/** The pre-versioning flag. Its presence means "completed v1", nothing more. */
export const LEGACY_KEY = 'apex.onboarding.completed';

/**
 * Should this user see onboarding now?
 *
 * `remote` is the Firestore user doc (or null while it loads / if it fails).
 * Fails OPEN on a missing doc — showing onboarding twice is a mild annoyance;
 * never showing it is the bug being fixed.
 */
export function shouldShowOnboarding({ localVersion, remote } = {}) {
  const seenLocally = Number(localVersion) >= ONBOARDING_VERSION;
  if (seenLocally) return false;

  if (!remote) return true;

  const remoteVersion = Number(remote.onboardingVersion) || 0;
  return remoteVersion < ONBOARDING_VERSION;
}

/**
 * Has this user been here before?
 *
 * Drives the copy: a returning user does not need "welcome, here is what this
 * is", they need "here is what changed, and you never picked your subjects".
 */
export function isReturningUser(remote) {
  if (!remote) return false;
  return Boolean(remote.onboardingCompleted) || Number(remote.onboardingVersion) > 0;
}

/** Subjects already on the account, normalised to an array of curriculum keys. */
export function existingSubjects(remote) {
  const s = remote && remote.subjects;
  return Array.isArray(s) ? s.filter((x) => typeof x === 'string' && x) : [];
}

/**
 * What to write when onboarding is dismissed.
 *
 * `onboardingCompleted` is kept for anything still reading the old flag.
 */
export function completionRecord(now = new Date()) {
  return {
    onboardingCompleted: true,
    onboardingVersion: ONBOARDING_VERSION,
    onboardingCompletedAt: now.toISOString(),
  };
}
