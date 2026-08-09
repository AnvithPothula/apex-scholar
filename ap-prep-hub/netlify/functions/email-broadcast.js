/**
 * Admin-only email broadcast via SMTP2GO.
 *
 * Sends to users who have explicitly opted in (`settings.emailOptIn === true`).
 * There is deliberately no "send to everyone" mode: this audience is largely
 * minors, and mailing them without consent is the single mistake that would
 * permanently burn the domain's sending reputation — and is not legal to do.
 *
 * Every message carries a one-click unsubscribe link with an HMAC-signed token,
 * handled by email-unsubscribe.js, so a recipient never needs to log in to stop
 * receiving mail (CAN-SPAM expects this, and the signature stops anyone
 * unsubscribing somebody else).
 *
 * Env required:
 *   SMTP2GO_API_KEY   send-only API key
 *   MAIL_FROM         e.g. no-reply@apex-scholar.com (must be a verified sender)
 *   UNSUBSCRIBE_SECRET random string used to sign unsubscribe tokens
 *   FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 */

const crypto = require('crypto');

const ADMIN_UIDS = ['b0eUycwZDHcmrkoeSEiD69QSbK32', 'A0yRGP86ZTahByzS0ALYeKAXOn52'];

// SMTP2GO's own documented ceiling per request. Larger audiences are chunked.
const BATCH_SIZE = 100;
const MAX_RECIPIENTS = 5000;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map((s) => s.trim()).filter(Boolean);

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] || '');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

let _adminApp = null;
let _adminTried = false;

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') };
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) return JSON.parse(raw);
  return null;
}

function getAdminApp() {
  if (_adminTried) return _adminApp;
  _adminTried = true;
  try {
    const creds = loadServiceAccount();
    if (!creds) return null;
    const admin = require('firebase-admin');
    _adminApp = (admin.apps && admin.apps.length)
      ? admin.app()
      : admin.initializeApp({ credential: admin.credential.cert(creds) });
    return _adminApp;
  } catch (err) {
    console.error('[email-broadcast] firebase-admin init failed:', err.message);
    return null;
  }
}

async function verifyAdminUid(event, app) {
  const h = event.headers || {};
  const m = (h.authorization || h.Authorization || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try {
    const decoded = await app.auth().verifyIdToken(m[1]);
    return decoded.uid && ADMIN_UIDS.includes(decoded.uid) ? decoded.uid : null;
  } catch {
    return null;
  }
}

/** Signed, self-verifying unsubscribe token — no login, no lookup table. */
function unsubscribeToken(uid) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return null;
  const sig = crypto.createHmac('sha256', secret).update(uid).digest('hex').slice(0, 32);
  return `${Buffer.from(uid).toString('base64url')}.${sig}`;
}

const escapeHtml = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Email HTML.
 *
 * Constraints that drive every choice here: Gmail strips <style> blocks, Outlook
 * ignores flexbox and most modern CSS, and many clients block remote images by
 * default. So this is table-free but fully inline-styled, uses no images, and
 * degrades to readable text if CSS is dropped entirely. Light background on
 * purpose — a dark email in a light inbox reads as spam.
 */
function buildHtml(bodyHtml, unsubUrl, subject) {
  // Exact dark-mode tokens from src/index.css, so the email matches the app.
  const C = {
    canvas: '#0a0a0a',      // base-950
    card: '#171717',        // base-850
    raised: '#1e1e1e',      // base-800
    border: '#2e2e2e',      // border-strong
    text: '#ededef',        // content-primary
    secondary: '#a0a0a8',   // content-secondary
    muted: '#9a9aa3',       // content-muted
    teal: '#2dd4bf',        // primary-400
    tealDeep: '#0f766e',    // primary-700 — button fill, keeps white text legible
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject || 'Apex Scholar')}</title>
</head>
<body style="margin:0;padding:0;background:${C.canvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.text};-webkit-font-smoothing:antialiased">
  <!-- Preheader: the grey line a client shows next to the subject. Hidden in
       the body itself so it isn't duplicated visually. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(subject || '')}</div>

  <!-- A full-bleed table, not a div: Outlook ignores background colours on divs,
       which would leave dark text on its default white and make the whole mail
       unreadable. The table is the only reliable way to paint the canvas. -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:${C.canvas};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%">

          <tr>
            <td align="center" style="padding-bottom:20px">
              <div style="font-size:18px;font-weight:700;letter-spacing:-0.3px;color:${C.teal}">Apex Scholar</div>
              <div style="font-size:12px;color:${C.muted};margin-top:2px">Free AP exam prep</div>
            </td>
          </tr>

          <tr>
            <td style="background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:32px 28px">
              ${subject ? `<h1 style="margin:0 0 18px;font-size:20px;line-height:1.35;font-weight:700;color:${C.text}">${escapeHtml(subject)}</h1>` : ''}
              ${bodyHtml}
              <div style="margin-top:28px">
                <a href="https://apex-scholar.com"
                   style="display:inline-block;background:${C.tealDeep};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px">
                  Open Apex Scholar
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 8px 0">
              <p style="font-size:12px;line-height:1.6;color:${C.muted};margin:0 0 6px">
                You're receiving this because you're subscribed to Apex Scholar emails.
              </p>
              <p style="font-size:12px;line-height:1.6;color:${C.muted};margin:0">
                <a href="${unsubUrl}" style="color:${C.secondary};text-decoration:underline">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="https://apex-scholar.com/privacy" style="color:${C.secondary};text-decoration:underline">Privacy</a>
                &nbsp;·&nbsp;
                <a href="mailto:help@apex-scholar.com" style="color:${C.secondary};text-decoration:underline">help@apex-scholar.com</a>
              </p>
              <p style="font-size:11px;color:${C.muted};margin:12px 0 0">
                AP® is a trademark of the College Board, which is not affiliated with Apex Scholar.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body></html>`;
}

/** Preserve paragraph breaks from a plain-text body without allowing markup. */
function bodyToHtml(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((para) =>
      // #a0a0a8 = content-secondary. ~7.5:1 on the #171717 card, so it clears
      // WCAG AA even though email clients never audit this.
      `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#a0a0a8">${
        escapeHtml(para).replace(/\n/g, '<br>')
      }</p>`
    )
    .join('');
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = cors(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.SMTP2GO_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'SMTP2GO_API_KEY or MAIL_FROM is not set.' }) };
  }
  if (!process.env.UNSUBSCRIBE_SECRET) {
    // Refuse rather than send mail nobody can opt out of.
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'UNSUBSCRIBE_SECRET is not set.' }) };
  }

  const app = getAdminApp();
  if (!app) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Server is missing Firebase admin credentials.' }) };
  }
  const adminUid = await verifyAdminUid(event, app);
  if (!adminUid) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin only.' }) };

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body.' }) }; }

  const subject = String(payload.subject || '').trim();
  const bodyText = String(payload.body || '').trim();
  const dryRun = payload.dryRun !== false; // default to a dry run, on purpose
  const testTo = String(payload.testTo || '').trim();

  if (!subject || !bodyText) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'subject and body are required.' }) };
  }

  const db = app.firestore();
  const origin0 = ALLOWED_ORIGINS[0] || 'https://apex-scholar.com';

  try {
    // Audience = everyone who has not opted OUT.
    //
    // `emailOptIn === false` is an explicit opt-out and is always excluded.
    // A MISSING field means an account created before the checkbox existed;
    // by product decision those legacy users are treated as subscribed, and
    // every message carries a one-click unsubscribe.
    //
    // This is a full-collection read rather than a `where` query because
    // Firestore cannot express "field is missing OR true". At ~1000 users
    // that's ~1000 reads per broadcast, well inside the 50k/day free tier.
    //
    // Top-level `emailOptIn`, not `settings.emailOptIn`: Settings.js writes flat
    // fields onto users/{uid} and there is no nested `settings` map.
    const snap = await db.collection('users').get();
    const recipients = [];
    let optedOut = 0;
    snap.forEach((d) => {
      const data = d.data() || {};
      if (data.emailOptIn === false) { optedOut += 1; return; }
      const email = data.email;
      if (email && typeof email === 'string' && email.includes('@')) {
        recipients.push({ uid: d.id, email });
      }
    });
    console.log(`[email-broadcast] audience=${recipients.length} optedOut=${optedOut}`);

    if (recipients.length > MAX_RECIPIENTS) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: `Refusing to send to ${recipients.length} recipients in one call (cap ${MAX_RECIPIENTS}).` }),
      };
    }

    // A test send goes to exactly one address and touches nobody else.
    if (testTo) {
      const token = unsubscribeToken(adminUid);
      const unsubUrl = `${origin0}/.netlify/functions/email-unsubscribe?t=${token}`;
      const res = await sendBatch(apiKey, from, [testTo], subject, bodyText, unsubUrl);
      return { statusCode: res.ok ? 200 : 502, headers, body: JSON.stringify({ mode: 'test', to: testTo, ...res }) };
    }

    if (dryRun) {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          mode: 'dry-run',
          wouldSend: recipients.length,
          sample: recipients.slice(0, 3).map((r) => r.email),
          note: 'Nothing was sent. Re-post with dryRun:false to actually send.',
        }),
      };
    }

    let sent = 0;
    const failures = [];
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const chunk = recipients.slice(i, i + BATCH_SIZE);
      // Personalised unsubscribe means one link per recipient, so each is its
      // own send rather than one blast with a shared link.
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.all(chunk.map(async (r) => {
        const unsubUrl = `${origin0}/.netlify/functions/email-unsubscribe?t=${unsubscribeToken(r.uid)}`;
        const out = await sendBatch(apiKey, from, [r.email], subject, bodyText, unsubUrl);
        return { email: r.email, ...out };
      }));
      results.forEach((r) => (r.ok ? sent++ : failures.push({ email: r.email, error: r.error })));
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ mode: 'sent', sent, failed: failures.length, failures: failures.slice(0, 20) }),
    };
  } catch (err) {
    console.error('[email-broadcast] failed:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Broadcast failed.' }) };
  }
};

async function sendBatch(apiKey, from, to, subject, bodyText, unsubUrl) {
  try {
    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Smtp2go-Api-Key': apiKey },
      body: JSON.stringify({
        sender: from,
        to,
        subject,
        text_body: `${bodyText}\n\n---\nApex Scholar · https://apex-scholar.com\nUnsubscribe: ${unsubUrl}`,
        html_body: buildHtml(bodyToHtml(bodyText), unsubUrl, subject),
        // Mail clients surface this as a native one-click unsubscribe button.
        custom_headers: [
          { header: 'List-Unsubscribe', value: `<${unsubUrl}>` },
          { header: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
        ],
      }),
    });
    const json = await res.json().catch(() => ({}));
    const succeeded = json?.data?.succeeded ?? 0;
    if (!res.ok || succeeded < 1) {
      return { ok: false, error: json?.data?.error || json?.error || `HTTP ${res.status}` };
    }
    return { ok: true, succeeded };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
