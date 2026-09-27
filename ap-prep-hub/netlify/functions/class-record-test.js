/**
 * Credit one saved practice test to the student's class leaderboards.
 *
 * POST { testId }  with  Authorization: Bearer <Firebase ID token>
 *
 * Leaderboard rows used to be incremented by the browser, so one console line
 * could set anyone's own row to 1,000,000 correct. firestore.rules now refuses
 * client writes to the score fields, and this function is the only writer:
 *   - the caller must own the test (verified ID token vs the doc's userId)
 *   - the test is re-scored here (netlify/lib/classScore.js), not taken on trust
 *   - each test is credited once, ever (leaderboardCredits/{testId}, which no
 *     client can read or write — it falls through to the deny-all rule)
 *   - only tests saved in the last CREDIT_WINDOW_MS count, so the history that
 *     was already credited before this function existed cannot be replayed
 *   - only classes the student had joined before taking the test, matching the
 *     "since joining" promise on the leaderboard
 * See classScore.js for what is still possible (forging an entire test doc).
 */

const { getAdminApp } = require('../lib/firebaseAdmin');
const { scoreSavedTest } = require('../lib/classScore');

const CREDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const TEST_ID = /^[A-Za-z0-9_-]{1,128}$/;

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(
  new Set([
    ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    'http://localhost:3000',
    'http://localhost:8888',
  ].filter(Boolean))
);

function getHeader(event, name) {
  const headers = (event && event.headers) || {};
  const target = name.toLowerCase();
  const match = Object.keys(headers).find((key) => key.toLowerCase() === target);
  return match ? headers[match] : undefined;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

const reply = (statusCode, headers, body) => ({ statusCode, headers, body: JSON.stringify(body) });

/** Firestore Timestamp | Date | number -> epoch ms, or null. */
function toMillis(v) {
  if (!v) return null;
  if (typeof v === 'number') return v;
  if (typeof v.toMillis === 'function') return v.toMillis();
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

exports.handler = async (event) => {
  const origin = getHeader(event, 'origin');
  const allowed = origin ? (ALLOWED_ORIGINS.includes(origin) ? origin : null) : ALLOWED_ORIGINS[0];
  if (!allowed) return reply(403, { 'Content-Type': 'application/json' }, { error: 'Origin is not allowed' });
  const headers = corsHeaders(allowed);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return reply(405, headers, { error: 'Method not allowed' });

  const { app, error: adminError } = getAdminApp();
  if (!app) {
    console.error(`[class-record-test] firebase-admin unavailable: ${adminError}`);
    return reply(503, headers, { error: 'Leaderboard service unavailable' });
  }

  const bearer = /^Bearer\s+(.+)$/i.exec(getHeader(event, 'authorization') || '');
  let uid = null;
  if (bearer) {
    try {
      uid = (await app.auth().verifyIdToken(bearer[1])).uid || null;
    } catch {
      uid = null;
    }
  }
  if (!uid) return reply(401, headers, { error: 'Sign in required' });

  let testId;
  try {
    testId = JSON.parse(event.body || '{}').testId;
  } catch {
    return reply(400, headers, { error: 'Invalid JSON body' });
  }
  if (typeof testId !== 'string' || !TEST_ID.test(testId)) {
    return reply(400, headers, { error: '"testId" is required' });
  }

  const db = app.firestore();
  const { FieldValue } = app.__admin.firestore;

  try {
    const testSnap = await db.doc(`practiceTests/${testId}`).get();
    // Someone else's test and a missing one look the same from outside.
    if (!testSnap.exists || testSnap.get('userId') !== uid) {
      return reply(404, headers, { error: 'Test not found' });
    }
    const test = testSnap.data();

    const testAt = toMillis(test.createdAt);
    if (!testAt || Date.now() - testAt > CREDIT_WINDOW_MS) {
      return reply(409, headers, { error: 'Only a just-finished test can be credited' });
    }

    const score = scoreSavedTest(test);
    if (!score) return reply(422, headers, { error: 'Not a scoreable test' });
    if (score.answered === 0) return reply(200, headers, { classes: 0, ...score });

    const pointers = await db.collection(`users/${uid}/classes`).get();
    const classIds = pointers.docs.map((d) => d.id);

    const outcome = await db.runTransaction(async (tx) => {
      const creditRef = db.doc(`leaderboardCredits/${testId}`);
      const classRefs = classIds.map((id) => db.doc(`classes/${id}`));
      const memberRefs = classIds.map((id) => db.doc(`classes/${id}/members/${uid}`));
      const [credit, ...snaps] = await tx.getAll(creditRef, ...classRefs, ...memberRefs);
      if (credit.exists) return { already: true };

      const classSnaps = snaps.slice(0, classIds.length);
      const memberSnaps = snaps.slice(classIds.length);
      const credited = [];
      classIds.forEach((id, i) => {
        const klass = classSnaps[i];
        const member = memberSnaps[i];
        if (!klass.exists || !member.exists) return;
        // Classes scoped to specific subjects only count matching tests.
        const subjects = klass.get('subjects');
        const scope = Array.isArray(subjects) ? subjects.filter(Boolean) : [];
        if (scope.length && !scope.includes(test.subject)) return;
        // "Accuracy across every practice test taken since joining."
        const joinedAt = toMillis(member.get('joinedAt'));
        if (joinedAt && joinedAt > testAt) return;
        credited.push(id);
        tx.update(memberRefs[i], {
          questionsAnswered: FieldValue.increment(score.answered),
          correctAnswers: FieldValue.increment(score.correct),
          testsTaken: FieldValue.increment(1),
          lastActive: FieldValue.serverTimestamp(),
        });
      });

      tx.create(creditRef, {
        userId: uid,
        answered: score.answered,
        correct: score.correct,
        classIds: credited,
        creditedAt: FieldValue.serverTimestamp(),
      });
      return { classes: credited.length };
    });

    if (outcome.already) return reply(409, headers, { error: 'Test already credited' });
    return reply(200, headers, { ...outcome, ...score });
  } catch (err) {
    console.error('[class-record-test] failed:', err.message);
    return reply(500, headers, { error: 'Could not update leaderboards' });
  }
};
