/**
 * Admin-only, app-wide statistics.
 *
 * This has to be server-side. The Firestore rules deliberately scope every
 * collection to its owner, so no client — admin or not — can count documents
 * belonging to other users. Loosening those rules to allow an admin client read
 * would mean shipping a rule that grants one uid access to every student's data,
 * enforced only by a uid list in a public bundle. A function with the service
 * account keeps that boundary server-side where it belongs.
 *
 * Cost: uses Firestore `count()` aggregations, billed at roughly one document
 * read per 1000 counted, so the whole dashboard is a handful of reads rather
 * than a full collection scan.
 */

const ADMIN_UIDS = ['b0eUycwZDHcmrkoeSEiD69QSbK32', 'A0yRGP86ZTahByzS0ALYeKAXOn52'];
const { getAdminApp } = require('../lib/firebaseAdmin');


const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] || '');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };
}


async function verifyAdminUid(event, app) {
  const h = event.headers || {};
  const authHeaderVal = h.authorization || h.Authorization || '';
  const m = authHeaderVal.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try {
    const decoded = await app.auth().verifyIdToken(m[1]);
    const uid = decoded.uid || null;
    return uid && ADMIN_UIDS.includes(uid) ? uid : null;
  } catch {
    return null;
  }
}

/** count() aggregation, returning null (not 0) when the collection is unreadable. */
async function countOf(db, path) {
  try {
    const snap = await db.collection(path).count().get();
    return snap.data().count;
  } catch (err) {
    console.warn(`[admin-stats] count failed for ${path}:`, err.message);
    return null;
  }
}

/** Same, but across every subcollection with this id (e.g. every class roster). */
async function countGroup(db, id) {
  try {
    const snap = await db.collectionGroup(id).count().get();
    return snap.data().count;
  } catch (err) {
    console.warn(`[admin-stats] group count failed for ${id}:`, err.message);
    return null;
  }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = cors(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Surfaces the ACTUAL reason (missing var vs unparseable key vs bundle
  // problem) instead of one catch-all message that sent debugging the wrong way.
  const { app, error: adminError } = getAdminApp();
  if (!app) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: adminError }) };
  }

  const uid = await verifyAdminUid(event, app);
  if (!uid) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin only.' }) };
  }

  const db = app.firestore();

  try {
    const [
      users,
      practiceTests,
      classes,
      classMembers,
      conversations,
      flashcardDecks,
      diagnosticResults,
      solverHistory,
      reviews,
      testProgress,
      studySessions,
    ] = await Promise.all([
      countOf(db, 'users'),
      countOf(db, 'practiceTests'),
      countOf(db, 'classes'),
      countGroup(db, 'members'),
      countOf(db, 'conversations'),
      countOf(db, 'flashcardDecks'),
      countOf(db, 'diagnosticResults'),
      countOf(db, 'solverHistory'),
      countOf(db, 'reviews'),
      countOf(db, 'testProgress'),
      countOf(db, 'studySessions'),
    ]);

    // Auth accounts and Firestore user docs can legitimately differ (a signup
    // that never wrote a profile), so report both rather than one "accounts".
    let authAccounts = null;
    let activeLast30Days = null;
    try {
      const admin = app.__admin;
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      let total = 0;
      let active = 0;
      let pageToken;
      // Capped: 10 pages x 1000. Past that the number is reported as a floor.
      for (let page = 0; page < 10; page++) {
        // eslint-disable-next-line no-await-in-loop
        const res = await admin.auth().listUsers(1000, pageToken);
        total += res.users.length;
        for (const u of res.users) {
          const last = u.metadata && u.metadata.lastSignInTime;
          if (last && new Date(last).getTime() >= cutoff) active += 1;
        }
        pageToken = res.pageToken;
        if (!pageToken) break;
      }
      authAccounts = total;
      activeLast30Days = active;
    } catch (err) {
      console.warn('[admin-stats] listUsers failed:', err.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        accounts: { auth: authAccounts, userDocs: users, activeLast30Days },
        practice: { testsTaken: practiceTests, testsInProgress: testProgress },
        classes: { total: classes, memberships: classMembers },
        content: { conversations, flashcardDecks, diagnosticResults, solverHistory, studySessions },
        feedback: { reviews },
      }),
    };
  } catch (err) {
    console.error('[admin-stats] failed:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to gather stats.' }) };
  }
};
