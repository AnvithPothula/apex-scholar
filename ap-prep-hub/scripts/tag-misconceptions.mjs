/**
 * Tag every distractor in the question bank with a misconception.
 *
 *   node scripts/tag-misconceptions.mjs --input docs/research/sample.jsonl --limit 60
 *   node scripts/tag-misconceptions.mjs --firestore --limit 100      # dry, writes JSONL
 *   node scripts/tag-misconceptions.mjs --firestore --apply          # writes tags back
 *
 * Why this exists: a wrong answer currently says only "wrong". With each
 * distractor mapped to a misconception, it says WHICH error the student made —
 * roughly four times the information per response, which is what makes a
 * 92-user bank diagnosable at all (Round 62).
 *
 * The model reads the ITEM, not the stored explanation. 16.7% of distractor
 * explanations are boilerplate under 35 characters, and Round 60 found some are
 * attached to the wrong choice — tagging from them would inherit both problems.
 *
 * Scored, not trusted: `--input` mode compares every model tag against
 * `ruleTags()`, an independent regex read of the stored explanation. Agreement
 * where the rule is confident is a precision estimate that costs no labelling.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = {};
for (let i = 2; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const [k, v] = a.slice(2).split('=');
  if (v !== undefined) args[k] = v;
  else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[k] = argv[++i];
  else args[k] = true;
}

try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* real env expected */ }

const loadEsm = async (rel) =>
  import(`data:text/javascript;base64,${Buffer.from(await readFile(path.join(ROOT, rel), 'utf8')).toString('base64')}`);
const { TAGS, MISCONCEPTIONS, isTag, ruleTags } = await loadEsm('src/constants/misconceptions.js');
// Reuse the router's parser rather than writing a third copy: Google sends the
// wait in the response BODY as a RetryInfo `retryDelay: "26s"`, not in a header
// (Round 53). It is already tested over there.
const { retryDelaySeconds } = await loadEsm('cloudflare/ai-router/src/index.js');

const GENERATE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Same chain the seeder uses. Gemma leads the `bulk` chain in the app, but
// Round 53 measured it at 2/3 on JSON and it ignores responseSchema on the free
// tier — unusable for a task whose entire output is a constrained label set.
const CHAIN = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      choiceIndex: { type: 'INTEGER' },
      tag: { type: 'STRING', enum: TAGS },
      concept: { type: 'STRING' },
    },
    required: ['choiceIndex', 'tag', 'concept'],
  },
};

const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
if (!keys.length) { console.error('No GEMINI_API_KEYS in .env.'); exit(1); }

// Minimal copy of the seeder's rotation. Deliberately duplicated rather than
// refactoring scripts/seed-question-bank.mjs, which is working production
// tooling and not worth destabilising for forty lines.
// Rotation with per-key cooldowns. The first version walked every key once and
// gave up, so a transient 429 or 503 killed the item outright — 28 failures in
// the first 120 of a full-bank run, none of them permanent conditions. Keys are
// now parked until the moment Google says they are free again, and the walk
// waits rather than burning through the chain.
const state = { i: 0, coolUntil: new Map(), blocked: new Set() };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TRANSIENT = new Set([429, 500, 502, 503, 504]);

async function callModel(prompt) {
  let lastErr = 'no attempt';
  // Each pass tries every live key on every model. Between passes, wait for the
  // soonest key to come back rather than declaring failure.
  // Six passes, not four: under sustained throttling four still gave up on
  // ~10% of items. Costs nothing when the keys are healthy — a pass only waits
  // when every key is cooling, and then only until the soonest one frees.
  for (let pass = 0; pass < 6; pass++) {
    for (const model of CHAIN) {
      for (let a = 0; a < keys.length; a++) {
        const idx = state.i++ % keys.length;
        if (state.blocked.has(idx)) continue;
        if ((state.coolUntil.get(idx) || 0) > Date.now()) continue;
        try {
          const res = await fetch(`${GENERATE_URL}/${model}:generateContent?key=${keys[idx]}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0, maxOutputTokens: 2048,
                responseMimeType: 'application/json', responseSchema: SCHEMA,
              },
            }),
          });
          // 403 is a key restriction, not a blip — park it for the whole run.
          if (res.status === 403) { state.blocked.add(idx); lastErr = '403'; continue; }
          if (TRANSIENT.has(res.status)) {
            const secs = retryDelaySeconds(res.headers.get('retry-after'), await res.text()) || 20;
            state.coolUntil.set(idx, Date.now() + secs * 1000);
            lastErr = `HTTP ${res.status} (cooling key ${idx + 1} for ${secs}s)`;
            continue;
          }
          if (!res.ok) { lastErr = `${model}: HTTP ${res.status}`; continue; }
          const body = await res.json();
          const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) { lastErr = `empty candidate (${body?.candidates?.[0]?.finishReason || 'no reason'})`; continue; }
          return JSON.parse(text);
        } catch (e) { lastErr = e.message; }
      }
    }
    // Everything is cooling or failing. Wait for the earliest key to free up.
    const soonest = Math.min(...[...state.coolUntil.values()].filter((t) => t > Date.now()), Infinity);
    if (!Number.isFinite(soonest)) break;                  // nothing cooling -> real failure
    const waitMs = Math.min(Math.max(soonest - Date.now(), 1000), 70000);
    process.stdout.write(`\r  waiting ${Math.ceil(waitMs / 1000)}s for a key…            `);
    await sleep(waitMs);
  }
  throw new Error(lastErr);
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
function buildPrompt(item) {
  const key = item.stored_answer ?? item.correctAnswer;
  const opts = item.choices.map((c, i) => `${LETTERS[i]}) ${c}${i === key ? '   <-- CORRECT' : ''}`).join('\n');
  const vocab = TAGS.map((t) => `- ${t}: ${MISCONCEPTIONS[t]}`).join('\n');
  return `You are analysing one multiple-choice question from an ${item.subject || 'AP'} exam bank.

For EACH INCORRECT option, identify the single misconception a student would hold that makes that option look right to them. Do not analyse the correct option.

Question: ${item.question}

Options:
${opts}

Choose exactly one tag per incorrect option from this closed list:
${vocab}

Rules:
- Reason from the option itself, not from any explanation.
- If an option is not a plausible student error but merely filler, tag it not_a_misconception. Do not invent a misconception to avoid this tag.
- "concept" is at most 8 words naming the specific idea confused, e.g. "chain rule on composite functions".
- Return one entry per INCORRECT option only.`;
}

// Repo-relative, like .env and src/. A bare `docs/research/sample.jsonl`
// otherwise resolved against whatever directory the shell happened to be in.
const atRoot = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));

async function fromJsonl(p) {
  return (await readFile(atRoot(p), 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
async function fromFirestore() {
  const { getAdminApp } = await import(path.join(ROOT, 'netlify/lib/firebaseAdmin.js'));
  const { app, error } = getAdminApp();
  if (!app) { console.error(`Cannot read the bank: ${error}`); exit(1); }
  const snap = await app.firestore().collection('questionBank').get();
  const out = [];
  snap.forEach((d) => (d.data().questions || []).forEach((q, i) =>
    out.push({ ...q, id: `${d.id}#${i}`, source_bundle: d.id, bundleIndex: i, subject: String(d.id).split('__')[0] })));
  return out;
}

let items = args.firestore ? await fromFirestore() : await fromJsonl(args.input || 'docs/research/sample.jsonl');

// Resume, like the seeder. A run over 3,560 items will be interrupted at some
// point; without this, restarting re-tags everything already done and pays for
// it twice. --force re-tags regardless.
if (args.firestore && !args.force) {
  const { getAdminApp } = await import(path.join(ROOT, 'netlify/lib/firebaseAdmin.js'));
  const done = new Map();
  (await getAdminApp().app.firestore().collection('questionBankTags').get())
    .forEach((d) => done.set(d.id, new Set(Object.keys(d.data().items || {}))));
  const before = items.length;
  items = items.filter((i) => !done.get(i.source_bundle)?.has(String(i.bundleIndex)));
  if (before !== items.length) console.log(`resuming: ${before - items.length} already tagged, ${items.length} to go`);
}

if (args.limit) items = items.slice(0, Number(args.limit));
if (!items.length) { console.log('nothing to tag.'); exit(0); }
console.log(`tagging ${items.length} items with ${keys.length} key(s)\n`);

// Writing only at the end made `--resume` useless: a run interrupted at item
// 3,000 persisted nothing and restarted from zero. Flush as we go.
let flushDb = null;
if (args.apply) {
  if (!args.firestore) { console.error('--apply needs --firestore (tags key off bundle ids).'); exit(1); }
  const { getAdminApp } = await import(path.join(ROOT, 'netlify/lib/firebaseAdmin.js'));
  const { app, error: adminErr } = getAdminApp();
  if (!app) { console.error(adminErr); exit(1); }
  flushDb = app.firestore();
}

let pending = new Map();   // bundleId -> { [itemIndex]: tags }
let applied = 0;

async function flush() {
  if (!flushDb || !pending.size) return;
  for (const [bundle, items_] of pending) {
    // merge:true deep-merges the `items` map, so repeated partial flushes
    // accumulate instead of overwriting earlier ones in the same bundle.
    await flushDb.collection('questionBankTags').doc(bundle).set(
      { items: items_, taggedAt: new Date(), model: CHAIN[0], taxonomyVersion: 1 },
      { merge: true }
    );
    applied += Object.keys(items_).length;
  }
  pending = new Map();
}

const results = [];
let failed = 0;
for (let n = 0; n < items.length; n++) {
  const item = items[n];
  try {
    const tags = (await callModel(buildPrompt(item))).filter((t) => isTag(t.tag));
    results.push({ id: item.id, subject: item.subject, tags });
  } catch (e) {
    failed++;
    results.push({ id: item.id, subject: item.subject, tags: [], error: e.message });
  }
  // Queue this item's tags for the next flush.
  const last = results[results.length - 1];
  if (flushDb && last?.tags?.length && item.source_bundle) {
    if (!pending.has(item.source_bundle)) pending.set(item.source_bundle, {});
    pending.get(item.source_bundle)[String(item.bundleIndex)] = last.tags.map((t) => ({
      choiceIndex: t.choiceIndex, tag: t.tag, concept: String(t.concept || '').slice(0, 80),
    }));
  }
  if ((n + 1) % 25 === 0) await flush();

  if ((n + 1) % 10 === 0 || n === items.length - 1) {
    process.stdout.write(`\r  ${n + 1}/${items.length} (${failed} failed, ${applied} saved)          `);
  }
  await sleep(120); // ~8/s ceiling across 11 keys; politeness, not correctness
}
console.log('\n');

// ---- Score against the rule tagger, where it is confident ----
const byId = new Map(items.map((i) => [i.id, i]));
let checked = 0, agreed = 0;
const confusion = new Map();
for (const r of results) {
  const item = byId.get(r.id);
  const key = item?.stored_answer ?? item?.correctAnswer;
  for (const t of r.tags) {
    const expl = item?.explanations?.[t.choiceIndex];
    const rt = ruleTags(expl);
    if (!rt.length || t.choiceIndex === key) continue;
    checked++;
    if (rt.includes(t.tag)) agreed++;
    else {
      const k = `${rt.join('|')} -> ${t.tag}`;
      confusion.set(k, (confusion.get(k) || 0) + 1);
    }
  }
}

const dist = new Map();
for (const r of results) for (const t of r.tags) dist.set(t.tag, (dist.get(t.tag) || 0) + 1);
const total = [...dist.values()].reduce((a, b) => a + b, 0);
console.log('tag distribution:');
for (const [t, c] of [...dist.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(24)} ${String(c).padStart(4)}  ${(100 * c / total).toFixed(1)}%`);
}
console.log(`\ntagged ${total} distractors across ${results.length} items (${failed} items failed)`);
if (failed) {
  // Failures are transient throttling and were never written, so the resume
  // filter will pick up exactly these on the next run. Saying so beats leaving
  // someone to wonder whether a second run would duplicate work.
  console.log(`re-run the same command to retry just those ${failed} — resume skips everything already saved.`);
}
if (checked) {
  console.log(`agreement with the rule tagger: ${agreed}/${checked} = ${(100 * agreed / checked).toFixed(1)}%`);
  console.log('(rules fire on ~13% of distractors; this is a precision probe, not a full score)');
  if (confusion.size) {
    console.log('\ntop disagreements (rule -> model):');
    for (const [k, c] of [...confusion.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${String(c).padStart(3)}  ${k}`);
  }
} else {
  console.log('no rule-confident distractors in this slice — cannot score.');
}

// `a || b + c` binds as `a || (b + c)`, so the original one-liner gave the
// suffix to the fallback only and --out produced an extensionless file.
const outBase = args.out
  || (args.firestore ? 'docs/research/bank' : String(args.input || 'docs/research/sample').replace(/\.jsonl$/, ''));
const out = `${outBase}.tags.jsonl`;
// Anchored to the repo root, not the shell's cwd: the script already resolves
// .env and src/ that way, and a relative output path meant running it from
// another directory silently scattered the JSONL somewhere else.
const outPath = atRoot(out);
await writeFile(outPath, results.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
console.log(`\nwrote ${outPath}`);

// Final flush of whatever the last partial batch left.
if (args.apply) {
  await flush();
  console.log(`applied tags for ${applied} items to questionBankTags`);
}

