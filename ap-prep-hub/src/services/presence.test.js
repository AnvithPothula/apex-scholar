/**
 * Two properties decide whether the retention numbers this enables are real:
 * a user who signed up in March must never be relabelled as a September
 * arrival, and the daily throttle must actually throttle — otherwise every
 * page load is a write and `lastSeenAt` stops meaning "a day they used it".
 */
import { shouldStamp, recordPresence } from './presence';

const deps = () => {
  const setDoc = jest.fn(() => Promise.resolve());
  return { db: {}, doc: jest.fn((_, c, id) => ({ c, id })), setDoc, serverTimestamp: () => '__ts' };
};
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => { try { localStorage.clear(); } catch {} });

describe('shouldStamp', () => {
  it('stamps when nothing has been recorded', () => {
    expect(shouldStamp(1_000_000, () => null)).toBe(true);
    expect(shouldStamp(1_000_000, () => '')).toBe(true);
    expect(shouldStamp(1_000_000, () => 'garbage')).toBe(true);
  });

  it('stamps once a day, not once a page load', () => {
    const t = 1_700_000_000_000;
    expect(shouldStamp(t + 1000, () => String(t))).toBe(false);
    expect(shouldStamp(t + DAY - 1, () => String(t))).toBe(false);
    expect(shouldStamp(t + DAY, () => String(t))).toBe(true);
  });
});

describe('recordPresence', () => {
  it('sets createdAt only when the document has none', async () => {
    const d = deps();
    await recordPresence('u1', null, d);
    const [, patch] = d.setDoc.mock.calls[0];
    expect(patch.createdAt).toBe('__ts');
    expect(patch.createdAtIsBackfill).toBe(true);
    expect(patch.lastSeenAt).toBe('__ts');
  });

  it('never overwrites an existing createdAt', async () => {
    // The whole point: a March signup relabelled as September would make every
    // cohort number a lie.
    const d = deps();
    localStorage.clear();
    await recordPresence('u1', { createdAt: 'march' }, d);
    const [, patch] = d.setDoc.mock.calls[0];
    expect(patch).not.toHaveProperty('createdAt');
    expect(patch).not.toHaveProperty('createdAtIsBackfill');
    expect(patch.lastSeenAt).toBe('__ts');
  });

  it('writes at most once a day per browser', async () => {
    const d = deps();
    expect(await recordPresence('u1', null, d)).toBe(true);
    expect(await recordPresence('u1', null, d)).toBe(false);
    expect(d.setDoc).toHaveBeenCalledTimes(1);
  });

  it('merges, so it cannot clobber the profile', async () => {
    const d = deps();
    await recordPresence('u1', null, d);
    expect(d.setDoc.mock.calls[0][2]).toEqual({ merge: true });
  });

  it('swallows a failed write rather than breaking sign-in', async () => {
    const d = deps();
    d.setDoc.mockImplementation(() => Promise.reject(new Error('offline')));
    await expect(recordPresence('u1', null, d)).resolves.toBe(false);
  });

  it('does nothing without a uid or deps', async () => {
    expect(await recordPresence('', null, deps())).toBe(false);
    expect(await recordPresence('u1', null, null)).toBe(false);
  });
});
