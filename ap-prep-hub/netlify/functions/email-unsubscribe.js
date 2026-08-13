/**
 * One-click unsubscribe. No login required, by design.
 *
 * Requiring a sign-in to stop receiving mail is exactly the pattern CAN-SPAM
 * exists to prevent, and a student who wants out should not have to remember a
 * password to get out. The token is HMAC-signed with UNSUBSCRIBE_SECRET, so a
 * link only ever unsubscribes the uid it was minted for — nobody can
 * unsubscribe someone else by guessing.
 *
 * Answers GET (the link in the email) and POST (RFC 8058 one-click, which mail
 * clients fire from their native "Unsubscribe" button).
 */

const crypto = require('crypto');
const { getAdminApp } = require('../lib/firebaseAdmin');

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


const page = (title, message) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:48px 24px;background:#0b0d10;color:#e8eaed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:480px;margin:0 auto;text-align:center">
<h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
<p style="color:#9aa0a6;line-height:1.6;margin:0 0 24px">${message}</p>
<a href="https://apex-scholar.com" style="color:#4dd6c1">Back to Apex Scholar</a>
</div></body></html>`;

exports.handler = async (event) => {
  const html = { 'Content-Type': 'text/html; charset=utf-8' };

  const token = (event.queryStringParameters || {}).t
    || (() => { try { return JSON.parse(event.body || '{}').t; } catch { return null; } })();

  const uid = verifyToken(token);
  if (!uid) {
    return {
      statusCode: 400, headers: html,
      body: page('Link not valid', 'This unsubscribe link is invalid or has expired. Email help@apex-scholar.com and we\'ll remove you manually.'),
    };
  }

  const { app, error: adminError } = getAdminApp();
  if (!app) {
    console.error('[email-unsubscribe] admin unavailable:', adminError);
    return { statusCode: 503, headers: html, body: page('Temporarily unavailable', 'Please try again shortly, or email help@apex-scholar.com and we\'ll remove you manually.') };
  }

  try {
    await app.firestore().doc(`users/${uid}`).set(
      { emailOptIn: false, emailOptOutAt: new Date().toISOString() },
      { merge: true }
    );
    return {
      statusCode: 200, headers: html,
      body: page('You\'re unsubscribed', 'You won\'t receive any more emails from Apex Scholar. Your account and study progress are untouched.'),
    };
  } catch (err) {
    console.error('[email-unsubscribe] failed:', err);
    return { statusCode: 500, headers: html, body: page('Something went wrong', 'Email help@apex-scholar.com and we\'ll remove you manually.') };
  }
};
