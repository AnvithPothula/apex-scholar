/**
 * Per-field bounds for study preferences.
 *
 * These used to exist ONLY inside each <Input>'s onChange in Settings, so they
 * were enforced when a user typed and never otherwise. Any value that arrived
 * from anywhere else — an older schema, a bad write, an import — was re-saved
 * unchanged forever. A real account had sessionLength: 480 (8 hours), which
 * Settings displayed happily even though its own input caps at 120, while the
 * scheduler clamped it to 120 at use time. The number on screen was not the
 * number in effect.
 *
 * Bounds live here so save-time validation, load-time display, and the inputs
 * cannot drift apart. Kept free of firebase imports so it stays testable.
 */
export const PREFERENCE_BOUNDS = {
  sessionLength: [15, 120],
  breakLength: [5, 30],
  longBreakLength: [15, 60],
  maxStudyHoursPerDay: [2, 10],
  studyStartTime: [5, 12],
  studyEndTime: [18, 24],
  maxConcurrentSubjects: [1, 6],
  procrastinationBuffer: [0, 1],
};

/** Clamp bounded fields into range; fall back to `defaults` for junk values. */
export function clampPreferences(prefs, defaults) {
  const out = { ...prefs };
  Object.entries(PREFERENCE_BOUNDS).forEach(([key, [min, max]]) => {
    const v = out[key];
    if (typeof v !== 'number' || Number.isNaN(v)) {
      out[key] = defaults[key];
      return;
    }
    out[key] = Math.min(max, Math.max(min, v));
  });
  return out;
}
