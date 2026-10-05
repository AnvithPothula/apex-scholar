/**
 * Email preferences and unsubscribe. No login required, by design.
 *
 * Requiring a sign-in to stop receiving mail is exactly the pattern CAN-SPAM
 * exists to prevent, and a student who wants out should not have to remember a
 * password to get out. The token is HMAC-signed with UNSUBSCRIBE_SECRET, so a
 * link only ever changes the uid it was minted for — nobody can unsubscribe
 * someone else by guessing.
 *
 *   GET   the link in the email. Shows the categories (weekly digest, exam-week
 *         reminders, announcements) and an "unsubscribe from everything"
 *         button. It changes nothing by itself: school mail filters often open
 *         every link in a message, which used to unsubscribe students silently.
 *   POST  the form above, or RFC 8058 one-click from a mail client's native
 *         Unsubscribe button (body "List-Unsubscribe=One-Click"), which turns
 *         everything off as that standard requires.
 */

const crypto = require('crypto');
const { getAdminApp } = require('../lib/firebaseAdmin');
const { EMAIL_CATEGORIES, wants, parseForm, prefsFromForm } = require('../lib/emailPrefs');

function verifyToken(token) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || !token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  let uid;
  try {
    uid = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  if (!uid) return null;
  const expected = crypto.createHmac('sha256', secret).update(uid).digest('hex').slice(0, 32);
  // Constant-time compare so the signature can't be brute-forced by timing.
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return uid;
}

const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const shell = (title, inner) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:48px 16px;background:#0b0d10;color:#e8eaed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:480px;margin:0 auto">
<h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
${inner}
<p style="margin:28px 0 0"><a href="https://apex-scholar.com" style="color:#4dd6c1">Back to Apex Scholar</a></p>
</div></body></html>`;

const page = (title, message) =>
  shell(title, `<p style="color:#9aa0a6;line-height:1.6;margin:0">${esc(message)}</p>`);

function preferencesPage(token, user) {
  const rows = Object.entries(EMAIL_CATEGORIES).map(([key, label]) => `
<label style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #2e2e2e;cursor:pointer">
  <input type="checkbox" name="${key}" ${wants(user, key) ? 'checked' : ''} style="width:18px;height:18px;margin-top:2px">
  <span style="line-height:1.5">${esc(label)}</span>
</label>`).join('');
  const btn = 'display:block;width:100%;padding:12px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer';
  return shell('Your email preferences', `
<p style="color:#9aa0a6;line-height:1.6;margin:0 0 16px">Choose what you'd like to keep getting. Account and security messages, like a password reset, are always sent.</p>
<form method="post" action="?t=${esc(token)}">
  ${rows}
  <button type="submit" name="action" value="save" style="${btn};margin-top:20px;background:#0f766e;color:#fff;border:0">Save preferences</button>
  <button type="submit" name="action" value="all" style="${btn};margin-top:10px;background:transparent;color:#e8eaed;border:1px solid #2e2e2e">Unsubscribe from all emails</button>
</form>`);
}

const ALL_OFF = { emailOptIn: false, emailPrefs: Object.fromEntries(Object.keys(EMAIL_CATEGORIES).map((k) => [k, false])) };

exports.handler = async (event) => {
  const html = { 'Content-Type': 'text/html; charset=utf-8' };
  const isPost = event.httpMethod === 'POST';
  const form = isPost ? parseForm(event) : {};

  const token = (event.queryStringParameters || {}).t
    || form.t
    || (() => { try { return JSON.parse(event.body || '{}').t; } catch { return null; } })();

  const uid = verifyToken(token);
  if (!uid) {
    return {
      statusCode: 400, headers: html,
      body: page('Link not valid', 'This link is invalid or has expired. Email help@apex-scholar.com and we\'ll update your preferences manually.'),
    };
  }

  const { app, error: adminError } = getAdminApp();
  if (!app) {
    console.error('[email-unsubscribe] admin unavailable:', adminError);
    return { statusCode: 503, headers: html, body: page('Temporarily unavailable', 'Please try again shortly, or email help@apex-scholar.com and we\'ll remove you manually.') };
  }
  const ref = app.firestore().doc(`users/${uid}`);

  try {
    if (!isPost) {
      const snap = await ref.get();
      return { statusCode: 200, headers: html, body: preferencesPage(token, snap.exists ? snap.data() : {}) };
    }

    const now = new Date().toISOString();
    // One-click from a mail client, the "all" button, or anything that isn't the form.
    if (form['List-Unsubscribe'] === 'One-Click' || form.action !== 'save') {
      await ref.set({ ...ALL_OFF, emailOptOutAt: now }, { merge: true });
      return {
        statusCode: 200, headers: html,
        body: page('You\'re unsubscribed', 'You won\'t receive any more emails from Apex Scholar. Your account and study progress are untouched.'),
      };
    }

    const before = (await ref.get()).data() || {};
    const patch = prefsFromForm(form);
    await ref.set({
      ...patch,
      ...(patch.emailOptIn ? {} : { emailOptOutAt: now }),
      // Consent given again from their own inbox: stamp it, like Settings does.
      ...(patch.emailOptIn && before.emailOptIn === false ? { emailOptInAt: now } : {}),
    }, { merge: true });
    const kept = Object.keys(EMAIL_CATEGORIES).filter((k) => patch.emailPrefs[k]).map((k) => EMAIL_CATEGORIES[k].split(':')[0]);
    return {
      statusCode: 200, headers: html,
      body: page('Preferences saved', kept.length
        ? `You'll keep getting: ${kept.join('; ')}. You can change this any time from this link or in Settings.`
        : 'You won\'t receive any more emails from Apex Scholar. Your account and study progress are untouched.'),
    };
  } catch (err) {
    console.error('[email-unsubscribe] failed:', err);
    return { statusCode: 500, headers: html, body: page('Something went wrong', 'Email help@apex-scholar.com and we\'ll update your preferences manually.') };
  }
};
