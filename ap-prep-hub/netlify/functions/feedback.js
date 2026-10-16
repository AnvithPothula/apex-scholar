/**
 * Store one feedback response in Firestore (`feedback`, which no client can
 * read or write; only this function, through the admin SDK).
 *
 * POST <feedback fields> with an optional  Authorization: Bearer <ID token>
 * Guests can send feedback; a signed-in sender's uid is taken from the
 * verified token, never from the body. The email copy is still sent from the
 * browser (EmailJS); this keeps a record even when email fails.
 */

const { getAdminApp } = require('../lib/firebaseAdmin');
const { normalizeFeedback } = require('../lib/feedback');

const parseCsv = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean);
const ALLOWED_ORIGINS = Array.from(new Set([
  ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
  process.env.URL,
  process.env.DEPLOY_PRIME_URL,
  'http://localhost:3000',
  'http://localhost:8888',
].filter(Boolean)));

// ponytail: per-instance memory, so the limit resets on a cold start; move to
// Firestore or a KV store if feedback spam ever shows up.
const RECENT = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
function tooMany(key, now = Date.now()) {
  const hits = (RECENT.get(key) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  RECENT.set(key, hits);
  return hits.length > MAX_PER_WINDOW;
}

function getHeader(event, name) {
  const headers = (event && event.headers) || {};
  const match = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase());
  return match ? headers[match] : undefined;
}

const reply = (statusCode, headers, body) => ({ statusCode, headers, body: JSON.stringify(body) });

exports.handler = async (event) => {
  const origin = getHeader(event, 'origin');
  const allowed = origin ? (ALLOWED_ORIGINS.includes(origin) ? origin : null) : ALLOWED_ORIGINS[0];
  if (!allowed) return reply(403, { 'Content-Type': 'application/json' }, { error: 'Origin is not allowed' });
  const headers = {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return reply(405, headers, { error: 'Method not allowed' });
  if ((event.body || '').length > 20000) return reply(413, headers, { error: 'Feedback is too long' });

  const { app, error: adminError } = getAdminApp();
  if (!app) {
    console.error(`[feedback] firebase-admin unavailable: ${adminError}`);
    return reply(503, headers, { error: 'Feedback storage unavailable' });
  }

  let uid = null;
  const bearer = /^Bearer\s+(.+)$/i.exec(getHeader(event, 'authorization') || '');
  if (bearer) {
    try { uid = (await app.auth().verifyIdToken(bearer[1])).uid || null; } catch { uid = null; }
  }
  const ip = (getHeader(event, 'x-nf-client-connection-ip') || getHeader(event, 'x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (tooMany(uid || ip)) return reply(429, headers, { error: 'Too much feedback at once. Try again in a few minutes.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return reply(400, headers, { error: 'Invalid JSON body' }); }
  const { doc, error } = normalizeFeedback(body, uid);
  if (error) return reply(400, headers, { error });

  try {
    const { FieldValue } = app.__admin.firestore;
    const ref = await app.firestore().collection('feedback').add({ ...doc, createdAt: FieldValue.serverTimestamp() });
    return reply(200, headers, { id: ref.id });
  } catch (e) {
    console.error('[feedback] write failed', e);
    return reply(500, headers, { error: 'Could not save feedback' });
  }
};
