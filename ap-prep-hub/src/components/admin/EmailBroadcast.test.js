// These are pure predicates, but importing the component pulls in firebase/auth,
// which blows up under jsdom (no TextEncoder). Same stub the SRS tests use.
jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }));

import { isComposed, isArmed, canSendForReal } from './EmailBroadcast';

describe('isComposed', () => {
  it('requires both a subject and a body', () => {
    expect(isComposed({ subject: 'Hi', body: 'There' })).toBe(true);
    expect(isComposed({ subject: 'Hi', body: '' })).toBe(false);
    expect(isComposed({ subject: '', body: 'There' })).toBe(false);
  });

  it('treats whitespace-only as empty', () => {
    expect(isComposed({ subject: '   ', body: 'There' })).toBe(false);
    expect(isComposed({ subject: 'Hi', body: '\n\t ' })).toBe(false);
  });

  it('survives missing fields', () => {
    expect(isComposed({})).toBe(false);
    expect(isComposed({ subject: null, body: undefined })).toBe(false);
  });
});

describe('isArmed', () => {
  it('accepts SEND in any case, trimmed', () => {
    ['SEND', 'send', ' Send ', 'sEnD'].forEach((v) => expect(isArmed(v)).toBe(true));
  });

  it('rejects anything else — this is the only guard before an irreversible send', () => {
    ['', 'SEN', 'SENDD', 'send it', 'yes', 'OK', null, undefined, 0].forEach((v) =>
      expect(isArmed(v)).toBe(false)
    );
  });
});

describe('canSendForReal', () => {
  const base = { subject: 'Exams soon', body: 'Good luck', confirmText: 'SEND', busy: '' };

  it('allows a fully composed and armed send', () => {
    expect(canSendForReal(base)).toBe(true);
  });

  it('blocks when not armed, even with a complete message', () => {
    expect(canSendForReal({ ...base, confirmText: '' })).toBe(false);
    expect(canSendForReal({ ...base, confirmText: 'yes' })).toBe(false);
  });

  it('blocks an armed but empty message, so SEND alone can never fire', () => {
    expect(canSendForReal({ ...base, subject: '', body: '' })).toBe(false);
  });

  it('blocks while a request is already in flight, preventing a double send', () => {
    expect(canSendForReal({ ...base, busy: 'send' })).toBe(false);
    expect(canSendForReal({ ...base, busy: 'dry' })).toBe(false);
  });
});
