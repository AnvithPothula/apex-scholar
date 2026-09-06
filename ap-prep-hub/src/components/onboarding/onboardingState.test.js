import {
  ONBOARDING_VERSION,
  ONBOARDING_KEY,
  shouldShowOnboarding,
  isReturningUser,
  existingSubjects,
  completionRecord,
} from './onboardingState';

describe('shouldShowOnboarding', () => {
  it('shows it to a brand-new user', () => {
    expect(shouldShowOnboarding({ localVersion: null, remote: null })).toBe(true);
    expect(shouldShowOnboarding({ localVersion: null, remote: {} })).toBe(true);
  });

  it('re-shows it to someone who only completed the old tour', () => {
    // The whole point of versioning. These are the 88 users who watched a
    // slideshow and never set a subject.
    expect(shouldShowOnboarding({ remote: { onboardingCompleted: true } })).toBe(true);
  });

  it('does not show it to someone who finished this version', () => {
    expect(shouldShowOnboarding({
      remote: { onboardingCompleted: true, onboardingVersion: ONBOARDING_VERSION },
    })).toBe(false);
  });

  it('trusts a local completion of this version without a round trip', () => {
    expect(shouldShowOnboarding({ localVersion: ONBOARDING_VERSION, remote: null })).toBe(false);
  });

  it('ignores a local flag from an older version', () => {
    expect(shouldShowOnboarding({ localVersion: 1, remote: null })).toBe(true);
  });

  it('fails open when the profile cannot be read', () => {
    // Showing it twice is an annoyance; never showing it is the bug being fixed.
    expect(shouldShowOnboarding({ localVersion: undefined, remote: null })).toBe(true);
  });

  it('keys localStorage by version so a bump cannot collide', () => {
    expect(ONBOARDING_KEY).toContain(String(ONBOARDING_VERSION));
  });
});

describe('isReturningUser', () => {
  it('recognises someone who completed the old tour', () => {
    expect(isReturningUser({ onboardingCompleted: true })).toBe(true);
  });

  it('treats a fresh account as new', () => {
    expect(isReturningUser({})).toBe(false);
    expect(isReturningUser(null)).toBe(false);
  });
});

describe('existingSubjects', () => {
  it('returns what is already set so the picker is pre-filled', () => {
    expect(existingSubjects({ subjects: ['biology', 'usHistory'] })).toEqual(['biology', 'usHistory']);
  });

  it('survives every shape the field has had', () => {
    expect(existingSubjects({ subjects: [] })).toEqual([]);
    expect(existingSubjects({ subjects: null })).toEqual([]);
    expect(existingSubjects({})).toEqual([]);
    expect(existingSubjects(null)).toEqual([]);
    expect(existingSubjects({ subjects: ['ok', '', null, 7] })).toEqual(['ok']);
  });
});

describe('completionRecord', () => {
  it('stamps the version so the next bump can re-show', () => {
    const r = completionRecord(new Date('2026-09-04T12:00:00Z'));
    expect(r.onboardingVersion).toBe(ONBOARDING_VERSION);
    expect(r.onboardingCompletedAt).toBe('2026-09-04T12:00:00.000Z');
  });

  it('keeps the legacy flag for anything still reading it', () => {
    expect(completionRecord().onboardingCompleted).toBe(true);
  });
});
