/**
 * Shared MCQ generation + parsing.
 *
 * Centralizes the MCQ JSON shape, the parse/repair path (via JSONParser), and
 * the normalize/validate step that both the AI Tutor (single MCQ in chat) and
 * the Curriculum (batch MCQs from a unit's question bank) rely on. Extracted
 * from AITutors.js so the recently-hardened logic lives in one place.
 *
 * MCQ shape: { question, choices: string[], correctIndex: number, explanations: string[] }
 */

import geminiService from '../geminiService';
import JSONParser from './jsonParser';

const parser = new JSONParser();

/**
 * Validate + normalize a raw MCQ-like object. Returns a clean MCQ or null if
 * it isn't a usable question (missing question / fewer than 2 choices). This
 * is the exact gate AITutors used inline — now reusable so a partial/garbled
 * object never renders as raw JSON.
 */
export function coerceMcq(mcq) {
  if (!mcq || !mcq.question || !Array.isArray(mcq.choices) || mcq.choices.length < 2) {
    return null;
  }
  let ci = mcq.correctIndex;
  if (ci !== undefined && ci !== null) {
    ci = parseInt(ci, 10);
    if (Number.isNaN(ci)) ci = 0;
  } else {
    ci = 0;
  }
  if (ci < 0 || ci >= mcq.choices.length) ci = 0;
  const explanations = Array.isArray(mcq.explanations)
    ? mcq.explanations.map((e) => String(e ?? ''))
    : mcq.choices.map(() => '');
  return {
    question: String(mcq.question),
    choices: mcq.choices.map((c) => String(c)),
    correctIndex: ci,
    explanations,
  };
}

/**
 * Parse a single MCQ object from an AI response. Returns a clean MCQ or null.
 * Used by the AI Tutor's Practice MCQ mode.
 */
export function parseSingleMcq(raw) {
  const res = parser.parse(raw, false);
  if (!res.success || !res.data) return null;
  return coerceMcq(res.data);
}

/**
 * Parse an array of MCQs from an AI response (tolerates a single-object
 * response or an object wrapping a `questions`/`mcqs` array). Returns only the
 * valid, normalized MCQs.
 */
export function parseMcqArray(raw) {
  let data = null;
  const asArray = parser.parse(raw, true);
  if (asArray.success && Array.isArray(asArray.data)) {
    data = asArray.data;
  } else {
    const asObj = parser.parse(raw, false);
    if (asObj.success && asObj.data) {
      const d = asObj.data;
      if (Array.isArray(d)) data = d;
      else if (Array.isArray(d.questions)) data = d.questions;
      else if (Array.isArray(d.mcqs)) data = d.mcqs;
      else if (d.question) data = [d]; // single MCQ object
    }
  }
  if (!Array.isArray(data)) return [];
  return data.map(coerceMcq).filter(Boolean);
}

/**
 * Build a prompt that turns source material (e.g. an extracted MCQ answer-key
 * PDF, or a unit's notes) into a JSON array of AP-style MCQs.
 */
export function buildBatchMcqPrompt({ subjectName, sourceText, count = 10, instruction = '' }) {
  return `You are an expert ${subjectName} teacher building AP exam practice.

${instruction || `From the SOURCE MATERIAL below, produce up to ${count} AP exam-style multiple-choice questions. Prefer faithfully reconstructing questions that already exist in the source (with their correct answers) over inventing new ones.`}

RESPOND WITH ONLY A JSON ARRAY. Start with [ and end with ]. No prose, no markdown, no code fences.
Each element is an object with EXACTLY these keys:
{"question": "stem text", "choices": ["A","B","C","D"], "correctIndex": 0, "explanations": ["why A", "why B", "why C", "why D"]}
Rules:
- "choices" has exactly 4 strings. "correctIndex" is the 0-based index of the correct choice per the source's answer key.
- "explanations" has 4 strings, one per choice, explaining why each is right/wrong (use the source's rationale when present).
- Produce at most ${count} questions. If the source has fewer, return only those.
- Output MUST be valid JSON. No trailing commas. No text outside the array.

SOURCE MATERIAL:
${sourceText}`;
}

/**
 * Generate a batch of MCQs from source text. Returns a normalized MCQ array
 * (possibly empty if generation/parse fails).
 */
export async function generateMcqs({
  subjectName,
  sourceText,
  count = 10,
  instruction = '',
  maxOutputTokens = 8000,
  verify = true,
}) {
  const prompt = buildBatchMcqPrompt({ subjectName, sourceText, count, instruction });
  const resp = await geminiService.generateContent(prompt, { temperature: 0.4, maxOutputTokens, task: 'mcqGenerate' });
  const mcqs = parseMcqArray(String(resp || ''));
  if (!verify || !mcqs.length) return mcqs;
  // Whatever wrote the questions must not also be the one checking them.
  const author = geminiService.getLastResolvedModel?.()?.model || null;
  return verifyMcqs({ subjectName, mcqs, avoidModel: author });
}

/**
 * Second-opinion pass: a DIFFERENT model re-answers each question blind and we
 * keep only the ones it agrees on.
 *
 * A wrong answer key is the worst failure this app can have — it teaches the
 * student the wrong thing and they trust it. The router is asked to avoid the
 * model that generated the batch (`avoidModel`), so an idiosyncratic mistake by
 * one model doesn't survive.
 *
 * Cheap by design: one extra call per BATCH, not per question. Fails open — if
 * the check itself errors we return the unverified batch rather than blocking
 * content.
 */
export async function verifyMcqs({ subjectName, mcqs, avoidModel = null }) {
  try {
    const roster = mcqs
      .map((m, i) => `${i}. ${m.question}\n${m.choices.map((c, j) => `   ${j}) ${c}`).join('\n')}`)
      .join('\n\n');

    const prompt = `You are an expert ${subjectName} exam grader. Answer each multiple-choice question below independently and correctly. Do NOT be influenced by question order or answer position.

RESPOND WITH ONLY A JSON ARRAY of objects, one per question, in the same order:
[{"i": 0, "answer": 2, "confident": true}]
- "i" is the question number shown.
- "answer" is the 0-based index of the choice YOU believe is correct.
- "confident" is false if the question is ambiguous, has no correct choice, or has more than one.
No prose, no markdown, no code fences.

QUESTIONS:
${roster}`;

    const resp = await geminiService.generateContent(prompt, {
      temperature: 0,
      maxOutputTokens: 2000,
      task: 'verifyMcq',
      // Both chains lead with the same flash-lite models, so without this the
      // "second opinion" was usually the same model grading its own work.
      avoidModel,
    });

    const verdicts = parser.parse(String(resp || ''), true);
    if (!verdicts.success || !Array.isArray(verdicts.data)) return mcqs;

    const byIndex = new Map(
      verdicts.data
        .filter((v) => v && Number.isInteger(Number(v.i)))
        .map((v) => [Number(v.i), v])
    );

    const kept = mcqs.filter((m, i) => {
      const v = byIndex.get(i);
      // No verdict for this question — keep it; the checker simply didn't cover it.
      if (!v) return true;
      if (v.confident === false) return false;
      return Number(v.answer) === m.correctIndex;
    });

    // If the checker rejected nearly everything it is more likely the checker
    // misbehaved than that every question is wrong. Trust the batch instead.
    if (kept.length < mcqs.length * 0.34) return mcqs;
    return kept;
  } catch (e) {
    console.error('[mcq] verification failed, using unverified batch', e);
    return mcqs;
  }
}

const mcqGenerator = { coerceMcq, parseSingleMcq, parseMcqArray, buildBatchMcqPrompt, generateMcqs, verifyMcqs };
export default mcqGenerator;
