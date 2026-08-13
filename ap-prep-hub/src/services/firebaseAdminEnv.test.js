/**
 * Tests for netlify/lib/firebaseAdmin.js.
 *
 * Lives under src/ because CRA's jest only scans that directory; the module
 * itself belongs with the functions that use it. Same arrangement as
 * constants/admins.test.js, which reads the function files from here too.
 */
const { normalizePrivateKey, describeKeyProblem, loadServiceAccount } = require('../../netlify/lib/firebaseAdmin');

const REAL_SHAPE = '-----BEGIN PRIVATE KEY-----\nMIIBVgIBADANBg\n-----END PRIVATE KEY-----\n';

describe('normalizePrivateKey', () => {
  it('converts escaped \\n into real newlines — the usual env-var mangling', () => {
    const escaped = '-----BEGIN PRIVATE KEY-----\\nMIIBVgIBADANBg\\n-----END PRIVATE KEY-----\\n';
    expect(normalizePrivateKey(escaped)).toBe(REAL_SHAPE);
  });

  it('strips surrounding double or single quotes', () => {
    expect(normalizePrivateKey(`"${REAL_SHAPE.trim()}"`)).toBe(REAL_SHAPE);
    expect(normalizePrivateKey(`'${REAL_SHAPE.trim()}'`)).toBe(REAL_SHAPE);
  });

  it('normalises CRLF, escaped and real', () => {
    expect(normalizePrivateKey('a\\r\\nb')).toBe('a\nb\n');
    expect(normalizePrivateKey('a\r\nb')).toBe('a\nb\n');
  });

  it('always ends with a newline, which OpenSSL requires', () => {
    expect(normalizePrivateKey('-----BEGIN X-----\nzz\n-----END X-----')).toMatch(/\n$/);
  });

  it('leaves an already-correct key untouched', () => {
    expect(normalizePrivateKey(REAL_SHAPE)).toBe(REAL_SHAPE);
  });

  it('handles non-strings without throwing', () => {
    [null, undefined, 42, {}].forEach((v) => expect(normalizePrivateKey(v)).toBe(''));
  });
});

describe('describeKeyProblem', () => {
  it('accepts a well-shaped key', () => {
    expect(describeKeyProblem(REAL_SHAPE)).toBeNull();
  });

  it('names the specific problem instead of a generic failure', () => {
    expect(describeKeyProblem('')).toMatch(/empty/i);
    expect(describeKeyProblem('no header here\n')).toMatch(/BEGIN/);
    expect(describeKeyProblem('-----BEGIN PRIVATE KEY-----\nzz\n')).toMatch(/END/);
    expect(describeKeyProblem('-----BEGIN PRIVATE KEY----- zz -----END PRIVATE KEY-----'))
      .toMatch(/newlines/i);
  });
});

describe('loadServiceAccount', () => {
  const OLD = process.env;
  beforeEach(() => { process.env = { ...OLD }; delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL; delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_SERVICE_ACCOUNT; });
  afterAll(() => { process.env = OLD; });

  it('names exactly which variables are missing', () => {
    const { creds, error } = loadServiceAccount();
    expect(creds).toBeNull();
    expect(error).toMatch(/FIREBASE_PROJECT_ID/);
    expect(error).toMatch(/FIREBASE_PRIVATE_KEY/);
  });

  it('prefers the three split vars', () => {
    process.env.FIREBASE_PROJECT_ID = 'p';
    process.env.FIREBASE_CLIENT_EMAIL = 'a@b.com';
    process.env.FIREBASE_PRIVATE_KEY = REAL_SHAPE;
    const { creds, source } = loadServiceAccount();
    expect(source).toBe('split');
    expect(creds.privateKey).toBe(REAL_SHAPE);
  });

  it('reports invalid service-account JSON rather than failing silently', () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = '{not json';
    const { creds, error } = loadServiceAccount();
    expect(creds).toBeNull();
    expect(error).toMatch(/not valid JSON/);
  });
});
