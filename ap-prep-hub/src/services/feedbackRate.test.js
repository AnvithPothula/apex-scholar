/**
 * @jest-environment node
 */
const { tooMany } = require('../../netlify/functions/feedback');

// A stand-in Firestore: one doc per id, transactions run inline.
const fakeDb = () => {
  const docs = new Map();
  return {
    docs,
    collection: () => ({ doc: (id) => ({ id }) }),
    runTransaction: async (fn) => fn({
      get: async (ref) => ({ exists: docs.has(ref.id), data: () => docs.get(ref.id) }),
      set: (ref, data) => docs.set(ref.id, data),
    }),
  };
};

test('allows five in ten minutes, refuses the sixth, and allows again later', async () => {
  const db = fakeDb();
  const t0 = 1_800_000_000_000;
  for (let i = 0; i < 5; i++) expect(await tooMany(db, '203.0.113.7', t0 + i)).toBe(false);
  expect(await tooMany(db, '203.0.113.7', t0 + 10)).toBe(true);
  expect(await tooMany(db, 'someone-else', t0 + 10)).toBe(false);
  expect(await tooMany(db, '203.0.113.7', t0 + 11 * 60 * 1000)).toBe(false);
});

test('stores a hash, never the IP, and fails open if the counter breaks', async () => {
  const db = fakeDb();
  await tooMany(db, '203.0.113.7');
  expect([...db.docs.keys()].join('')).not.toContain('203.0.113.7');
  expect(await tooMany({ collection: () => { throw new Error('down'); } }, 'x')).toBe(false);
});
