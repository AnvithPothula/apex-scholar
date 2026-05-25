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
export async function generateMcqs({ subjectName, sourceText, count = 10, instruction = '', maxOutputTokens = 8000 }) {
  const prompt = buildBatchMcqPrompt({ subjectName, sourceText, count, instruction });
  const resp = await geminiService.generateContent(prompt, { temperature: 0.4, maxOutputTokens });
  return parseMcqArray(String(resp || ''));
}

const mcqGenerator = { coerceMcq, parseSingleMcq, parseMcqArray, buildBatchMcqPrompt, generateMcqs };
export default mcqGenerator;
