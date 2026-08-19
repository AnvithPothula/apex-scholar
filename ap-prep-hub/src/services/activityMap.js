/**
 * Builds the study-activity heatmap and the study-time total.
 *
 * The heatmap read ONLY the `studySessions` collection. That collection is
 * written by `activityTracker`, which was wired up late — so a user with a real
 * history of practice tests and diagnostics saw a completely blank grid next to
 * "169 questions". The data was there; nothing looked at it.
 *
 * Every source below is already persisted. Merging them means the calendar
 * reflects what the student actually did, not just what happened to be recorded
 * after the tracker landed.
 *
 * Pure on purpose: no firebase import, so it is testable in jsdom.
 */

/** Local-date key. Must match StreakCalendar's — a UTC key here blanks the grid. */
export function dateKey(date) {
  const pad = (v) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Firestore hands back Timestamps, but seeded/legacy docs hold Dates, ISO
 * strings, or epoch millis. Returning null on anything unusable is what keeps
 * one bad record from throwing away the whole map.
 */
export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    try { return value.toDate(); } catch { return null; }
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value < 1e12 ? value * 1000 : value); // seconds or millis
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return null;
}

/** First usable date among several candidate field names. */
const firstDate = (doc, fields) => {
  for (const f of fields) {
    const d = toDate(doc?.[f]);
    if (d) return d;
  }
  return null;
};

const DATE_FIELDS = ['timestamp', 'completedAt', 'createdAt', 'date', 'updatedAt'];

/**
 * @param {{studySessions?:object[], practiceTests?:object[], diagnostics?:object[]}} sources
 * @returns {Record<string, number>} { 'YYYY-MM-DD': count }
 */
export function buildActivityMap({ studySessions = [], practiceTests = [], diagnostics = [] } = {}) {
  const map = {};
  for (const list of [studySessions, practiceTests, diagnostics]) {
    if (!Array.isArray(list)) continue;
    for (const doc of list) {
      const d = firstDate(doc, DATE_FIELDS);
      if (!d) continue;
      const key = dateKey(d);
      map[key] = (map[key] || 0) + 1;
    }
  }
  return map;
}

/**
 * Total study minutes.
 *
 * `duration` was only ever written by the practice-test path, so the tile read
 * "0 minutes" for anyone who had done anything else. Falls back to a per-test
 * estimate when a record carries no duration, and says so in the UI copy.
 */
export const MINUTES_PER_UNTIMED_TEST = 20;

export function totalStudyMinutes({ studySessions = [], practiceTests = [] } = {}) {
  let minutes = 0;
  for (const s of studySessions) {
    const d = Number(s?.duration ?? s?.durationMinutes ?? 0);
    if (Number.isFinite(d) && d > 0) minutes += d;
  }
  // Practice tests recorded before durations were tracked still represent real
  // time spent. Count them, but only when no session already covered them.
  const covered = new Set(
    studySessions.filter((s) => s?.type === 'practice_test').map((s) => {
      const d = firstDate(s, DATE_FIELDS);
      return d ? dateKey(d) : null;
    }).filter(Boolean)
  );
  for (const t of practiceTests) {
    const d = firstDate(t, DATE_FIELDS);
    if (!d || covered.has(dateKey(d))) continue;
    const own = Number(t?.duration ?? t?.durationMinutes ?? 0);
    minutes += Number.isFinite(own) && own > 0 ? own : MINUTES_PER_UNTIMED_TEST;
  }
  return Math.round(minutes);
}
