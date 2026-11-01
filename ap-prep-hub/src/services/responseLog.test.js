/**
 * The response log is append-only and little reads it yet, which is exactly
 * the situation where a silent defect survives for months and then turns out to
 * have poisoned every row. These tests pin the three properties that decide
 * whether the data is usable when something finally does read it:
 *
 *   - a skipped item is recorded, not dropped (dropping biases every estimate);
 *   - `chosen` survives (a correctness bit alone throws away most of the signal);
 *   - a logging failure never propagates to the caller.
 */
const mockCommit = jest.fn(() => Promise.resolve());
const mockSet = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(),
  writeBatch: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
}));
jest.mock('../config/firestore', () => ({ db: {} }));

const firestore = require('firebase/firestore');
const {
  normalizeRow, logResponses, logResponse, SOURCES, ROWS_PER_SET, flattenSets, getMyResponses,
} = require('./responseLog');

const row = (over = {}) => ({
  itemId: 'q1', subject: 'AP Statistics', source: 'practiceTest',
  chosen: 2, correct: false, ...over,
});

// CRA's jest config sets resetMocks: true, which strips the implementation off
// every jest.fn() before each test — including the ones defined in the mock
// factory above. Re-arm them here or writeBatch() returns undefined and every
// write path fails for a reason that has nothing to do with the code.
beforeEach(() => {
  mockCommit.mockReset().mockImplementation(() => Promise.resolve());
  mockSet.mockReset();
  firestore.collection.mockImplementation((_db, name) => ({ __col: name }));
  firestore.doc.mockImplementation((col) => ({ __doc: col.__col }));
  firestore.serverTimestamp.mockImplementation(() => '__ts');
  firestore.writeBatch.mockImplementation(() => ({ set: mockSet, commit: mockCommit }));
});

describe('normalizeRow', () => {
  it('keeps the chosen distractor, not just correctness', () => {
    expect(normalizeRow(row(), 'u1')).toMatchObject({ userId: 'u1', itemId: 'q1', chosen: 2, correct: false });
  });

  it('records a skipped item rather than dropping it', () => {
    // A student skipping a whole unit is signal, not absence of signal.
    const r = normalizeRow(row({ chosen: null, correct: false }), 'u1');
    expect(r).not.toBeNull();
    expect(r.chosen).toBeNull();
    expect(r.correct).toBe(false);
  });

  it('refuses rows that cannot be joined to anything', () => {
    expect(normalizeRow(row({ itemId: '' }), 'u1')).toBeNull();
    expect(normalizeRow(row({ itemId: null }), 'u1')).toBeNull();
    expect(normalizeRow(row(), '')).toBeNull();
    expect(normalizeRow(null, 'u1')).toBeNull();
  });

  it('refuses a row whose correctness is not a boolean', () => {
    // `undefined` here would silently become a falsy "wrong" and inflate the
    // measured error rate of every item it touched.
    expect(normalizeRow(row({ correct: undefined }), 'u1')).toBeNull();
    expect(normalizeRow(row({ correct: 1 }), 'u1')).toBeNull();
  });

  it('clamps an absurd duration instead of trusting it', () => {
    // A tab left open overnight otherwise contributes a 40,000,000ms "answer".
    expect(normalizeRow(row({ msToAnswer: 8000 }), 'u1').msToAnswer).toBe(8000);
    expect(normalizeRow(row({ msToAnswer: 40000000 }), 'u1').msToAnswer).toBe(600000);
    expect(normalizeRow(row({ msToAnswer: -5 }), 'u1').msToAnswer).toBeNull();
    expect(normalizeRow(row({ msToAnswer: undefined }), 'u1').msToAnswer).toBeNull();
  });

  it('falls back to a known source rather than storing a junk one', () => {
    expect(normalizeRow(row({ source: 'nonsense' }), 'u1').source).toBe('practiceTest');
    for (const s of SOURCES) expect(normalizeRow(row({ source: s }), 'u1').source).toBe(s);
  });
});

describe('the field firestore.rules actually checks', () => {
  it('writes userId, because ownsIncoming() reads request.resource.data.userId', () => {
    // This is not pedantry. The first version of this file wrote `uid`. It
    // compiled, its mocked tests passed, and every write to production would
    // have been rejected by the security rules — leaving an empty log that
    // looked healthy. Pin the name against the rule that enforces it.
    const fs = require('fs');
    const path = require('path');
    const rules = fs.readFileSync(path.resolve(__dirname, '..', '..', 'firestore.rules'), 'utf8');
    expect(rules).toMatch(/function ownsIncoming\(\)[\s\S]*?request\.resource\.data\.userId/);
    expect(rules).toMatch(/match \/responses\/\{[^}]+\}/);
    // And the log must be append-only: no update, no delete, not even by the owner.
    // Bound the window on the NEXT match block, not on the first '}' — that
    // one closes `{responseId}` and the slice came back empty.
    const start = rules.indexOf('match /responses/');
    const rest = rules.slice(start + 1);
    const end = rest.indexOf('match /');
    const block = rest.slice(0, end === -1 ? rest.length : end);
    expect(block).toMatch(/allow update, delete: if false/);
    expect(block).toMatch(/allow create: if ownsIncoming\(\)/);
    expect(Object.keys(normalizeRow({ itemId: 'q', correct: true }, 'u1'))).toContain('userId');
  });
});

describe('logResponses', () => {
  const written = () => mockSet.mock.calls.map(([ref, data]) => ({ col: ref.__doc, data }));

  it('writes one responseSets document per test, holding every row', async () => {
    // One write instead of one per answer: Firebase's free plan allows 20,000
    // writes a day for the whole site.
    expect(await logResponses('u1', [row(), row({ itemId: 'q2', correct: true })])).toBe(2);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    const sets = written();
    expect(sets).toHaveLength(1);
    expect(sets[0].col).toBe('responseSets');
    expect(sets[0].data).toMatchObject({ userId: 'u1', source: 'practiceTest', subject: 'AP Statistics', count: 2, at: '__ts' });
    expect(sets[0].data.rows.map((r) => [r.itemId, r.chosen, r.correct])).toEqual([['q1', 2, false], ['q2', 2, true]]);
  });

  it('keeps serverTimestamp out of the rows, which Firestore refuses inside arrays', async () => {
    await logResponses('u1', [row()]);
    const [set] = written();
    for (const r of set.data.rows) {
      expect(r).not.toHaveProperty('at');
      expect(r).not.toHaveProperty('userId');
    }
  });

  it('splits a very long session into several sets in one commit', async () => {
    const many = Array.from({ length: 1000 }, (_, i) => row({ itemId: `q${i}` }));
    expect(await logResponses('u1', many)).toBe(1000);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    const sets = written();
    expect(sets).toHaveLength(Math.ceil(1000 / ROWS_PER_SET));
    expect(sets.reduce((n, s) => n + s.data.rows.length, 0)).toBe(1000);
    expect(Math.max(...sets.map((s) => s.data.rows.length))).toBeLessThanOrEqual(ROWS_PER_SET);
  });

  it('falls back to one document per row when the new rules are not deployed yet', async () => {
    mockCommit
      .mockImplementationOnce(() => Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' })))
      .mockImplementation(() => Promise.resolve());
    expect(await logResponses('u1', [row(), row({ itemId: 'q2' })])).toBe(2);
    const legacy = written().filter((w) => w.col === 'responses');
    expect(legacy.map((w) => w.data.itemId)).toEqual(['q1', 'q2']);
    expect(legacy[0].data).toMatchObject({ userId: 'u1', at: '__ts' });
  });

  it('never throws at the caller when the write fails', async () => {
    mockCommit.mockImplementation(() => Promise.reject(new Error('offline')));
    await expect(logResponses('u1', [row()])).resolves.toBe(0);
    mockCommit.mockImplementation(() => Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' })));
    await expect(logResponses('u1', [row()])).resolves.toBe(0);
  });

  it('does nothing without a uid or rows', async () => {
    expect(await logResponses('', [row()])).toBe(0);
    expect(await logResponses('u1', [])).toBe(0);
    expect(await logResponses('u1', null)).toBe(0);
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it('skips the write entirely when every row is junk', async () => {
    expect(await logResponses('u1', [{ itemId: '' }, null])).toBe(0);
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it('logResponse writes a single row', async () => {
    expect(await logResponse('u1', row())).toBe(1);
  });
});

describe('reading the log back', () => {
  it('flattens sets into the same rows a responses document holds', () => {
    const at = { toMillis: () => 5 };
    expect(flattenSets([{ userId: 'u1', at, rows: [{ itemId: 'q1', correct: true }, null] }, { rows: 'junk' }, null]))
      .toEqual([{ itemId: 'q1', correct: true, userId: 'u1', at }]);
  });

  it('returns rows from sets and from older per-answer documents', async () => {
    firestore.query.mockImplementation((col) => col);
    firestore.getDocs.mockImplementation(async (col) => ({
      docs: (col.__col === 'responseSets'
        ? [{ userId: 'u1', at: 1, rows: [{ itemId: 'a', subject: 'AP Biology', unit: 'u1', correct: true }, { itemId: 'b', correct: false }] }]
        : [{ userId: 'u1', itemId: 'old', correct: true, at: 0 }]
      ).map((d) => ({ data: () => d })),
    }));
    const rows = await getMyResponses('u1');
    expect(rows.map((r) => r.itemId)).toEqual(['a', 'b', 'old']);
    expect(rows[0]).toMatchObject({ userId: 'u1', subject: 'AP Biology', unit: 'u1', correct: true, at: 1 });
  });

  it('still returns what it can when one collection fails to read', async () => {
    firestore.query.mockImplementation((col) => col);
    firestore.getDocs.mockImplementation(async (col) => {
      if (col.__col === 'responses') throw new Error('offline');
      return { docs: [{ data: () => ({ userId: 'u1', rows: [{ itemId: 'a', correct: true }] }) }] };
    });
    expect((await getMyResponses('u1')).map((r) => r.itemId)).toEqual(['a']);
    expect(await getMyResponses('')).toEqual([]);
  });
});

describe('responseSets rules', () => {
  it('are append-only, owner-only, and cap rows at ROWS_PER_SET', () => {
    const fs = require('fs');
    const path = require('path');
    const rules = fs.readFileSync(path.resolve(__dirname, '..', '..', 'firestore.rules'), 'utf8');
    const start = rules.indexOf('match /responseSets/');
    expect(start).toBeGreaterThan(-1);
    const rest = rules.slice(start + 1);
    const end = rest.indexOf('match /');
    const block = rest.slice(0, end === -1 ? rest.length : end);
    expect(block).toMatch(/allow read: if ownsExisting\(\)/);
    expect(block).toMatch(/allow create: if ownsIncoming\(\)/);
    expect(block).toMatch(/allow update, delete: if false/);
    expect(block).toMatch(new RegExp(`rows\\.size\\(\\) <= ${ROWS_PER_SET}\\b`));
  });
});
