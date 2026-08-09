/**
 * ADMIN_UIDS is necessarily duplicated across three runtimes that cannot import
 * each other: this JS constant, firestore.rules (CEL), and the Netlify
 * functions (Node, no bundler). Drift between them is a real security bug —
 * a uid removed here but left in the rules keeps full database access.
 *
 * These tests read the other two copies as text and compare.
 */
const fs = require('fs');
const path = require('path');

const { ADMIN_UIDS, isAdmin } = require('./admins');

const ROOT = path.resolve(__dirname, '..', '..');
const readOr = (p) => {
  try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return null; }
};
const uidsIn = (text) => {
  if (!text) return null;
  const block = text.match(/ADMIN_UIDS\s*=\s*\[([\s\S]*?)\]/)
    || text.match(/request\.auth\.uid in \[([\s\S]*?)\]/);
  if (!block) return null;
  return (block[1].match(/['"]([A-Za-z0-9]{20,})['"]/g) || [])
    .map((s) => s.replace(/['"]/g, ''))
    .sort();
};

describe('ADMIN_UIDS', () => {
  it('is a non-empty list of plausible Firebase uids', () => {
    expect(Array.isArray(ADMIN_UIDS)).toBe(true);
    expect(ADMIN_UIDS.length).toBeGreaterThan(0);
    ADMIN_UIDS.forEach((uid) => expect(uid).toMatch(/^[A-Za-z0-9]{20,}$/));
  });

  it('has no duplicates', () => {
    expect(new Set(ADMIN_UIDS).size).toBe(ADMIN_UIDS.length);
  });

  it('matches the list hard-coded in firestore.rules', () => {
    const rules = uidsIn(readOr('firestore.rules'));
    // If the shape changes, fail loudly rather than silently passing.
    expect(rules).not.toBeNull();
    expect(rules).toEqual([...ADMIN_UIDS].sort());
  });

  it.each([
    'netlify/functions/admin-stats.js',
    'netlify/functions/email-broadcast.js',
  ])('matches the list hard-coded in %s', (file) => {
    const fn = uidsIn(readOr(file));
    expect(fn).not.toBeNull();
    expect(fn).toEqual([...ADMIN_UIDS].sort());
  });
});

describe('isAdmin', () => {
  it('accepts a listed uid and rejects everything else', () => {
    expect(isAdmin(ADMIN_UIDS[0])).toBe(true);
    expect(isAdmin('someRandomUid1234567890')).toBe(false);
  });

  it('rejects empty input rather than throwing', () => {
    [null, undefined, '', 0, {}].forEach((v) => expect(isAdmin(v)).toBe(false));
  });
});
