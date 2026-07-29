#!/usr/bin/env node
/**
 * Repair timestamps that were written as literal maps instead of real times.
 *
 * WHAT WENT WRONG
 * PracticeTests' `deepSanitize` recursed into every object, including Firestore's
 * serverTimestamp() FieldValue sentinel. Rebuilding that object turned the
 * sentinel into the plain map {_methodName: "serverTimestamp"}, which Firestore
 * stored verbatim. Affected writes:
 *   practiceTests.createdAt   (one doc per completed test)
 *   testProgress.lastSaved    (autosave, upserted every ~30s)
 * Consequences: orderBy() misorders (Firestore sorts maps AFTER timestamps),
 * date rendering breaks, and mastery's lastStudied is always null.
 * The write path is fixed; this repairs the documents already on disk.
 *
 * WHAT VALUE IT RESTORES
 * Not a guess — Firestore records real server-side create/update times as
 * document metadata, which the Admin SDK exposes as `snapshot.createTime` /
 * `snapshot.updateTime`. `createdAt` is restored from createTime, `lastSaved`
 * from updateTime.
 *
 * USAGE
 *   node scripts/backfill-fieldvalue-timestamps.mjs             # dry run (default)
 *   node scripts/backfill-fieldvalue-timestamps.mjs --apply     # actually write
 *   node scripts/backfill-fieldvalue-timestamps.mjs --apply --collection practiceTests
 *
 * CREDENTIALS (first match wins)
 *   FIREBASE_SERVICE_ACCOUNT  — the service-account JSON as a single string
 *   FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *   GOOGLE_APPLICATION_CREDENTIALS — path to a key file (or any ADC source)
 *
 * It is dry-run by default and prints every document it would touch. Nothing is
 * written unless you pass --apply.
 */

import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { createRequire } from 'node:module';

// Pull in .env so the project id (and optionally admin creds) can come from the
// same file the app already uses. Best-effort: missing dotenv is not fatal.
try {
  createRequire(import.meta.url)('dotenv').config();
} catch {
  /* dotenv not installed — env must then come from the shell */
}

const TARGETS = [
  // `createdAt` is set once when the test is submitted -> createTime is exact.
  { collection: 'practiceTests', field: 'createdAt', source: 'createTime' },
  // `lastSaved` is re-upserted on every autosave -> updateTime is the honest value.
  { collection: 'testProgress', field: 'lastSaved', source: 'updateTime' },
];

const BATCH_LIMIT = 400; // Firestore caps a batch at 500; leave headroom.

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const only = (() => {
  const i = args.indexOf('--collection');
  return i !== -1 ? args[i + 1] : null;
})();

/** The corrupted shape: a map carrying the sentinel's method name. */
function isBrokenSentinel(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Timestamp) &&
    typeof value._methodName === 'string'
  );
}

/** Project id from --project, then admin env, then the app's own REACT_APP var. */
function resolveProjectId() {
  const i = args.indexOf('--project');
  return (
    (i !== -1 ? args[i + 1] : null) ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    null
  );
}

const CREDENTIAL_HELP = `
No admin credentials found. This script writes to Firestore, so it needs a
service account — the web API key in .env is not sufficient.

Easiest (no gcloud required):
  1. Firebase Console -> Project settings -> Service accounts
  2. "Generate new private key" -> downloads a JSON file
  3. Run it with that key:

     GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json \\
       node scripts/backfill-fieldvalue-timestamps.mjs

Alternative, if you have gcloud:
     gcloud auth application-default login
     node scripts/backfill-fieldvalue-timestamps.mjs --project <project-id>

Treat that key file as a secret: it bypasses all security rules. Keep it out of
the repo and delete it when the backfill is done.`;

function initAdmin() {
  if (getApps().length) return;
  const projectId = resolveProjectId();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    initializeApp({ credential: cert(JSON.parse(raw)), projectId });
    return;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      // Netlify-style env vars store the key with literal \n sequences.
      credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
      projectId,
    });
    return;
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(CREDENTIAL_HELP);
    process.exit(1);
  }

  // GOOGLE_APPLICATION_CREDENTIALS / gcloud ADC. Pass projectId explicitly:
  // ADC often cannot infer it, which is the "Unable to detect a Project Id" error.
  initializeApp({ credential: applicationDefault(), projectId });
}

async function repair(db, { collection, field, source }) {
  process.stdout.write(`\n── ${collection}.${field}  (restoring from ${source})\n`);

  const snap = await db.collection(collection).get();
  const broken = snap.docs.filter((d) => isBrokenSentinel(d.get(field)));

  console.log(`   scanned ${snap.size} doc(s), ${broken.length} corrupted`);
  if (!broken.length) return { scanned: snap.size, fixed: 0 };

  let written = 0;
  for (let i = 0; i < broken.length; i += BATCH_LIMIT) {
    const slice = broken.slice(i, i + BATCH_LIMIT);
    const batch = db.batch();

    for (const doc of slice) {
      const restored = source === 'createTime' ? doc.createTime : doc.updateTime;
      if (!restored) {
        console.log(`   ! ${doc.id} — no ${source} metadata, skipping`);
        continue;
      }
      console.log(`   ${APPLY ? 'fix ' : 'would fix '}${doc.id} -> ${restored.toDate().toISOString()}`);
      if (APPLY) batch.update(doc.ref, { [field]: restored });
      written += 1;
    }

    if (APPLY && written) await batch.commit();
  }

  return { scanned: snap.size, fixed: written };
}

async function main() {
  initAdmin();
  const db = getFirestore();

  const targets = only ? TARGETS.filter((t) => t.collection === only) : TARGETS;
  if (!targets.length) {
    console.error(`No target matches --collection ${only}. Known: ${TARGETS.map((t) => t.collection).join(', ')}`);
    process.exit(1);
  }

  console.log(APPLY ? '⚠️  APPLY MODE — documents will be written.' : 'Dry run — nothing will be written. Pass --apply to commit.');

  const totals = { scanned: 0, fixed: 0 };
  for (const target of targets) {
    const r = await repair(db, target);
    totals.scanned += r.scanned;
    totals.fixed += r.fixed;
  }

  console.log(
    `\n${APPLY ? 'Repaired' : 'Would repair'} ${totals.fixed} of ${totals.scanned} scanned document(s).`
  );
  if (!APPLY && totals.fixed) console.log('Re-run with --apply to commit these changes.');
}

main().catch((e) => {
  console.error('\nBackfill failed:', e.message);
  process.exit(1);
});
