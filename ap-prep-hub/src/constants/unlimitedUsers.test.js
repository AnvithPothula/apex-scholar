/**
 * The usage-exempt uid list is duplicated across two runtimes that cannot
 * import each other (CRA bundle vs. Netlify function). Drift means the client
 * stops metering while the server keeps enforcing, or vice versa — either way
 * the user sees a cap they were told they don't have.
 */
const fs = require('fs');
const path = require('path');

const { UNLIMITED_UIDS, hasUnlimitedUsage } = require('./unlimitedUsers');
const { ADMIN_UIDS } = require('./admins');
const server = require('../../netlify/lib/unlimitedUsers');

describe('UNLIMITED_UIDS', () => {
  it('is a list of plausible Firebase uids with no duplicates', () => {
    expect(UNLIMITED_UIDS.length).toBeGreaterThan(0);
    UNLIMITED_UIDS.forEach((uid) => expect(uid).toMatch(/^[A-Za-z0-9]{20,}$/));
    expect(new Set(UNLIMITED_UIDS).size).toBe(UNLIMITED_UIDS.length);
  });

  it('matches the server-side copy the Netlify functions use', () => {
    expect([...server.UNLIMITED_UIDS].sort()).toEqual([...UNLIMITED_UIDS].sort());
  });

  it('keeps the server-side ADMIN_UIDS mirror in step too', () => {
    expect([...server.ADMIN_UIDS].sort()).toEqual([...ADMIN_UIDS].sort());
  });

  it('grants unlimited usage WITHOUT granting admin', () => {
    // This is the whole point of a separate list: a tester should never hit a
    // cap, and must never reach Developer Settings, site stats, the broadcaster,
    // or other users' data.
    const { isAdmin } = require('./admins');
    UNLIMITED_UIDS.forEach((uid) => {
      expect(hasUnlimitedUsage(uid)).toBe(true);
      expect(isAdmin(uid)).toBe(false);
      expect(ADMIN_UIDS).not.toContain(uid);
    });
  });

  it('still exempts admins, and meters everyone else', () => {
    ADMIN_UIDS.forEach((uid) => expect(hasUnlimitedUsage(uid)).toBe(true));
    expect(hasUnlimitedUsage('someRandomStudentUid1234')).toBe(false);
    expect(hasUnlimitedUsage(undefined)).toBe(false);
    expect(hasUnlimitedUsage(null)).toBe(false);
  });

  it('agrees with the server implementation for every case', () => {
    [...UNLIMITED_UIDS, ...ADMIN_UIDS, 'someRandomStudentUid1234'].forEach((uid) => {
      expect(server.hasUnlimitedUsage(uid)).toBe(hasUnlimitedUsage(uid));
    });
  });
});
