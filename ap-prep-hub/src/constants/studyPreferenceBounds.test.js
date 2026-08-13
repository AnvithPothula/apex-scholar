import { clampPreferences } from './studyPreferenceBounds';

const defaults = {
  sessionLength: 50,
  breakLength: 10,
  longBreakLength: 30,
  maxStudyHoursPerDay: 6,
  studyStartTime: 7,
  studyEndTime: 22,
  maxConcurrentSubjects: 3,
  procrastinationBuffer: 0.2,
};

describe('clampPreferences', () => {
  it('pulls an out-of-range stored value back into the advertised range', () => {
    // A real account had sessionLength 480 (8 hours). Settings displayed it
    // even though its own input caps at 120, and the scheduler clamped to 120
    // at use time — so the number on screen was not the number in effect.
    const out = clampPreferences({ ...defaults, sessionLength: 480 }, defaults);
    expect(out.sessionLength).toBe(120);
  });

  it('raises values that are below the minimum', () => {
    expect(clampPreferences({ ...defaults, breakLength: 1 }, defaults).breakLength).toBe(5);
  });

  it('leaves in-range values untouched', () => {
    const out = clampPreferences({ ...defaults, sessionLength: 45 }, defaults);
    expect(out.sessionLength).toBe(45);
    expect(out.studyStartTime).toBe(7);
  });

  it('falls back to the default when a value is missing or not a number', () => {
    const out = clampPreferences({ ...defaults, sessionLength: undefined, breakLength: NaN }, defaults);
    expect(out.sessionLength).toBe(50);
    expect(out.breakLength).toBe(10);
  });

  it('does not invent keys it has no bounds for', () => {
    const out = clampPreferences({ ...defaults, timezone: 'America/Chicago' }, defaults);
    expect(out.timezone).toBe('America/Chicago');
  });
});
