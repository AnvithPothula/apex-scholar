/**
 * Mark a student's multiple-choice answers on a class assignment.
 *
 * POST { classId, assignmentId }  with  Authorization: Bearer <Firebase ID token>
 *
 * The answer key lives in classes/{c}/assignments/{a}/private/key, which no
 * student can read, so marking happens here. The answers are read from the
 * student's own submission doc (written by the browser just before), not from
 * this request, so what the teacher sees is exactly what was marked. Each
 * submission is marked once: mcqScore can only be written by this function.
 * Returns the student's own keys and rubrics so the browser can show
 * explanations and AI-grade the written answers.
 */
const { getAdminApp } = require('../lib/firebaseAdmin');
const { pickItemIds } = require('../lib/assignmentPick');

const ID = /^[A-Za-z0-9_-]{1,128}$/;
const parseCsv = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean);
const ALLOWED_ORIGINS = Array.from(new Set([
  ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
  process.env.URL,
  process.env.DEPLOY_PRIME_URL,
  'http://localhost:3000',
  'http://localhost:8888',
].filter(Boolean)));

const reply = (statusCode, headers, body) => ({ statusCode, headers, body: JSON.stringify(body) });

/** Pure: score multiple-choice answers against a key. */
function markMcq(itemIds, items, key, answers) {
  const results = {};
  let score = 0;
  let max = 0;
  for (const id of itemIds) {
    const item = items.find((it) => it && it.id === id);
    if (!item || item.type !== 'mcq') continue;
    const k = key[id] || {};
    max += 1;
    const raw = answers ? answers[id] : undefined;
    const chosen = raw === undefined || raw === null || raw === '' ? null : Number(raw);
    const correct = chosen !== null && chosen === Number(k.correctIndex);
    if (correct) score += 1;
    results[id] = { chosen, correctIndex: Number(k.correctIndex), correct };
  }
  return { score, max, results };
}

exports.markMcq = markMcq;

exports.handler = async (event) => {
  const h = event.headers || {};
  const origin = h.origin || h.Origin;
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

  const { app, error: adminError } = getAdminApp();
  if (!app) {
    console.error(`[class-assignment-submit] firebase-admin unavailable: ${adminError}`);
    return reply(503, headers, { error: 'Assignments are unavailable right now' });
  }
  const bearer = /^Bearer\s+(.+)$/i.exec(h.authorization || h.Authorization || '');
  let uid = null;
  if (bearer) {
    try { uid = (await app.auth().verifyIdToken(bearer[1])).uid || null; } catch { uid = null; }
  }
  if (!uid) return reply(401, headers, { error: 'Sign in required' });

  let classId;
  let assignmentId;
  try {
    ({ classId, assignmentId } = JSON.parse(event.body || '{}'));
  } catch {
    return reply(400, headers, { error: 'Invalid JSON body' });
  }
  if (!ID.test(String(classId || '')) || !ID.test(String(assignmentId || ''))) {
    return reply(400, headers, { error: '"classId" and "assignmentId" are required' });
  }

  const db = app.firestore();
  const { FieldValue } = app.__admin.firestore;
  const base = `classes/${classId}/assignments/${assignmentId}`;
  try {
    const [member, assignment, keyDoc, sub] = await Promise.all([
      db.doc(`classes/${classId}/members/${uid}`).get(),
      db.doc(base).get(),
      db.doc(`${base}/private/key`).get(),
      db.doc(`${base}/submissions/${uid}`).get(),
    ]);
    if (!member.exists || !assignment.exists) return reply(404, headers, { error: 'Assignment not found' });
    if (!sub.exists) return reply(409, headers, { error: 'Save your answers first' });
    if (sub.get('mcqScore') !== undefined) return reply(409, headers, { error: 'Already submitted' });

    const a = assignment.data();
    const items = Array.isArray(a.items) ? a.items : [];
    const itemIds = pickItemIds(items.map((it) => it.id), a, uid, assignmentId);
    const key = (keyDoc.exists && keyDoc.get('items')) || {};
    const marked = markMcq(itemIds, items, key, sub.get('answers') || {});

    await db.doc(`${base}/submissions/${uid}`).update({
      mcqScore: marked.score,
      mcqMax: marked.max,
      mcqResults: marked.results,
      itemIds,
      status: 'submitted',
      submittedAt: FieldValue.serverTimestamp(),
    });
    const ownKeys = Object.fromEntries(itemIds.filter((id) => key[id]).map((id) => [id, key[id]]));
    return reply(200, headers, { mcqScore: marked.score, mcqMax: marked.max, mcqResults: marked.results, keys: ownKeys, itemIds });
  } catch (err) {
    console.error('[class-assignment-submit] failed:', err.message);
    return reply(500, headers, { error: "Couldn't submit. Try again." });
  }
};
