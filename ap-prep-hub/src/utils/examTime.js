/**
 * Parse an AP exam time string ("8:00 AM", "12:00 PM", "11:59 PM") into a
 * 24-hour decimal hour for calendar positioning.
 *
 * CalendarGrid previously did `parseInt(exam.time.split(':')[0]) * 4`, which
 * throws away the AM/PM suffix entirely. Real consequences with the shipped
 * exam data, whose portfolio deadlines carry evening times like "11:59 PM":
 *   "8:00 PM"  -> 8  -> rendered at 8 AM   (12 hours wrong)
 *   "11:59 PM" -> 11 -> rendered at 11 AM  (12 hours wrong)
 * It also crashed outright if `time` was missing, taking the whole calendar
 * down with it.
 *
 * Returns a decimal hour (8.5 for "8:30 AM") so minutes position correctly too,
 * or null when the input can't be understood — callers should skip rendering
 * rather than guess a position.
 */
export function parseExamHour(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const m = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?$/);
  if (!m) {
    // Tolerate a bare 24-hour value like "13:30".
    const h24 = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!h24) return null;
    const hh = Number(h24[1]);
    const mm = Number(h24[2]);
    if (hh > 23 || mm > 59) return null;
    return hh + mm / 60;
  }

  let hour = Number(m[1]);
  const minutes = m[2] ? Number(m[2]) : 0;
  const isPm = m[3].toLowerCase() === 'p';

  if (hour < 1 || hour > 12 || minutes > 59) return null;

  // 12 AM is midnight (0), 12 PM is noon (12) — the two cases a naive
  // `hour + 12` gets backwards.
  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;

  return hour + minutes / 60;
}

/** Top offset in rem for a calendar row height of `remPerHour`. */
export function examTopRem(timeStr, remPerHour = 4) {
  const hour = parseExamHour(timeStr);
  return hour === null ? null : hour * remPerHour;
}

export default parseExamHour;
