/**
 * Scheduled reminder email. Runs daily at 14:00 UTC (9:00 CT) via netlify.toml.
 *
 * Sends the weekly digest on Sundays, and a daily one only in the 7 days before
 * a student's own exam (netlify/lib/weeklyDigest.js decides which, if any).
 * Audience: everyone who hasn't opted out of everything or of this category
 * (netlify/lib/emailPrefs.js; set from the unsubscribe page or Settings).
 *
 * OFF until WEEKLY_EMAIL_ENABLED=true. Without it every run is a dry run that
 * only logs who would have been emailed, so deploying this sends nothing.
 *
 * Env: as email-broadcast.js, plus WEEKLY_EMAIL_ENABLED.
 */

const { getAdminApp } = require('../lib/firebaseAdmin');
const { buildDigest, examsFor, cadenceFor } = require('../lib/weeklyDigest');
const { wants } = require('../lib/emailPrefs');
const { sendBatch, unsubscribeToken } = require('./email-broadcast');

const CONCURRENCY = 10;
const ORIGIN = 'https://apex-scholar.com';

const todayKey = (now) => now.toISOString().slice(0, 10);

async function digestFor(db, uid, user, now, responses = []) {
  const [queueSnap, testsSnap] = await Promise.all([
    db.doc(`users/${uid}/progress/reviewQueue`).get(),
    db.collection('practiceTests').where('userId', '==', uid).get(),
  ]);
  const cards = queueSnap.exists ? queueSnap.data().cards || [] : [];
  const tests = testsSnap.docs.map((d) => {
    const t = d.data();
    return { subject: t.subject, results: t.results, createdAtMs: t.createdAt?.toMillis?.() || 0 };
  });
  return buildDigest({ user, cards, tests, responses, now });
}

exports.handler = async () => {
  const live = process.env.WEEKLY_EMAIL_ENABLED === 'true';
  const apiKey = process.env.SMTP2GO_API_KEY;
  const from = process.env.MAIL_FROM;
  if (live && (!apiKey || !from || !process.env.UNSUBSCRIBE_SECRET)) {
    console.error('[email-weekly] missing SMTP2GO_API_KEY, MAIL_FROM or UNSUBSCRIBE_SECRET');
    return { statusCode: 503 };
  }
  const { app, error } = getAdminApp();
  if (!app) {
    console.error('[email-weekly]', error);
    return { statusCode: 503 };
  }

  const db = app.firestore();
  const now = new Date();
  const today = todayKey(now);

  // Cheap filter first (user doc only): who is due an email today at all.
  const snap = await db.collection('users').get();
  const due = [];
  snap.forEach((d) => {
    const u = d.data() || {};
    if (typeof u.email !== 'string' || !u.email.includes('@')) return;
    if (u.lastDigestOn === today) return; // a retried run must not double-send
    // 'weekly' or 'examWeek', which are also the preference categories.
    const kind = cadenceFor(examsFor(u, now), now);
    if (kind && wants(u, kind)) due.push({ uid: d.id, user: u });
  });

  // The last two weeks of the response log, grouped by student, so the Sunday
  // digest can say what each one actually did. One range query for everyone
  // instead of one per student (a per-student query needs a composite index).
  // ponytail: reads every response from the last 14 days; at ~1000 weekly
  // users that's ~60k reads on Sundays. Store a weekly rollup per user if the
  // free tier's 50k/day starts to bite.
  const responsesByUser = new Map();
  if (due.some(({ user }) => cadenceFor(examsFor(user, now), now) === 'weekly')) {
    const since = new Date(now.getTime() - 14 * 86400000);
    const rs = await db.collection('responses').where('at', '>=', since)
      .select('userId', 'correct', 'subject', 'unit', 'at').get();
    rs.forEach((d) => {
      const r = d.data();
      if (!r.userId) return;
      const list = responsesByUser.get(r.userId) || [];
      list.push({ correct: r.correct === true, subject: r.subject, unit: r.unit, atMs: r.at?.toMillis?.() || 0 });
      responsesByUser.set(r.userId, list);
    });
  }

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < due.length; i += CONCURRENCY) {
    // eslint-disable-next-line no-await-in-loop, no-loop-func
    await Promise.all(due.slice(i, i + CONCURRENCY).map(async ({ uid, user }) => {
      try {
        const digest = await digestFor(db, uid, user, now, responsesByUser.get(uid));
        if (!digest) return;
        if (!live) return;
        const unsubUrl = `${ORIGIN}/.netlify/functions/email-unsubscribe?t=${unsubscribeToken(uid)}`;
        const res = await sendBatch(apiKey, from, [user.email], digest.subject, digest.body, unsubUrl);
        if (!res.ok) { failed += 1; console.error(`[email-weekly] send failed for ${uid}: ${res.error}`); return; }
        sent += 1;
        await db.doc(`users/${uid}`).set({ lastDigestOn: today }, { merge: true });
      } catch (err) {
        failed += 1;
        console.error(`[email-weekly] ${uid}:`, err.message);
      }
    }));
  }

  console.log(`[email-weekly] ${live ? 'LIVE' : 'DRY RUN'} date=${today} due=${due.length} sent=${sent} failed=${failed}`);
  return { statusCode: 200 };
};
