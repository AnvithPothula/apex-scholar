/**
 * Revises banked items that cue or blur the answer without being wrong:
 *   longest_option_correct   the key is the longest, most detailed option
 *   duplicate_explanations   two or more choices share one explanation
 *
 *   node scripts/revise-bank-items.mjs            # propose + check, writes nothing to the bank
 *   node scripts/revise-bank-items.mjs --limit 10 # try a few first
 *   node scripts/revise-bank-items.mjs --retry-dropped  # give rejected proposals another try
 *   node scripts/revise-bank-items.mjs --write    # also back up the touched bundles and write
 *
 * A model rewrites only the wrong choices (or the explanations); the stem and
 * the correct choice are never changed. A proposal is kept only if it clears
 * the flaw, adds no new one, and a separate solve, never shown the key, still
 * picks the stored answer. Proposals are checkpointed in
 * docs/research/bank.revisions.jsonl, so a killed run resumes. Uses the paced
 * flash-lite pool (scripts/lib/geminiPool.mjs), which leaves 30% of each
 * day's quota for students.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
process.loadEnvFile(path.join(ROOT, '.env'));
const src = fs.readFileSync(path.join(ROOT, 'src/utils/itemFlaws.js'), 'utf8');
const { detectFlaws, TIER } = await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
const { createPool, BudgetExhaustedError } = await import('./lib/geminiPool.mjs');
const { getAdminApp } = await import('../netlify/lib/firebaseAdmin.js');

const TARGET = ['longest_option_correct', 'duplicate_explanations'];
const OUT = path.join(ROOT, 'docs/research/bank.revisions.jsonl');
const BATCH = 5;
const write = process.argv.includes('--write');

const keys = (process.env.GEMINI_API_KEYS || '').split(',').map((k) => k.trim()).filter(Boolean);
const pool = createPool({
  keys,
  models: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
  usageFile: path.join(ROOT, 'scripts', '.gemini-usage.json'),
});
async function ask(prompt) {
  const { json } = await pool.call({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  });
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

const db = getAdminApp().app.firestore();
const snap = await db.collection('questionBank').get();
const items = [];
snap.forEach((doc) => (doc.data().questions || []).forEach((q, i) => {
  const flaws = detectFlaws(q).filter((f) => TARGET.includes(f));
  if (flaws.length) items.push({ id: `${doc.id}#${i}`, subject: doc.id.split('__')[0], flaws, q });
}));

const done = new Map();
if (fs.existsSync(OUT)) {
  for (const line of fs.readFileSync(OUT, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line);
    if (r.keep || !process.argv.includes('--retry-dropped')) done.set(r.id, r);
  }
}
// A kept proposal that fails today's checks (they were tightened) is redone.
for (const it of items) {
  const r = done.get(it.id);
  if (r?.keep && check(it, r)) done.delete(it.id);
}
const li = process.argv.indexOf('--limit');
const limit = li > 0 ? Number(process.argv[li + 1]) : Infinity;
const todo = items.filter((it) => !done.has(it.id)).slice(0, limit);
console.log(`${items.length} flagged items, ${done.size} already proposed, ${todo.length} to do`);

function rewritePrompt(batch) {
  return `You are fixing multiple-choice questions from an AP exam question bank. Each has a flaw a test-wise student could exploit. Fix ONLY what is asked; never change the question or the correct choice.

- "longest_option_correct": the correct choice is noticeably longer and more detailed than the others, so students can guess it. Rewrite the WRONG choices so each is about as long and specific as the correct one, in the same grammatical form; at least one wrong choice should be as long as the correct one or longer, but keep every choice within about 20% of the correct one's length. Never add reasons or explanations to a wrong choice to lengthen it; add specific, plausible content instead. Each must stay clearly wrong to a student who knows the content, and should reflect a real misconception. Keep the language the choices are written in (for language courses keep the target language). Then update the explanations of the choices you changed so they still say why that choice is wrong.
- "duplicate_explanations": several choices share the same explanation. Rewrite the explanations so each one says specifically why that choice is right or wrong.

Match the existing explanation style (keep a "Correct."/"Incorrect." prefix if the item uses one). Plain prose, no filler.

Return ONLY a JSON array, one object per question, in order:
[{"i": 0, "choices": [4 strings], "explanations": [4 strings]}]
The correct choice must be copied exactly, character for character (same capitalization and punctuation), at the same index.

${batch.map((it, i) => `QUESTION ${i} (${it.subject}; fix: ${it.flaws.join(', ')}; correct index ${it.q.correctAnswer})
${JSON.stringify({ question: it.q.question, choices: it.q.choices, explanations: it.q.explanations })}`).join('\n\n')}`;
}

function solvePrompt(list) {
  return `Answer each AP exam multiple-choice question. Return ONLY a JSON array: [{"i": 0, "answer": <0-based index>}]

${list.map((x, i) => `QUESTION ${i}: ${x.question}\n${x.choices.map((c, j) => `  ${j}) ${c}`).join('\n')}`).join('\n\n')}`;
}

// The longest-option rule mirrored: padding the wrong choices must not leave the
// key as the clearly shortest one, which is the same cue the other way round.
function shortestCue(choices, key) {
  const lens = choices.map((c) => String(c).trim().length);
  const others = lens.filter((_, i) => i !== key);
  const mean = others.reduce((a, b) => a + b, 0) / others.length;
  return Math.min(...others) - lens[key] >= 2 && lens[key] <= 0.8 * mean;
}

// Why a proposal is rejected, or '' if it is fine to keep.
function check(it, p) {
  const q = it.q;
  if (!p || !Array.isArray(p.choices) || !Array.isArray(p.explanations)) return 'bad shape';
  if (p.choices.length !== q.choices.length || p.explanations.length !== q.choices.length) return 'bad shape';
  if (p.choices[q.correctAnswer] !== q.choices[q.correctAnswer]) return 'changed the correct choice';
  if (p.choices.some((c) => !String(c || '').trim())) return 'blank choice';
  if (!it.flaws.includes('longest_option_correct') && p.choices.some((c, j) => c !== q.choices[j])) return 'changed a choice';
  const next = { ...q, choices: p.choices, explanations: p.explanations };
  const after = detectFlaws(next);
  const before = detectFlaws(q);
  if (after.some((f) => TARGET.includes(f))) return `still ${after.filter((f) => TARGET.includes(f)).join(',')}`;
  if (it.flaws.includes('longest_option_correct') && shortestCue(p.choices, q.correctAnswer)) return 'now the shortest';
  const added = after.filter((f) => !before.includes(f) && TIER[f] !== 'advisory');
  if (added.length) return `new flaw ${added.join(',')}`;
  return '';
}

const log = fs.createWriteStream(OUT, { flags: 'a' });
let kept = 0;
let dropped = 0;
for (let b = 0; b < todo.length; b += BATCH) {
  const batch = todo.slice(b, b + BATCH);
  let proposals;
  try {
    proposals = await ask(rewritePrompt(batch));
  } catch (e) {
    // Out of today's share: stop. A garbled reply: skip it, the next run retries.
    console.log(`batch ${b / BATCH + 1}: rewrite failed (${e.message})`);
    if (e instanceof BudgetExhaustedError) break;
    continue;
  }
  const byI = new Map(proposals.map((p) => [Number(p?.i), p]));
  const results = batch.map((it, i) => ({ it, p: byI.get(i), why: check(it, byI.get(i)) }));
  const ok = results.filter((r) => !r.why);
  if (ok.length) {
    try {
      const answers = await ask(solvePrompt(ok.map((r) => ({ question: r.it.q.question, choices: r.p.choices }))));
      const pick = new Map(answers.map((a) => [Number(a?.i), a?.answer]));
      ok.forEach((r, i) => { if (pick.get(i) !== r.it.q.correctAnswer) r.why = `solver picked ${pick.get(i)}`; });
    } catch (e) {
      ok.forEach((r) => { r.why = `check failed (${e.message})`; });
    }
  }
  for (const r of results) {
    const row = { id: r.it.id, flaws: r.it.flaws, keep: !r.why, why: r.why || undefined,
      choices: r.p?.choices, explanations: r.p?.explanations };
    // A failed check is retried on the next run, not recorded as final.
    if (r.why?.startsWith('check failed')) continue;
    log.write(`${JSON.stringify(row)}\n`);
    done.set(row.id, row);
    if (row.keep) kept++; else dropped++;
  }
  console.log(`${Math.min(b + BATCH, todo.length)}/${todo.length}: kept ${kept}, dropped ${dropped}`);
}
await new Promise((r) => log.end(r));
console.log(`quota used today: ${pool.summary()}`);

// Apply every kept proposal whose item hasn't changed since it was proposed.
const changed = new Map();
let ready = 0;
for (const it of items) {
  const r = done.get(it.id);
  if (!r?.keep || check(it, r)) continue;
  ready++;
  if (!write) continue;
  const [docId, idx] = it.id.split('#');
  const data = changed.get(docId) || snap.docs.find((d) => d.id === docId).data();
  Object.assign(data.questions[Number(idx)], { choices: r.choices, explanations: r.explanations });
  changed.set(docId, data);
}
console.log(`${ready} of ${items.length} flagged items have a revision ready`);
if (!changed.size) process.exit(0);
const backupDir = path.join(ROOT, '..', 'backups');
fs.mkdirSync(backupDir, { recursive: true });
const originals = {};
for (const id of changed.keys()) originals[id] = (await db.collection('questionBank').doc(id).get()).data();
const backup = path.join(backupDir, `questionBank-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(backup, JSON.stringify(originals));
let batchWrite = db.batch();
let n = 0;
for (const [id, data] of changed) {
  batchWrite.update(db.collection('questionBank').doc(id), { questions: data.questions });
  if (++n % 400 === 0) { await batchWrite.commit(); batchWrite = db.batch(); }
}
await batchWrite.commit();
console.log(`backup -> ${backup}\nwrote ${changed.size} bundles`);
