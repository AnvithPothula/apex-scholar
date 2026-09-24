/**
 * The requirement was explicit: label breaks, but only where there IS a break,
 * not in every gap in the schedule. So the bounds are the feature — a version
 * that labels every gap would write "420 minute break" across the school day.
 */
import { insertBreaks, breakLabel, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES } from './scheduleBreaks';

const D = (h, m = 0) => new Date(2026, 8, 22, h, m);
const s = (id, from, to) => ({ id, name: id, startTime: from, endTime: to });
const breaks = (out) => out.filter((x) => x.isBreak);

describe('breakLabel', () => {
  it('keeps "minute" singular because it is attributive', () => {
    expect(breakLabel(10)).toBe('10 minute break');
    expect(breakLabel(1)).toBe('1 minute break');
    expect(breakLabel(45)).toBe('45 minute break');
  });
});

describe('insertBreaks', () => {
  it('labels a real break between two sessions', () => {
    const out = insertBreaks([s('a', D(9), D(10)), s('b', D(10, 10), D(11))]);
    expect(breaks(out)).toHaveLength(1);
    expect(breaks(out)[0].name).toBe('10 minute break');
    // and it sits exactly in the gap
    expect(breaks(out)[0].startTime).toEqual(D(10));
    expect(breaks(out)[0].endTime).toEqual(D(10, 10));
  });

  it('does NOT label every gap — only ones short enough to be a break', () => {
    const out = insertBreaks([
      s('morning', D(9), D(10)),
      s('afternoon', D(15), D(16)),   // 5 hours: school, not a break
    ]);
    expect(breaks(out)).toHaveLength(0);
  });

  it('ignores gaps too small to mean anything', () => {
    expect(breaks(insertBreaks([s('a', D(9), D(10)), s('b', D(10, 2), D(11))]))).toHaveLength(0);
  });

  it('honours both bounds exactly', () => {
    const atMin = insertBreaks([s('a', D(9), D(10)), s('b', D(10, MIN_BREAK_MINUTES), D(11))]);
    const atMax = insertBreaks([s('a', D(9), D(10)), s('b', D(11), D(12))]); // 60 min
    const overMax = insertBreaks([s('a', D(9), D(10)), s('b', D(11, 1), D(12))]);
    expect(breaks(atMin)).toHaveLength(1);
    expect(breaks(atMax)).toHaveLength(1);
    expect(breaks(atMax)[0].name).toBe(`${MAX_BREAK_MINUTES} minute break`);
    expect(breaks(overMax)).toHaveLength(0);
  });

  it('never invents a break across midnight', () => {
    const late = { id: 'a', name: 'a', startTime: new Date(2026, 8, 22, 23, 30), endTime: new Date(2026, 8, 22, 23, 50) };
    const early = { id: 'b', name: 'b', startTime: new Date(2026, 8, 23, 0, 10), endTime: new Date(2026, 8, 23, 1, 0) };
    expect(breaks(insertBreaks([late, early]))).toHaveLength(0);
  });

  it('ignores overlapping sessions rather than emitting a negative break', () => {
    expect(breaks(insertBreaks([s('a', D(9), D(10, 30)), s('b', D(10), D(11))]))).toHaveLength(0);
  });

  it('sorts by start time, so input order does not change the result', () => {
    const forward = insertBreaks([s('a', D(9), D(10)), s('b', D(10, 15), D(11))]);
    const reverse = insertBreaks([s('b', D(10, 15), D(11)), s('a', D(9), D(10))]);
    expect(reverse.map((x) => x.name)).toEqual(forward.map((x) => x.name));
  });

  it('keeps items that have no usable time instead of dropping them', () => {
    // An all-day task has no place in a gap calculation but must still render.
    const out = insertBreaks([s('a', D(9), D(10)), { id: 'allday', name: 'allday' }]);
    expect(out.map((x) => x.id)).toContain('allday');
  });

  it('reads scheduled_start/scheduled_end as well as startTime/endTime', () => {
    const out = insertBreaks([
      { id: 'a', scheduled_start: D(9), scheduled_end: D(10) },
      { id: 'b', scheduled_start: D(10, 20), scheduled_end: D(11) },
    ]);
    expect(breaks(out)[0].name).toBe('20 minute break');
  });

  it('handles the scheduler\'s own 15-minute buffer, which is the common case', () => {
    const out = insertBreaks([s('a', D(9), D(10)), s('b', D(10, 15), D(11)), s('c', D(11, 15), D(12))]);
    expect(breaks(out).map((b) => b.name)).toEqual(['15 minute break', '15 minute break']);
  });

  it('survives junk input', () => {
    expect(insertBreaks(null)).toEqual([]);
    expect(insertBreaks([])).toEqual([]);
    expect(() => insertBreaks([{ id: 'x', startTime: 'not a date', endTime: 'nope' }])).not.toThrow();
  });
});
