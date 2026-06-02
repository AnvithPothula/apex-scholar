/**
 * AI usage limiter.
 *
 * Two pooled budgets:
 *   - general:      every AI call EXCEPT practice-test generation. Fixed 5-hour
 *                   window AND fixed weekly window; whichever is hit first
 *                   blocks. Both reset on a rolling basis.
 *   - practiceTest: 1 test generation per calendar day. Separate counter that
 *                   does NOT count against the general budget.
 *
 * Storage:
 *   - Signed-in users: Firestore doc `users/{uid}/usage/ai`. Each consume runs
 *     a transaction (atomic across tabs/devices, authoritative). Reads/writes
 *     fail OPEN — if Firestore is unreachable the call is allowed rather than
 *     blocked. Note: this is not tamper-proof (the user owns the doc); real
 *     anti-abuse needs a server-side function. It does give cross-device
 *     enforcement that survives clearing browser data.
 *   - Guests (no uid): localStorage, per browser (soft cap, like the guest
 *     message cap). Guests can't write Firestore.
 *
 * Admins/devs bypass everything via setBypass(true).
 */

import errorLogger from '../utils/errorLogger';

// Firebase is loaded lazily (only when a signed-in user actually hits the
// Firestore path). This keeps the module graph free of firebase/auth+undici,
// which Jest's transform can't parse, so the guest-path logic stays testable.
let _fb = null;
async function getFirebase() {
  if (!_fb) {
    const [{ db }, fs] = await Promise.all([
      import('../config/firebase'),
      import('firebase/firestore'),
    ]);
    _fb = { db, doc: fs.doc, getDoc: fs.getDoc, runTransaction: fs.runTransaction, serverTimestamp: fs.serverTimestamp };
  }
  return _fb;
}

// Tunable caps -------------------------------------------------------------
export const GENERAL_5H_LIMIT = 60;    // AI calls per rolling 5 hours
export const GENERAL_WEEK_LIMIT = 300; // AI calls per rolling 7 days
export const TEST_DAILY_LIMIT = 1;     // practice-test generations per day

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const KEY = 'apex.ai.usage.v2'; // localStorage key (guest fallback)

// Categories NOT metered against the general budget.
const EXEMPT_CATEGORIES = new Set(['practiceTest', 'system', 'exempt']);

let bypass = false;
let currentUid = null;

/** Admins/devs skip all limits. Called from AuthContext on auth change. */
export function setBypass(value) {
  bypass = !!value;
}

/** Tell the limiter who is signed in (null for guests). Called from AuthContext. */
export function setUser(uid) {
  currentUid = uid || null;
}

export function isExempt(category) {
  return EXEMPT_CATEGORIES.has(category);
}

/** Error thrown when a user hits a usage limit. Carries a friendly message. */
export class AiUsageLimitError extends Error {
  constructor(scope, resetAt) {
    super(buildMessage(scope, resetAt));
    this.name = 'AiUsageLimitError';
    this.code = 'ai_usage_limit';
    this.scope = scope; // '5h' | 'week' | 'testDaily'
    this.resetAt = resetAt; // epoch ms
  }
}

export function humanizeUntil(resetAt) {
  const ms = Math.max(0, resetAt - Date.now());
  const totalMins = Math.max(1, Math.ceil(ms / (60 * 1000)));

  const days = Math.floor(totalMins / (24 * 60));
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'}`;

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours >= 1) return `${hours}h ${mins}m`;

  return `${totalMins} min`;
}
}

function buildMessage(scope, resetAt) {
  if (scope === 'testDaily') {
    return `You can generate ${TEST_DAILY_LIMIT} practice test per day. Try again tomorrow.`;
  }
  if (scope === 'week') {
    return `You've reached your weekly AI usage limit. It resets in ${humanizeUntil(resetAt)}.`;
  }
  return `You've reached your AI usage limit for now. It resets in ${humanizeUntil(resetAt)}.`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Reset a rolling window if its duration has elapsed. Returns a live bucket. */
function rollWindow(bucket, durationMs, now) {
  if (!bucket || !bucket.start || now - bucket.start >= durationMs) {
    return { start: now, count: 0 };
  }
  return { start: bucket.start, count: bucket.count || 0 };
}

/** Normalize a raw doc/state into the canonical shape. */
function normalize(data) {
  return {
    fiveHour: data?.fiveHour || { start: 0, count: 0 },
    week: data?.week || { start: 0, count: 0 },
    testDay: data?.testDay || { day: todayStr(), count: 0 },
  };
}

// --- localStorage (guest) backing ----------------------------------------
function loadLocal() {
  try {
    return normalize(JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch (e) {
    errorLogger.debug('aiUsageLimiter local read failed', { error: e?.message });
    return normalize({});
  }
}

function saveLocal(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    errorLogger.debug('aiUsageLimiter local write failed', { error: e?.message });
  }
}

/** Throws AiUsageLimitError if either general window is at its cap. */
function assertGeneralUnderCap(state, now) {
  const fiveHour = rollWindow(state.fiveHour, FIVE_HOURS_MS, now);
  const week = rollWindow(state.week, WEEK_MS, now);
  if (fiveHour.count >= GENERAL_5H_LIMIT) {
    throw new AiUsageLimitError('5h', fiveHour.start + FIVE_HOURS_MS);
  }
  if (week.count >= GENERAL_WEEK_LIMIT) {
    throw new AiUsageLimitError('week', week.start + WEEK_MS);
  }
  return { fiveHour, week };
}

/**
 * Meter one general AI call. Throws AiUsageLimitError when over the 5-hour or
 * weekly cap; otherwise records the hit. No-op for admins and exempt categories.
 * Async: signed-in users hit Firestore (transaction); guests use localStorage.
 */
export async function consume(category) {
  if (bypass || isExempt(category)) return;
  const now = Date.now();

  if (currentUid) {
    try {
      const { db, doc, runTransaction, serverTimestamp } = await getFirebase();
      const ref = doc(db, 'users', currentUid, 'usage', 'ai');
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const state = normalize(snap.exists() ? snap.data() : {});
        const { fiveHour, week } = assertGeneralUnderCap(state, now); // throws if over
        fiveHour.count += 1;
        week.count += 1;
        tx.set(ref, { fiveHour, week, updatedAt: serverTimestamp() }, { merge: true });
      });
    } catch (e) {
      if (e instanceof AiUsageLimitError) throw e; // real limit hit
      // Firestore/network error -> fail open (don't block the user).
      errorLogger.debug('aiUsageLimiter consume failed (fail-open)', { error: e?.message });
    }
    return;
  }

  // Guest path (localStorage).
  const state = loadLocal();
  const { fiveHour, week } = assertGeneralUnderCap(state, now);
  fiveHour.count += 1;
  week.count += 1;
  saveLocal({ ...state, fiveHour, week });
}

/**
 * Meter one practice-test generation (1/day). Throws AiUsageLimitError when the
 * daily cap is reached; otherwise records it. No-op for admins. Separate budget
 * from consume().
 */
export async function consumeTestDaily() {
  if (bypass) return;

  if (currentUid) {
    try {
      const { db, doc, runTransaction, serverTimestamp } = await getFirebase();
      const ref = doc(db, 'users', currentUid, 'usage', 'ai');
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const state = normalize(snap.exists() ? snap.data() : {});
        let testDay = state.testDay.day === todayStr() ? state.testDay : { day: todayStr(), count: 0 };
        if (testDay.count >= TEST_DAILY_LIMIT) {
          const tomorrow = new Date();
          tomorrow.setHours(24, 0, 0, 0);
          throw new AiUsageLimitError('testDaily', tomorrow.getTime());
        }
        testDay = { day: todayStr(), count: testDay.count + 1 };
        tx.set(ref, { testDay, updatedAt: serverTimestamp() }, { merge: true });
      });
    } catch (e) {
      if (e instanceof AiUsageLimitError) throw e;
      errorLogger.debug('aiUsageLimiter consumeTestDaily failed (fail-open)', { error: e?.message });
    }
    return;
  }

  // Guest path (localStorage).
  const state = loadLocal();
  let testDay = state.testDay.day === todayStr() ? state.testDay : { day: todayStr(), count: 0 };
  if (testDay.count >= TEST_DAILY_LIMIT) {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    throw new AiUsageLimitError('testDaily', tomorrow.getTime());
  }
  testDay = { day: todayStr(), count: testDay.count + 1 };
  saveLocal({ ...state, testDay });
}

/** Build a UI snapshot from a normalized state object. */
function snapshotFrom(state, now) {
  const fiveHour = rollWindow(state.fiveHour, FIVE_HOURS_MS, now);
  const week = rollWindow(state.week, WEEK_MS, now);
  const testUsed = state.testDay.day === todayStr() ? state.testDay.count : 0;
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);

  const bucket = (count, limit, start, durationMs) => ({
    used: count,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt: count > 0 ? start + durationMs : null,
  });

  return {
    bypassed: bypass,
    general: {
      fiveHour: bucket(fiveHour.count, GENERAL_5H_LIMIT, fiveHour.start, FIVE_HOURS_MS),
      week: bucket(week.count, GENERAL_WEEK_LIMIT, week.start, WEEK_MS),
    },
    test: {
      used: testUsed,
      limit: TEST_DAILY_LIMIT,
      remaining: Math.max(0, TEST_DAILY_LIMIT - testUsed),
      resetAt: testUsed > 0 ? tomorrow.getTime() : null,
    },
  };
}

/**
 * Snapshot for the Settings UI. Async: reads Firestore for signed-in users,
 * localStorage for guests. Admins short-circuit to an unlimited snapshot.
 */
export async function getUsageStatus() {
  const now = Date.now();
  if (bypass) {
    return { bypassed: true, general: null, test: null };
  }
  if (currentUid) {
    try {
      const { db, doc, getDoc } = await getFirebase();
      const snap = await getDoc(doc(db, 'users', currentUid, 'usage', 'ai'));
      return snapshotFrom(normalize(snap.exists() ? snap.data() : {}), now);
    } catch (e) {
      errorLogger.debug('aiUsageLimiter getUsageStatus failed', { error: e?.message });
      return snapshotFrom(loadLocal(), now); // fallback
    }
  }
  return snapshotFrom(loadLocal(), now);
}

/** Synchronous localStorage-only peek (guest path / tests). */
export function peekGeneral() {
  const s = snapshotFrom(loadLocal(), Date.now());
  return {
    fiveHourRemaining: s.general.fiveHour.remaining,
    weekRemaining: s.general.week.remaining,
    fiveHourLimit: GENERAL_5H_LIMIT,
    weekLimit: GENERAL_WEEK_LIMIT,
  };
}

const aiUsageLimiter = {
  setBypass,
  setUser,
  isExempt,
  consume,
  consumeTestDaily,
  getUsageStatus,
  peekGeneral,
  humanizeUntil,
  AiUsageLimitError,
  GENERAL_5H_LIMIT,
  GENERAL_WEEK_LIMIT,
  TEST_DAILY_LIMIT,
};

export default aiUsageLimiter;
