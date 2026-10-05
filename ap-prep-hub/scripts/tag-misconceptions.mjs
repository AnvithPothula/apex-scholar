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
// Paced key pool shared with the seeder: per-key RPM pacing, both flash-lite
// pools used evenly, daily quota tracked in scripts/.gemini-usage.json, and a
// 30% share of each daily limit left for the live app (GEMINI_SCRIPT_RESERVE).
const { createPool, BudgetExhaustedError } = await import('./lib/geminiPool.mjs');
const USAGE_FILE = path.join(ROOT, 'scripts', '.gemini-usage.json');
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

// Requests go through the shared pool. The loop here used to fire ~8 calls/s
// across 11 keys — about 43 requests/minute per key against a 15 RPM limit —
// and always led with gemini-3.1-flash-lite, which is what pushed that model
// past its per-minute and per-day caps while students were using the app.
const pool = createPool({
  keys,
  models: CHAIN,
  usageFile: USAGE_FILE,
  log: (msg) => process.stdout.write(`\r  ${msg}            `),
});
let lastModel = CHAIN[0];

async function callModel(prompt) {
  const { json, model } = await pool.call({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0, maxOutputTokens: 2048,
      responseMimeType: 'application/json', responseSchema: SCHEMA,
    },
  });
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`empty candidate (${json?.candidates?.[0]?.finishReason || 'no reason'})`);
  lastModel = model;
  return JSON.parse(text);
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
      { items: items_, taggedAt: new Date(), model: lastModel, taxonomyVersion: 1 },
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
    if (e instanceof BudgetExhaustedError) {
      // Today's share is spent. Stop here; everything tagged so far is saved
      // by the final flush, and --resume picks up the rest tomorrow.
      console.log(`\n  stopping: ${e.message}`);
      break;
    }
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
  // No fixed sleep: the pool paces each key to its per-minute limit.
}
console.log(`\n  quota used today: ${pool.summary()}`);
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

