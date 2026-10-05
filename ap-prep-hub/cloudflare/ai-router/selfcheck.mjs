// Routing/cache-key sanity check (no network). Run: node selfcheck.mjs
import assert from 'node:assert';
// Import the REAL routing tables. They used to be copy-pasted here, which meant
// the check could pass while the deployed Worker routed somewhere else.
import { MODEL_CHAINS, TASK_TO_CHAIN, LITE_HEAD, orderModels } from './src/index.js';
const versionFor = (m) => (/^(gemini-(2\.5|3)|gemma-)/.test(m) ? 'v1beta' : 'v1');
// Every task must point at a chain that actually exists.
for (const [task, chain] of Object.entries(TASK_TO_CHAIN)) {
  assert.ok(MODEL_CHAINS[chain], `task "${task}" -> unknown chain "${chain}"`);
}
// High-volume tasks lead on the two equal flash-lite pools, which the router
// splits between (was: always 3.1, which hit its caps while 3.5 idled).
for (const task of ['tutorChat', 'mcqGenerate', 'lessonTeach', 'verifyMcq']) {
  assert.deepEqual(MODEL_CHAINS[TASK_TO_CHAIN[task]].slice(0, 2), LITE_HEAD, task);
}
assert.equal(orderModels(MODEL_CHAINS.bulk, { rand: () => 0 })[0], 'gemini-3.5-flash-lite');
assert.equal(orderModels(MODEL_CHAINS.bulk, { rand: () => 1 })[0], 'gemini-3.1-flash-lite');
// The verifier must not lead with the model that generated the questions:
// the client passes the generator as avoidModel.
for (const author of LITE_HEAD) {
  for (const rand of [() => 0, () => 1]) {
    assert.notEqual(orderModels(MODEL_CHAINS[TASK_TO_CHAIN.verifyMcq], { avoid: author, rand })[0], author);
  }
}
// A requested model outside the chain (the picker's 0-quota gemini-2.0-flash) is ignored.
assert.ok(!orderModels(MODEL_CHAINS.interactive, { requested: 'gemini-2.0-flash' }).includes('gemini-2.0-flash'));
// FRQ grading spends the scarce -flash pool, newest first.
assert.equal(MODEL_CHAINS[TASK_TO_CHAIN.frqGrade][0], 'gemini-3.8-flash');
// gemma + 3.x on v1beta, an old model on v1
assert.equal(versionFor('gemma-4-31b-it'), 'v1beta');
assert.equal(versionFor('gemini-3.1-flash-lite'), 'v1beta');
assert.equal(versionFor('gemini-1.5-flash'), 'v1');
// image forces vision regardless of task
const hasImage = (contents) => contents.some((c) => Array.isArray(c.parts) && c.parts.some((p) => p.inline_data || p.inlineData));
assert.equal(hasImage([{ parts: [{ inline_data: { data: 'x' } }] }]), true);
assert.equal(hasImage([{ parts: [{ text: 'hi' }] }]), false);

console.log('ai-router selfcheck OK');
