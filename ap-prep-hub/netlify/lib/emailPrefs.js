/**
 * Per-category email preferences.
 *
 * `emailOptIn === false` still means "nothing at all" (the master switch every
 * sender already honours). On top of it, users/{uid}.emailPrefs can turn single
 * categories off; a missing category means on, matching how a missing
 * emailOptIn has always been treated.
 *
 * The category keys are a contract with src/pages/Settings.js and are checked
 * by src/services/emailPrefs.test.js.
 */

const EMAIL_CATEGORIES = {
  weekly: 'Weekly digest on Sundays: reviews due, exam countdown, latest predicted score',
  examWeek: 'A short daily reminder in the final week before each of your exams',
  announcements: 'Occasional announcements: new subjects and features',
};

/** Should this user get an email of this category? */
function wants(user, category) {
  return Boolean(user) && user.emailOptIn !== false && user.emailPrefs?.[category] !== false;
}

/** Fields of an application/x-www-form-urlencoded body (Netlify may base64 it). */
function parseForm(event = {}) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  return Object.fromEntries(new URLSearchParams(raw));
}

/** The Firestore patch for a submitted preferences form. Unticked = off. */
function prefsFromForm(fields = {}) {
  const emailPrefs = Object.fromEntries(
    Object.keys(EMAIL_CATEGORIES).map((k) => [k, fields[k] === 'on'])
  );
  return { emailOptIn: Object.values(emailPrefs).some(Boolean), emailPrefs };
}

module.exports = { EMAIL_CATEGORIES, wants, parseForm, prefsFromForm };
