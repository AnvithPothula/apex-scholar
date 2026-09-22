/**
 * The response log is append-only and nothing reads it yet, which is exactly
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
}));
jest.mock('../config/firestore', () => ({ db: {} }));

const firestore = require('firebase/firestore');
const { normalizeRow, logResponses, logResponse, SOURCES } = require('./responseLog');

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
  firestore.collection.mockImplementation(() => ({ __col: 'responses' }));
  firestore.doc.mockImplementation(() => ({ __doc: true }));
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
  it('writes one document per row', async () => {
    expect(await logResponses('u1', [row(), row({ itemId: 'q2' })])).toBe(2);
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it('chunks past the Firestore batch limit instead of losing the tail', async () => {
    const many = Array.from({ length: 1000 }, (_, i) => row({ itemId: `q${i}` }));
    expect(await logResponses('u1', many)).toBe(1000);
    expect(mockSet).toHaveBeenCalledTimes(1000);
    expect(mockCommit).toHaveBeenCalledTimes(3); // 450 + 450 + 100
  });

  it('never throws at the caller when the write fails', async () => {
    mockCommit.mockImplementation(() => Promise.reject(new Error('offline')));
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
