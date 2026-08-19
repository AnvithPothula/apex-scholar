/**
 * Which AP year a record belongs to, and whether it should still nag the student.
 *
 * A student who took AP Biology last year and is now in AP Chemistry was still
 * being told to work on their weak Biology units. Their Biology score is not
 * wrong — it is just no longer their problem, and a "Focus next" card pointing
 * at a course they finished is worse than no card.
 *
 * Two independent signals, both honest:
 *  1. The record is from a PREVIOUS AP year.
 *  2. The subject is no longer in the student's own course list.
 *
 * Neither alone is enough. Enrolment lists are often empty (nobody filled one
 * in), and a year boundary mid-course would wrongly hide current work — a
 * student studying in August for a May exam is in the same academic year.
 *
 * Pure: no firebase, testable in jsdom.
 */

/**
 * The AP year runs with the school year. College Board labels the year by its
 * MAY exam, so August 2026 through July 2027 is all "AP 2027".
 * @param {Date} date
 */
export function apYearOf(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  // August (7) onward belongs to next May's exam year.
  return d.getMonth() >= 7 ? d.getFullYear() + 1 : d.getFullYear();
}

/** The AP year we are currently in. */
export const currentApYear = (now = new Date()) => apYearOf(now);

/**
 * Should this record still drive recommendations?
 *
 * @param {object} record anything carrying a date
 * @param {{enrolledSubjects?: string[], now?: Date}} opts
 */
export function isCurrentWork(record, { enrolledSubjects, now = new Date() } = {}) {
  if (!record) return false;
  const year = currentApYear(now);

  const raw = record.completedAt ?? record.createdAt ?? record.timestamp ?? record.date;
  const d = raw && typeof raw.toDate === 'function' ? raw.toDate() : raw ? new Date(raw) : null;
  const recordYear = d && !Number.isNaN(d.getTime()) ? apYearOf(d) : null;

  // Undated records are kept. Dropping them would silently discard history, and
  // an undated record is far more likely to be a seeding artefact than last
  // year's work.
  if (recordYear !== null && recordYear < year) return false;

  // Only apply the enrolment filter when the student actually has a list.
  if (Array.isArray(enrolledSubjects) && enrolledSubjects.length > 0) {
    const subject = record.subject || record.subjectName || '';
    if (subject && !enrolledSubjects.includes(subject)) return false;
  }
  return true;
}

/** Filter a record list down to work that should still be nagged about. */
export function currentWorkOnly(records = [], opts = {}) {
  if (!Array.isArray(records)) return [];
  return records.filter((r) => isCurrentWork(r, opts));
}
