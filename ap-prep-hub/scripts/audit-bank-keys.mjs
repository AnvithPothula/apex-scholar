/**
 * Re-solves banked questions to find wrong answer keys the flaw sweep can't see
 * (an item can read cleanly and still be keyed to a wrong answer, or have no
 * correct choice at all).
 *
 *   node scripts/audit-bank-keys.mjs                       # quantitative subjects
 *   node scripts/audit-bank-keys.mjs --subjects ap-calculus-ab,ap-statistics
 *   node scripts/audit-bank-keys.mjs --out /tmp/keys.jsonl
 *
 * Two independent solves, never shown the stored key: one model solves every
 * item, a different model re-solves only the disagreements. Each finding is
 *   key_wrong      both solvers agree on another choice
 *   no_correct     both say no choice is right (the choices need rewriting)
 *   disputed       the solvers disagree with each other: read it yourself
 * Read-only: it writes a JSONL report (and a resumable .cache.json beside it), never the bank. Needs GEMINI_API_KEYS
 * and the Firebase admin credentials in .env.
 */
import { writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { argv } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.join(here, '..', '.env'));

const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const QUANT = ['ap-calculus-ab', 'ap-calculus-bc', 'ap-precalculus', 'ap-statistics', 'ap-physics-1-algebra-based',
  'ap-physics-2-algebra-based', 'ap-physics-c-mechanics', 'ap-physics-c-electricity-and-magnetism', 'ap-chemistry',
  'ap-macroeconomics', 'ap-microeconomics'];
const subjects = arg('subjects', QUANT.join(',')).split(',');
const out = arg('out', path.join(here, '..', 'docs', 'research', 'bank.keys.jsonl'));
const KEYS = (process.env.GEMINI_API_KEYS || '').split(',').map((k) => k.trim()).filter(Boolean);
if (!KEYS.length) throw new Error('GEMINI_API_KEYS is empty');

// The strong -flash models, through the paced pool (scripts/lib/geminiPool.mjs):
// it counts each model's 20 requests a day per key and leaves 30% of them for
// students, since the app's premium chain leads with the same models. The
// second opinion is always from a different model than the first answer.
const { createPool, BudgetExhaustedError } = await import('./lib/geminiPool.mjs');
const pool = createPool({
  keys: KEYS,
  models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  usageFile: path.join(here, '.gemini-usage.json'),
});
const BATCH = 6;
const PARALLEL = 4; // batches in flight

async function solve(items, avoid) {
  const prompt = `You are checking AP exam multiple-choice questions. Solve each one yourself, carefully and step by step, then pick the choice that is correct. If no choice is correct, say so and give the correct value.

Return ONLY a JSON array, one object per question, in order:
[{"i": 0, "answer": <0-based index of the correct choice, or null if none is correct>, "correct_value": "<the right answer in a few words>"}]

${items.map((q, i) => `QUESTION ${i}: ${q.question}\n${q.choices.map((c, j) => `  ${j}) ${c}`).join('\n')}`).join('\n\n')}`;
  try {
    const { json, model } = await pool.call({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }, { avoid });
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    const arr = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
    return Array.isArray(arr) ? { model, verdicts: arr } : null;
  } catch (e) {
    if (e instanceof BudgetExhaustedError) throw e;
    return null; // a garbled reply: the batch is retried on the next run
  }
}

const { getAdminApp } = await import('../netlify/lib/firebaseAdmin.js');
const { app, error } = getAdminApp();
if (!app) throw new Error(`Cannot read the bank: ${error}`);
const snap = await app.firestore().collection('questionBank').get();
const items = [];
snap.forEach((doc) => {
  const subject = String(doc.id).split('__')[0];
  if (!subjects.includes(subject)) return;
  (doc.data().questions || []).forEach((q, i) => items.push({ ...q, id: `${doc.id}#${i}`, subject }));
});
console.log(`re-solving ${items.length} items in ${subjects.length} subjects`);

// Every answer is checkpointed, so a killed run resumes where it stopped. Keyed
// by the item's text as well as its id: a repaired item is solved again.
const cacheFile = `${out}.cache.json`;
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
const cacheKey = (label, q) => `${label}|${q.id}|${createHash('md5').update(JSON.stringify([q.question, q.choices])).digest('hex')}`;

async function pass(list, label, avoidOf = () => null) {
  const res = new Map();
  const todo = [];
  for (const q of list) {
    const hit = cache[cacheKey(label, q)];
    if (hit) res.set(q.id, hit);
    else todo.push(q);
  }
  if (res.size) console.log(`${label}: ${res.size} answers from the checkpoint`);
  // Group by the model to avoid, so one call can avoid it for its whole batch.
  const groups = new Map();
  for (const q of todo) {
    const m = avoidOf(q) || '';
    groups.set(m, [...(groups.get(m) || []), q]);
  }
  const batches = [];
  for (const [m, qs] of groups) {
    for (let b = 0; b < qs.length; b += BATCH) batches.push({ avoid: m ? new Set([m]) : undefined, chunk: qs.slice(b, b + BATCH) });
  }
  let stopped = false;
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < batches.length && !stopped) {
      const n = next++;
      const { chunk, avoid } = batches[n];
      let r;
      try {
        r = await solve(chunk, avoid);
      } catch (e) {
        stopped = true;
        console.log(`${label}: ${e.message}`);
        return;
      }
      done++;
      if (!r) { console.log(`${label}: batch ${n + 1} got no answer (quota?)`); continue; }
      r.verdicts.forEach((v) => {
        const q = chunk[Number(v?.i)];
        if (!q) return;
        const verdict = { answer: Number.isInteger(v.answer) ? v.answer : null, value: String(v.correct_value || ''), model: r.model };
        res.set(q.id, verdict);
        cache[cacheKey(label, q)] = verdict;
      });
      writeFileSync(cacheFile, JSON.stringify(cache));
      console.log(`${label}: ${done}/${batches.length} batches`);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  if (stopped) {
    console.log('Out of today\'s share of the quota; answers so far are checkpointed. Rerun after midnight Pacific.');
    process.exit(0);
  }
  return res;
}

const first = await pass(items, 'first solve');
const suspects = items.filter((q) => first.has(q.id) && first.get(q.id).answer !== q.correctAnswer);
console.log(`${suspects.length} disagree with the stored key; getting a second opinion`);
const second = await pass(suspects, 'second solve', (q) => first.get(q.id).model);

const findings = suspects.map((q) => {
  const a = first.get(q.id);
  const b = second.get(q.id);
  let kind = 'disputed';
  if (b && a.answer === b.answer) kind = a.answer === null ? 'no_correct' : 'key_wrong';
  else if (b && b.answer === q.correctAnswer) kind = 'stored_key_upheld';
  return { id: q.id, subject: q.subject, kind, question: q.question, choices: q.choices, storedKey: q.correctAnswer, first: a, second: b || null };
}).filter((f) => f.kind !== 'stored_key_upheld');

await writeFile(out, findings.map((f) => JSON.stringify(f)).join('\n') + '\n');
const count = (k) => findings.filter((f) => f.kind === k).length;
console.log(`solved ${first.size}/${items.length}; key_wrong ${count('key_wrong')}, no_correct ${count('no_correct')}, disputed ${count('disputed')}`);
console.log(`report -> ${path.relative(process.cwd(), out)}`);
