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

describe('fingerprintPrivateKey', () => {
  const { fingerprintPrivateKey, describeKeyProblem, normalizePrivateKey } =
    require('../../netlify/lib/firebaseAdmin');

  const BODY = 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ'.repeat(30);

  it('reports structure only — never key material', () => {
    const fp = fingerprintPrivateKey('-----BEGIN PRIVATE KEY-----\\n' + BODY + '\\n-----END PRIVATE KEY-----\\n');
    expect(fp).not.toContain(BODY.slice(0, 20));
    expect(fp).toMatch(/BEGIN marker: yes/);
    expect(fp).toMatch(/END marker: yes/);
  });

  it('identifies a key pasted without its PEM armor', () => {
    // The production symptom: no BEGIN header, value ends in base64 + \n.
    const fp = fingerprintPrivateKey(BODY + 'Xn\\n');
    expect(fp).toMatch(/PEM header is missing/);
    expect(fp).toMatch(/BEGIN marker: NO/);
  });

  it('spots the whole service-account JSON in the wrong variable', () => {
    expect(fingerprintPrivateKey('{"type":"service_account"}'))
      .toMatch(/FIREBASE_SERVICE_ACCOUNT/);
  });

  it('spots a quote-wrapped value', () => {
    expect(fingerprintPrivateKey('"-----BEGIN PRIVATE KEY-----"')).toMatch(/quote character/);
  });

  it('says "not set" rather than throwing on an absent value', () => {
    expect(fingerprintPrivateKey(undefined)).toBe('not set');
    expect(fingerprintPrivateKey('')).toBe('not set');
  });

  it('attaches the fingerprint to the missing-header message', () => {
    const raw = BODY + 'Xn\\n';
    const msg = describeKeyProblem(normalizePrivateKey(raw), raw);
    expect(msg).toMatch(/no "-----BEGIN PRIVATE KEY-----" header/);
    expect(msg).toMatch(/PEM header is missing/);
  });

  it('stays backward compatible when no raw value is passed', () => {
    expect(describeKeyProblem('nonsense')).toMatch(/no "-----BEGIN/);
    expect(describeKeyProblem('nonsense')).not.toMatch(/\[/);
  });
});
