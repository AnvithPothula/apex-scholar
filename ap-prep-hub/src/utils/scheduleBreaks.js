/**
 * Break blocks between study sessions.
 *
 * The scheduler already leaves a 15-minute buffer after every session, but it
 * was invisible — the calendar showed two sessions with dead space between
 * them and no indication that the space was deliberate.
 *
 * The rule that matters: a gap is only a *break* if it is short enough to be
 * one. Labelling every gap would put "420 minute break" across school hours
 * and overnight, which is noise pretending to be a plan.
 *
 *   under 5 min   rounding between adjacent sessions — nothing to show
 *   5 to 60 min   a real break; this is what gets a block
 *   over 60 min   unscheduled time, not a break — left blank
 *
 * Display-only. Breaks are derived at render time and never persisted: putting
 * them in `aiSchedule` would write them to Firestore, feed them back through
 * the schedule diff in SchedulePreviewDialog as spurious "added" items, and
 * make every regeneration look like a change.
 */
export const MIN_BREAK_MINUTES = 5;
export const MAX_BREAK_MINUTES = 60;

const at = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOf = (item) => at(item?.scheduled_start || item?.startTime);
const endOf = (item) => at(item?.scheduled_end || item?.endTime);

/**
 * "10 minute break", not "10 minutes break" — `minute` is attributive here, so
 * it stays singular however many there are.
 */
export function breakLabel(minutes) {
  return `${minutes} minute break`;
}

/**
 * Returns `items` with break pseudo-items inserted, sorted by start time.
 * Items without a usable start are passed through untouched at the end — an
 * all-day task has no place in a timed gap calculation but must not vanish.
 */
export function insertBreaks(items, {
  min = MIN_BREAK_MINUTES,
  max = MAX_BREAK_MINUTES,
} = {}) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const timed = [];
  const untimed = [];
  for (const it of items) {
    (startOf(it) && endOf(it) ? timed : untimed).push(it);
  }
  timed.sort((a, b) => startOf(a) - startOf(b));

  const out = [];
  for (let i = 0; i < timed.length; i++) {
    out.push(timed[i]);
    const next = timed[i + 1];
    if (!next) continue;

    const end = endOf(timed[i]);
    const nextStart = startOf(next);
    // Overlapping or back-to-back sessions produce <= 0 and are skipped, as are
    // gaps that run past the point where "break" stops being the right word.
    const gap = Math.round((nextStart - end) / 60000);
    if (gap < min || gap > max) continue;
    // A gap that crosses midnight is two days' worth of nothing, not a break.
    if (end.toDateString() !== nextStart.toDateString()) continue;

    out.push({
      id: `break-${end.getTime()}`,
      isBreak: true,
      name: breakLabel(gap),
      durationMinutes: gap,
      startTime: end,
      endTime: nextStart,
      scheduled_start: end,
      scheduled_end: nextStart,
    });
  }
  return [...out, ...untimed];
}
