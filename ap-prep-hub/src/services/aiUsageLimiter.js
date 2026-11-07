/**
 * AI usage limiter.
 *
 * Two pooled budgets:
 *   - general:      every AI call EXCEPT practice tests. Each call spends the
 *                   points its task costs (TASK_COST), out of a 5-hour budget
 *                   AND a weekly budget; the UI shows both as % used. Hitting
 *                   100% of either blocks until that window resets.
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
 *   - Guests (no uid): localStorage, per browser, with smaller budgets (a soft
 *     cap: clearing site data resets it). Guests can't write Firestore.
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
      import('../config/firestore'),
      import('firebase/firestore'),
    ]);
    _fb = { db, doc: fs.doc, getDoc: fs.getDoc, runTransaction: fs.runTransaction, serverTimestamp: fs.serverTimestamp };
  }
  return _fb;
}

// Tunable caps, in points (1000 points = 100% of a signed-in 5-hour window) --
export const GENERAL_5H_LIMIT = 1000;
export const GENERAL_WEEK_LIMIT = 5000;
export const GUEST_5H_LIMIT = 300;    // about 20 tutor messages
export const GUEST_WEEK_LIMIT = 1500;
export const TEST_DAILY_LIMIT = 1;     // practice-test generations per day

// Points per AI task, roughly by how much work the model does. Unknown or
// untagged tasks cost DEFAULT_COST. Practice tests are exempt (own daily cap).
export const TASK_COST = {
  tutor: 15,            // one tutor reply
  tutorFile: 30,        // a tutor reply that reads an attached file or photo
  ask: 8,               // highlight Ask / Explain in a study pack
  timelineNote: 8,      // a timeline study note
  reviewExplain: 10,    // "why was I wrong" in Review
  solver: 25,           // typed problem
  solverImage: 40,      // photo of a problem
  flashcards: 50,       // a generated deck
  diagnostic: 50,       // generated diagnostic questions
  progressInsights: 20, // the Progress page study analysis
};
export const DEFAULT_COST = 15;

// What each task can cost, whatever the load. TASK_COST above is the normal
// price, charged at half load; quiet hours fall toward min, busy ones rise to max.
export const TASK_COST_RANGE = {
  tutor: { min: 10, max: 30 },
  tutorFile: { min: 20, max: 60 },
  ask: { min: 5, max: 16 },
  timelineNote: { min: 5, max: 16 },
  reviewExplain: { min: 6, max: 20 },
  solver: { min: 15, max: 50 },
  solverImage: { min: 25, max: 80 },
  flashcards: { min: 30, max: 100 },
  diagnostic: { min: 30, max: 100 },
  progressInsights: { min: 12, max: 40 },
};
const DEFAULT_RANGE = { min: 10, max: 30 };

/** A task's points at a load from 0 (idle) through 0.5 (normal) to 1 (busy). */
export function costAt(category, load = 0.5) {
  const base = TASK_COST[category] ?? DEFAULT_COST;
  const { min, max } = TASK_COST_RANGE[category] ?? DEFAULT_RANGE;
  const l = Math.min(1, Math.max(0, Number.isFinite(load) ? load : 0.5));
  return Math.round(l <= 0.5 ? min + (base - min) * (l / 0.5) : base + (max - base) * ((l - 0.5) / 0.5));
}

export const levelOf = (load) => (load < 0.34 ? 'quiet' : load < 0.67 ? 'normal' : 'busy');

// The latest load from the AI router (services/aiLoad.js). Without a fresh
// reading, tasks cost their normal price.
const LOAD_TTL_MS = 15 * 60 * 1000;
let liveLoad = null; // { load, at }

export function setLoad(load, now = Date.now()) {
  liveLoad = Number.isFinite(load) ? { load, at: now } : null;
  notify();
}

export function currentLoad(now = Date.now()) {
  return liveLoad && now - liveLoad.at < LOAD_TTL_MS ? liveLoad.load : 0.5;
}

// What the calls in flight were actually charged, so a refund gives back that
// amount even if the load moved in between.
const inFlight = new Map(); // category -> [points, ...]
const rememberCharge = (category, cost) => inFlight.set(category, [...(inFlight.get(category) || []), cost]);
function takeCharge(category) {
  const list = inFlight.get(category) || [];
  const cost = list.pop();
  return cost ?? costOf(category);
}

/** What each task is called on the usage card. */
export const TASK_LABELS = {
  tutor: 'Tutor reply',
  tutorFile: 'Tutor reply with a file or photo',
  ask: 'Ask or Explain on highlighted text',
  timelineNote: 'Timeline study note',
  reviewExplain: 'Review explanation',
  solver: 'Solver (typed)',
  solverImage: 'Solver (photo)',
  flashcards: 'AI flashcard deck',
  diagnostic: 'Diagnostic questions',
  progressInsights: 'Progress analysis',
};

export const costOf = (category, load = currentLoad()) => costAt(category, load);

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

// The last copy of users/{uid}/usage/ai this tab read or wrote. The usage
// meter refreshes every minute and after every AI call; reading Firestore each
// time cost a signed-in student about 60 reads an hour on the tutor page,
// against a free-plan budget of 50,000 reads a day for the whole site. Every
// consume() still runs its transaction, so the caps stay exact; only the meter
// can lag another device by up to REMOTE_TTL_MS.
const REMOTE_TTL_MS = 5 * 60 * 1000;
let remote = null; // { uid, state, at }

function remember(state, now = Date.now()) {
  if (currentUid) remote = { uid: currentUid, state, at: now };
}

/** Tell the limiter who is signed in (null for guests). Called from AuthContext. */
export function setUser(uid) {
  currentUid = uid || null;
  if (remote && remote.uid !== currentUid) remote = null;
  notify();
}

const caps = () => (currentUid
  ? { fiveHour: GENERAL_5H_LIMIT, week: GENERAL_WEEK_LIMIT }
  : { fiveHour: GUEST_5H_LIMIT, week: GUEST_WEEK_LIMIT });

/** Usage meters listen for this to refresh after any AI call. */
export const USAGE_EVENT = 'apex:ai-usage';
function notify() {
  try { window.dispatchEvent(new Event(USAGE_EVENT)); } catch { /* no window in tests */ }
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

function buildMessage(scope, resetAt) {
  if (scope === 'testDaily') {
    return `You can generate ${TEST_DAILY_LIMIT} practice test per day. Try again tomorrow.`;
  }
  if (scope === 'week') {
    return `You've used 100% of this week's AI limit. It resets in ${humanizeUntil(resetAt)}.`;
  }
  return `You've used 100% of your 5-hour AI limit. It resets in ${humanizeUntil(resetAt)}.`;
}

// LOCAL calendar day. This was toISOString() (UTC), so the "1 test per day"
// rolled over at 8pm Eastern while the limit message promised midnight.
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

/**
 * Throws AiUsageLimitError if either general window is at its cap. A task is
 * allowed while any budget is left, so the last one may overshoot 100% a
 * little rather than refusing a 5% task at 97%.
 */
function assertGeneralUnderCap(state, now) {
  const fiveHour = rollWindow(state.fiveHour, FIVE_HOURS_MS, now);
  const week = rollWindow(state.week, WEEK_MS, now);
  const cap = caps();
  if (fiveHour.count >= cap.fiveHour) {
    throw new AiUsageLimitError('5h', fiveHour.start + FIVE_HOURS_MS);
  }
  if (week.count >= cap.week) {
    throw new AiUsageLimitError('week', week.start + WEEK_MS);
  }
  return { fiveHour, week };
}

/**
 * Meter one general AI call at its task's cost. Throws AiUsageLimitError when
 * over the 5-hour or weekly cap. No-op for admins and exempt categories.
 * Async: signed-in users hit Firestore (transaction); guests use localStorage.
 * Resolves true when it actually charged, so a caller knows a refund is owed.
 */
export async function consume(category) {
  if (bypass || isExempt(category)) return false;
  const now = Date.now();
  const cost = costOf(category);

  if (currentUid) {
    let seen = null; // what the transaction read, plus this call's cost
    try {
      const { db, doc, runTransaction, serverTimestamp } = await getFirebase();
      const ref = doc(db, 'users', currentUid, 'usage', 'ai');
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const state = normalize(snap.exists() ? snap.data() : {});
        seen = state;
        const { fiveHour, week } = assertGeneralUnderCap(state, now); // throws if over
        fiveHour.count += cost;
        week.count += cost;
        tx.set(ref, { fiveHour, week, updatedAt: serverTimestamp() }, { merge: true });
        seen = { ...state, fiveHour, week };
      });
      remember(seen);
    } catch (e) {
      if (e instanceof AiUsageLimitError) {
        if (seen) remember(seen);
        throw e; // real limit hit
      }
      // Firestore/network error -> fail open (don't block the user).
      errorLogger.debug('aiUsageLimiter consume failed (fail-open)', { error: e?.message });
      notify();
      return false;
    }
    rememberCharge(category, cost);
    notify();
    return true;
  }

  // Guest path (localStorage).
  const state = loadLocal();
  const { fiveHour, week } = assertGeneralUnderCap(state, now);
  fiveHour.count += cost;
  week.count += cost;
  saveLocal({ ...state, fiveHour, week });
  rememberCharge(category, cost);
  notify();
  return true;
}

/**
 * Give back what consume() charged for a call that then failed (server error,
 * rate limit, timeout). The budget is charged before the call so a burst can't
 * slip past the cap, but a student shouldn't lose 2% of their 5-hour window
 * to an outage on our side. Only windows that haven't rolled over since are
 * credited, never below zero. Never throws.
 */
export async function refund(category) {
  if (bypass || isExempt(category)) return;
  const now = Date.now();
  const cost = takeCharge(category);
  const credit = (bucket, durationMs) => {
    const live = rollWindow(bucket, durationMs, now);
    return live.start === bucket?.start ? { start: live.start, count: Math.max(0, live.count - cost) } : bucket;
  };

  if (currentUid) {
    try {
      const { db, doc, runTransaction, serverTimestamp } = await getFirebase();
      const ref = doc(db, 'users', currentUid, 'usage', 'ai');
      let seen = null;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const state = normalize(snap.data());
        const fiveHour = credit(state.fiveHour, FIVE_HOURS_MS);
        const week = credit(state.week, WEEK_MS);
        tx.set(ref, { fiveHour, week, updatedAt: serverTimestamp() }, { merge: true });
        seen = { ...state, fiveHour, week };
      });
      if (seen) remember(seen);
    } catch (e) {
      errorLogger.debug('aiUsageLimiter refund failed', { error: e?.message });
    }
    notify();
    return;
  }

  const state = loadLocal();
  saveLocal({ ...state, fiveHour: credit(state.fiveHour, FIVE_HOURS_MS), week: credit(state.week, WEEK_MS) });
  notify();
}

/** Throw AiUsageLimitError if the general budget is spent, without spending any. */
export async function assertGeneralAvailable() {
  if (bypass) return;
  const status = await getUsageStatus();
  for (const [scope, b] of [['5h', status?.general?.fiveHour], ['week', status?.general?.week]]) {
    if (b && b.remaining <= 0) throw new AiUsageLimitError(scope, b.resetAt || Date.now());
  }
}

/**
 * Meter one practice-test generation (1/day). Throws AiUsageLimitError when the
 * daily cap is reached; otherwise records it. No-op for admins. Separate budget
 * from consume().
 */
export async function consumeTestDaily() {
  if (bypass) return;

  if (currentUid) {
    let seen = null;
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
        seen = { ...state, testDay };
      });
      remember(seen);
    } catch (e) {
      if (e instanceof AiUsageLimitError) throw e;
      errorLogger.debug('aiUsageLimiter consumeTestDaily failed (fail-open)', { error: e?.message });
    }
    notify();
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
  notify();
}

/**
 * Throw AiUsageLimitError if today's practice test is already used, WITHOUT
 * spending it. Callers check before generating and consumeTestDaily() after a
 * test actually exists, so a failed generation doesn't cost the day's test.
 */
export async function assertTestDailyAvailable() {
  if (bypass) return;
  const status = await getUsageStatus();
  if (status?.test && status.test.remaining <= 0) {
    throw new AiUsageLimitError('testDaily', status.test.resetAt || Date.now());
  }
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
    // Any use shows at least 1%, so a running countdown never sits next to "0% used".
    pct: count > 0 ? Math.min(100, Math.max(1, Math.round((count / limit) * 100))) : 0,
    resetAt: count > 0 ? start + durationMs : null,
  });
  const cap = caps();
  const load = currentLoad(now);

  return {
    bypassed: bypass,
    guest: !currentUid,
    level: levelOf(load),
    costs: Object.fromEntries(Object.keys(TASK_COST).map((k) => [k, costAt(k, load)])),
    general: {
      fiveHour: bucket(fiveHour.count, cap.fiveHour, fiveHour.start, FIVE_HOURS_MS),
      week: bucket(week.count, cap.week, week.start, WEEK_MS),
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
    if (remote && remote.uid === currentUid && now - remote.at < REMOTE_TTL_MS) {
      return snapshotFrom(remote.state, now);
    }
    try {
      const { db, doc, getDoc } = await getFirebase();
      const snap = await getDoc(doc(db, 'users', currentUid, 'usage', 'ai'));
      const state = normalize(snap.exists() ? snap.data() : {});
      remember(state, now);
      return snapshotFrom(state, now);
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
    fiveHourLimit: s.general.fiveHour.limit,
    weekLimit: s.general.week.limit,
  };
}

const aiUsageLimiter = {
  setBypass,
  setUser,
  isExempt,
  consume,
  refund,
  assertGeneralAvailable,
  costOf,
  consumeTestDaily,
  assertTestDailyAvailable,
  getUsageStatus,
  peekGeneral,
  humanizeUntil,
  AiUsageLimitError,
  GENERAL_5H_LIMIT,
  GENERAL_WEEK_LIMIT,
  TEST_DAILY_LIMIT,
};

export default aiUsageLimiter;
