const { EMAIL_CATEGORIES, wants, parseForm, prefsFromForm } = require('../../netlify/lib/emailPrefs');
import { EMAIL_CATEGORIES as CLIENT } from '../constants/emailCategories';

describe('email preferences', () => {
  it('uses the same category keys on the client and server', () => {
    expect(Object.keys(CLIENT)).toEqual(Object.keys(EMAIL_CATEGORIES));
  });

  it('treats missing as on, and the master switch as off for everything', () => {
    expect(wants({}, 'weekly')).toBe(true);
    expect(wants({ emailPrefs: { weekly: false } }, 'weekly')).toBe(false);
    expect(wants({ emailPrefs: { weekly: false } }, 'announcements')).toBe(true);
    expect(wants({ emailOptIn: false }, 'examWeek')).toBe(false);
    expect(wants(null, 'weekly')).toBe(false);
  });

  it('reads the form (plain or base64) and turns unticked boxes off', () => {
    const body = 'weekly=on&action=save';
    expect(parseForm({ body })).toEqual({ weekly: 'on', action: 'save' });
    expect(parseForm({ body: Buffer.from(body).toString('base64'), isBase64Encoded: true }).weekly).toBe('on');
    expect(prefsFromForm({ weekly: 'on' })).toEqual({
      emailOptIn: true, emailPrefs: { weekly: true, examWeek: false, announcements: false },
    });
    expect(prefsFromForm({}).emailOptIn).toBe(false);
  });
});
