/**
 * Seed the shared MCQ bank.
 *
 * Diagnostics generated 15 questions per student per attempt for content that
 * is identical for everyone — the largest single drain on the free-tier Gemini
 * quota. This generates each question once and writes it to Firestore, where
 * src/services/questionBank.js serves it for two document reads.
 *
 * Admin-only by design: the bank is world-readable and shared, so a client that
 * could write to it could put a wrong answer key in front of every student. No
 * shape rule can validate that an answer is *correct*, so writes are gated on
 * service-account credentials rather than on Firestore rules.
 *
 * Usage (from ap-prep-hub/):
 *   node scripts/seed-question-bank.mjs --dry-run
 *   node scripts/seed-question-bank.mjs --subject "AP Biology" --bundles 10
 *   node scripts/seed-question-bank.mjs                     # every subject
 *
 * Env is read from ap-prep-hub/.env automatically:
 *   FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 *     (or a single FIREBASE_SERVICE_ACCOUNT JSON blob)
 *   GEMINI_API_KEYS  comma-separated; all of them are rotated through, because
 *                    one key's free-tier RPM would otherwise pace the whole run.
 *
 * Resumable: bundles that already exist are skipped unless --force. A run that
 * dies halfway costs nothing to repeat.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const GENERATE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
/**
 * Free-tier RPM is the binding constraint, not RPD (Gemma allows 14,400/day but
 * only 30/min). With keys rotating, the pause between calls can be short.
 */
const DELAY_MS = 1500;

/**
 * Seeding uses a gemini-* chain with a response schema, NOT the app's `bulk`
 * chain. Gemma is cheaper per call and has a far deeper daily pool, but it
 * ignores responseSchema and, asked for JSON in plain prose, spends its whole
 * output budget restating the task as a plan ("* Goal: 20 exam-realistic
 * MCQs. * Distribution: ...") and never emits an array. Prefilling the reply
 * with "[" forces the shape but sends it into degenerate repetition.
 *
 * flash-lite honours the schema and parses first try. Seeding is a batch job
 * run a handful of times a year — 180 calls against a 500/day pool is nothing,
 * and a model that fails half the time is the more expensive option. The app's
 * runtime chains are untouched by this.
 */
const SEED_CHAIN = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

/** Shape the model must return. Enforced by the API, not by asking nicely. */
const QUESTION_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      question: { type: 'STRING' },
      choices: { type: 'ARRAY', items: { type: 'STRING' } },
      correctAnswer: { type: 'INTEGER' },
      explanations: { type: 'ARRAY', items: { type: 'STRING' } },
      concept: { type: 'STRING' },
    },
    required: ['question', 'choices', 'correctAnswer', 'explanations', 'concept'],
  },
};

/** All configured keys, in the same order the app's APIKeyManager uses them. */
function geminiKeys() {
  const list = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length) return list;
  // Fall back to the client-side names so a .env with only those still works.
  return ['', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_10', '_11']
    .map((n) => process.env[`REACT_APP_GEMINI_API_KEY${n}`])
    .filter(Boolean);
}

/** Same data:-URL trick prerender.mjs uses — src/ is ESM in a CommonJS package. */
async function loadEsm(rel) {
  const src = await readFile(path.join(ROOT, rel), 'utf8');
  if (/^\s*import\s/m.test(src)) {
    throw new Error(`${rel} has imports; data: URL loading cannot resolve them`);
  }
  return import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
}

function parseArgs(argv) {
  const out = { bundles: 5, force: false, dryRun: false, subject: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') out.force = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--subject') out.subject = argv[++i];
    else if (a === '--bundles') out.bundles = Number(argv[++i]);
  }
  if (!Number.isInteger(out.bundles) || out.bundles < 1) {
    throw new Error('--bundles must be a positive integer');
  }
  return out;
}

function promptFor(subject, size, avoid) {
  const avoidBlock = avoid.length
    ? `\nDo not repeat any of these already-written questions:\n${avoid.map((s) => `- ${s}`).join('\n')}\n`
    : '';
  // The schema enforces the shape, so this only has to describe the content.
  return `Generate ${size} exam-realistic multiple-choice questions for ${subject}.

Spread them across the major units of the College Board course, roughly in
proportion to each unit's exam weighting. Match the difficulty and phrasing of
a real AP exam: no trivia, no "which of the following is NOT" filler.
${avoidBlock}
Give each question exactly 4 choices and 4 explanations, in the same order, so
explanations[i] says why choices[i] is right or wrong. correctAnswer is the
0-based index of the correct choice. "concept" is the specific idea tested, so
results can be grouped by it.`;
}

/**
 * Walk the seeding chain, rotating keys within each model.
 *
 * Two failures are the KEY's fault, not the model's, and must advance the key
 * rather than give up on the model:
 *   429 — this key is out of quota for now.
 *   403 "Requests from referer <empty> are blocked" — the key is restricted to
 *        an HTTP referrer, which is correct hardening for a browser key and
 *        makes it permanently unusable from a server script. Those get parked
 *        for the rest of the run instead of being retried on every bundle.
 * Anything else is the model's problem and moves down the chain.
 *
 * `cursor` and `blocked` are shared across calls so the run keeps spreading
 * load and never re-tries a key it has already proven cannot work here.
 */
async function generate(keys, chain, prompt, state) {
  const { cursor, blocked } = state;
  let lastError;

  for (const model of chain) {
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const idx = cursor.i % keys.length;
      cursor.i++;
      if (blocked.has(idx)) continue;

      try {
        const res = await fetch(`${GENERATE_URL}/${model}:generateContent?key=${keys[idx]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 16384,
              responseMimeType: 'application/json',
              responseSchema: QUESTION_SCHEMA,
            },
          }),
        });

        if (res.status === 429) {
          lastError = new Error(`${model}: key ${idx + 1} rate limited`);
          continue;
        }
        if (res.status === 403) {
          // Park it for the whole run. A 403 on an API key is a configuration
          // fact, not a transient failure — retrying it on every bundle just
          // burns a round trip per bundle for the rest of the run.
          const detail = await res.text();
          blocked.add(idx);
          const why = /referer/i.test(detail)
            ? 'restricted to an HTTP referrer'
            : /API_KEY_SERVICE_BLOCKED/.test(detail)
              ? 'not permitted to call the Generative Language API'
              : 'forbidden';
          console.log(`  note   key ${idx + 1} ${why}; skipping it for this run`);
          lastError = new Error(`${model}: key ${idx + 1} forbidden`);
          continue;
        }
        if (!res.ok) {
          lastError = new Error(`${model}: HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
          break;
        }

        const body = await res.json();
        const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
        if (!text) {
          lastError = new Error(`${model}: empty response (${body?.candidates?.[0]?.finishReason})`);
          break;
        }
        return { text, model, key: idx + 1 };
      } catch (err) {
        lastError = err;
      }
    }
  }

  if (blocked.size === keys.length) {
    throw new Error(
      'every key was rejected with 403. Server-side seeding needs a key with no ' +
        'HTTP-referrer restriction and the Generative Language API allowed.'
    );
  }
  throw lastError || new Error('no model produced a response');
}

function loadCredentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) return JSON.parse(raw);
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      'Missing credentials. Set FIREBASE_SERVICE_ACCOUNT, or all of ' +
        'FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.'
    );
  }
  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    // Env UIs store the PEM with escaped newlines; OpenSSL needs real ones.
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
}

async function main() {
  // Node reads .env only when asked. Without this the script fails with
  // "GEMINI_API_KEY is not set" while the key is sitting right there.
  try {
    process.loadEnvFile(path.join(ROOT, '.env'));
  } catch {
    // No .env — real environment variables are expected instead.
  }

  const args = parseArgs(process.argv.slice(2));

  const bank = await loadEsm('src/services/questionBank.js');
  const subjectsSrc = await readFile(path.join(ROOT, 'src/constants/subjects.js'), 'utf8');
  const subjectNames = [...subjectsSrc.matchAll(/^\s{4}"([^"]+)":\s*\{/gm)].map((m) => m[1]);

  const subjects = args.subject ? [args.subject] : subjectNames;
  if (args.subject && !subjectNames.includes(args.subject)) {
    throw new Error(`Unknown subject "${args.subject}". Known: ${subjectNames.join(', ')}`);
  }

  const keys = geminiKeys();
  if (!keys.length && !args.dryRun) {
    throw new Error('No Gemini keys. Set GEMINI_API_KEYS (comma-separated) in .env.');
  }
  const state = { cursor: { i: 0 }, blocked: new Set() };

  console.log(
    `${args.dryRun ? '[dry run] ' : ''}${subjects.length} subject(s) x ${args.bundles} bundle(s) ` +
      `x ${bank.BUNDLE_SIZE} questions = up to ${subjects.length * args.bundles} model calls` +
      (keys.length ? ` across ${keys.length} key(s)` : '')
  );
  if (args.dryRun) {
    subjects.forEach((s) =>
      console.log(`  ${s} -> ${bank.bundleId(s, bank.GENERAL_UNIT, 0)} .. ${args.bundles - 1}`)
    );
    return;
  }

  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(loadCredentials()) });
  }
  const db = admin.firestore();

  let written = 0;
  let skipped = 0;
  const failures = [];

  for (const subject of subjects) {
    // Seen stems are collected across the whole subject so bundle 4 doesn't
    // re-ask bundle 1's questions — the reader dedupes, but a duplicate stored
    // question is a wasted model call and a thinner effective bank.
    const seen = new Set();
    const present = new Set();

    for (let i = 0; i < args.bundles; i++) {
      const id = bank.bundleId(subject, bank.GENERAL_UNIT, i);
      const ref = db.collection('questionBank').doc(id);

      const snap = args.force ? null : await ref.get();
      if (snap && snap.exists) {
        (snap.data()?.questions || []).forEach((q) =>
          seen.add(String(q.question).trim().toLowerCase())
        );
        present.add(i);
        skipped++;
        console.log(`  skip   ${id} (exists)`);
        continue;
      }

      try {
        const prompt = promptFor(subject, bank.BUNDLE_SIZE, [...seen].slice(-25));
        const { text, model } = await generate(keys, SEED_CHAIN, prompt, state);
        const parsed = bank.extractQuestionArray(text);
        if (!Array.isArray(parsed)) {
          // Include what actually came back. "not a JSON array" on its own says
          // nothing about whether the model refused, truncated, or wrapped it.
          const snippet = text.replace(/\s+/g, ' ').slice(0, 180);
          throw new Error(`response was not a JSON array — got: ${snippet}`);
        }

        // Count the two rejection reasons separately. "0/20 usable" on its own
        // doesn't say whether the model returned malformed questions or simply
        // repeated ones it had already written, and the fixes are different.
        const wellFormed = parsed.filter(bank.isUsableQuestion);
        const malformed = parsed.length - wellFormed.length;
        const questions = wellFormed.filter((q) => {
          const key = String(q.question).trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const duplicates = wellFormed.length - questions.length;

        // A near-empty bundle is worse than none: it pads the index's bundle
        // count, so the reader picks it and gets nothing back.
        if (questions.length < bank.BUNDLE_SIZE / 2) {
          throw new Error(
            `only ${questions.length}/${parsed.length} usable ` +
              `(${malformed} malformed, ${duplicates} already written)`
          );
        }

        await ref.set({
          subject,
          unit: bank.GENERAL_UNIT,
          questions,
          model,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        present.add(i);
        written++;
        console.log(`  write  ${id} (${questions.length} questions, ${model})`);
      } catch (err) {
        failures.push(`${id}: ${err.message}`);
        console.warn(`  FAIL   ${id}: ${err.message}`);
      }

      await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    // Count only the unbroken run from 0. The reader picks a random index below
    // the count, so claiming 5 when bundle 2 failed sends a share of diagnostics
    // to a document that isn't there.
    let stored = 0;
    while (present.has(stored)) stored++;

    if (stored > 0) {
      // Written last, and only counting bundles that exist. The index is what
      // the reader trusts; if it claims bundle 4 and bundle 4 failed, every
      // diagnostic that picks it silently falls back to a live AI call.
      await db
        .collection('questionBankIndex')
        .doc(bank.indexId(subject))
        .set(
          {
            subject,
            units: { [bank.GENERAL_UNIT]: stored },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      console.log(`  index  ${bank.indexId(subject)} -> ${stored} bundle(s)`);
    }
  }

  console.log(`\ndone: ${written} written, ${skipped} skipped, ${failures.length} failed`);
  failures.forEach((f) => console.log(`  ${f}`));
  if (written === 0 && failures.length) process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
