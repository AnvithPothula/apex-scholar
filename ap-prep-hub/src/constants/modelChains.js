/**
 * Google model fallback chains, ordered by MEASURED free-tier capacity.
 *
 * Free-tier requests-per-day PER PROJECT (from AI Studio's rate-limit page):
 *
 *   gemma-4-*              14,400 RPD   30 RPM    16K TPM
 *   gemini-3.x-flash-lite     500 RPD   15 RPM   250K TPM
 *   every *-flash model        20 RPD    5 RPM   250K TPM
 *
 * A -flash model is 28x scarcer than Gemma, so no chain may END on one: the
 * last entry is the floor the app falls back to when everything above is out.
 *
 * The worker (cloudflare/ai-router) and the Netlify proxy carry their own copy
 * because neither can import from src/. `modelChains.test.js` pins the shapes
 * that matter (deep-pool floor, no Gemma in vision) so drift is caught here.
 */

export const MODEL_CHAINS = {
  // Written out in full, not composed from shared arrays: aiRouterCapacity.test.js
  // compares these three copies by parsing the source text, and a spread hides
  // the model names from it. Verbosity here buys a real drift check.
  //
  // Gemma is the TAIL of every chain, never the lead. Measured twice against
  // this app's own prompts:
  //   mcqGenerate (JSON):  gemma-4-31b-it 2/3 parsed, flash-lite 3/3
  //   explain     (prose): gemma-4-31b-it 0/3 clean,  flash-lite 3/3
  // Given a prompt shaped as an instruction list it restates the task as a plan
  // ("* Subject: AP Biology. * Question: ...") and calls that the answer. Every
  // prompt in this app is an instruction list. It still absorbs overflow at the
  // tail, where a 2-in-3 answer beats none.
  bulk:        ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  interactive: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  // FRQ grading is the one place output quality is worth the scarce pool, so
  // the newest -flash models lead and the lites catch the overflow.
  premium:     ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  // No Gemma. Gemma 4 is documented to accept images, but that is unverified
  // here and the solver is not the place to find out.
  vision:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
  verify:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
};

export const TASK_TO_CHAIN = {
  tutorChat: 'interactive',
  // `explain` is the review-card explanation, not live chat: high volume, short,
  // and it was competing with tutorChat for the scarce 500-RPD flash-lite pool.
  // Gemma's 14,400 RPD absorbs it and leaves flash-lite for the live tutor.
  explain: 'bulk',
  solver: 'vision',
  lessonTeach: 'bulk',
  // JSON out -> structured. Prose out -> bulk (Gemma's deep pool).
  mcqGenerate: 'bulk', practiceTest: 'bulk', flashcardGen: 'bulk',
  reviewCard: 'bulk', diagnostic: 'bulk',
  summarize: 'bulk',
  verifyMcq: 'verify',
  frqGrade: 'premium',
};

/** Models with a deep daily pool — safe to be the floor of a chain. */
export const DEEP_POOL = /^(gemma-4-|gemini-3\.\d+-flash-lite)/;

/** Gemma's 16K TPM ceiling. Beyond this it is a guaranteed 429, so skip it. */
export const GEMMA_MAX_CHARS = 48_000;

/**
 * The two flash-lite models share identical free-tier limits (15 RPM, 500 RPD
 * per project). Listing 3.1 first everywhere sent it all the traffic — it hit
 * its caps (peak 23/15 RPM, 620/500 RPD) while 3.5 sat at 106 RPD. Every
 * runtime now splits the head between them.
 */
export const LITE_HEAD = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

/**
 * Model order for one request. Mirrors orderModels in the worker and the
 * Netlify proxy (aiRouterCapacity.test.js keeps them honest).
 *   requested — honoured only if the chain would use it anyway. The picker's
 *               "gemini-2.0-flash" has a 0/0 free quota, so leading with it
 *               meant a guaranteed 429 per key before routing even started.
 *   avoid     — pushed off the head, so MCQ verification is answered by a
 *               different model from the one that wrote the questions.
 */
export function orderModels(chain, { requested = null, avoid = null, rand = Math.random } = {}) {
  let models = chain.slice();
  if (models[0] === LITE_HEAD[0] && models[1] === LITE_HEAD[1] && rand() < 0.5) {
    models = [models[1], models[0], ...models.slice(2)];
  }
  if (requested && models.includes(requested)) {
    models = [requested, ...models.filter((m) => m !== requested)];
  }
  if (avoid && models.length > 1 && models[0] === avoid) {
    models = [models[1], avoid, ...models.slice(2)];
  }
  return models;
}

const normModel = (m) => String(m || '').replace(/^models\//, '').replace(/^google\//, '');

/**
 * The chain to walk for a task (direct-key dev path; production routing lives
 * in the worker). `payloadChars` drops Gemma when the prompt cannot fit its TPM
 * ceiling.
 */
export function chainFor(task, requestedModel, payloadChars = 0, { avoid = null, rand = Math.random } = {}) {
  const name = TASK_TO_CHAIN[task] || 'interactive';
  let chain = orderModels(MODEL_CHAINS[name], {
    requested: normModel(requestedModel) || null,
    avoid: normModel(avoid) || null,
    rand,
  });

  if (payloadChars > GEMMA_MAX_CHARS) {
    const fits = chain.filter((m) => !m.startsWith('gemma-'));
    if (fits.length) chain = fits;
  }
  return chain;
}
