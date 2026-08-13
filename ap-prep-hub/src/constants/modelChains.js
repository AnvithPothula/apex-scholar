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
  bulk:        ['gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
  interactive: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  premium:     ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
  // Gemma has no image input — vision cannot borrow the deep pool at all.
  vision:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'],
  verify:      ['gemma-4-26b-a4b-it', 'gemma-4-31b-it', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
};

export const TASK_TO_CHAIN = {
  tutorChat: 'interactive', explain: 'interactive',
  solver: 'vision',
  lessonTeach: 'bulk',
  mcqGenerate: 'bulk', practiceTest: 'bulk', flashcardGen: 'bulk',
  summarize: 'bulk', reviewCard: 'bulk', diagnostic: 'bulk',
  verifyMcq: 'verify',
  frqGrade: 'premium',
};

/** Models with a deep daily pool — safe to be the floor of a chain. */
export const DEEP_POOL = /^(gemma-4-|gemini-3\.\d+-flash-lite)/;

/** Gemma's 16K TPM ceiling. Beyond this it is a guaranteed 429, so skip it. */
export const GEMMA_MAX_CHARS = 48_000;

/**
 * The chain to walk for a task, with an explicitly requested model first.
 * `payloadChars` drops Gemma when the prompt cannot fit its TPM ceiling.
 */
export function chainFor(task, requestedModel, payloadChars = 0) {
  const name = TASK_TO_CHAIN[task] || 'interactive';
  let chain = MODEL_CHAINS[name].slice();

  const requested = String(requestedModel || '').replace(/^models\//, '').replace(/^google\//, '');
  if (/^(gemini-|gemma-)/.test(requested)) {
    chain = [requested, ...chain.filter((m) => m !== requested)];
  }

  if (payloadChars > GEMMA_MAX_CHARS) {
    const fits = chain.filter((m) => !m.startsWith('gemma-'));
    if (fits.length) chain = fits;
  }
  return chain;
}
