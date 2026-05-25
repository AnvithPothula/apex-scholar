/**
 * Curriculum content pipeline + cache for the Learn → Curriculum feature.
 *
 * Lesson bodies and practice MCQs are AI-generated ONCE from the unit's source
 * PDFs (Heimler noteguide + MCQ answer key under public/curriculums/apush/),
 * grounded in that material, then cached in Firestore and reused by everyone.
 *
 * Reads never trigger generation (cost control). An admin runs generateUnit(n)
 * from the curriculum UI (Learn is admin-gated) to populate the cache.
 *
 * Firestore layout (shared, world-readable, admin-write — see firestore.rules):
 *   curriculum/apush/units/{n}        -> { summaryMarkdown, generatedAt }
 *   curriculum/apush/lessons/{topicId}-> { markdown, title, unit, generatedAt }
 *   curriculum/apush/practice/unit-{n}-> { mcqs:[...], generatedAt }
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import geminiService from './geminiService';
import { extractPdfTextFromUrl } from './pdfUtils';
import { generateMcqs } from './ai/mcqGenerator';
import { getUnit } from '../data/curriculums/usHistory';

const SUBJECT = 'AP US History';

// ---- Firestore refs ------------------------------------------------------
const lessonRef = (topicId) => doc(db, 'curriculum', 'apush', 'lessons', topicId);
const unitRef = (n) => doc(db, 'curriculum', 'apush', 'units', String(n));
const practiceRef = (n) => doc(db, 'curriculum', 'apush', 'practice', `unit-${n}`);

// ---- Reads (no generation) ----------------------------------------------

export async function getLesson(topicId) {
  try {
    const snap = await getDoc(lessonRef(topicId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('[curriculum] getLesson failed', e);
    return null;
  }
}

export async function getUnitSummary(unitNumber) {
  try {
    const snap = await getDoc(unitRef(unitNumber));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('[curriculum] getUnitSummary failed', e);
    return null;
  }
}

export async function getUnitPractice(unitNumber) {
  try {
    const snap = await getDoc(practiceRef(unitNumber));
    return snap.exists() ? snap.data().mcqs || [] : null;
  } catch (e) {
    console.error('[curriculum] getUnitPractice failed', e);
    return null;
  }
}

/** Quick check used by the UI to show "Generate" vs "ready". */
export async function unitHasContent(unitNumber) {
  const snap = await getDoc(unitRef(unitNumber)).catch(() => null);
  return !!(snap && snap.exists());
}

// ---- Generation (admin) --------------------------------------------------

function lessonPrompt({ topic, noteguideText }) {
  return `You are an expert AP U.S. History teacher writing a lesson that TEACHES a student this topic from scratch, in the clear, explanatory style of Khan Academy. Use the UNIT NOTEGUIDE below as your primary source, supplemented by your knowledge of the College Board CED.

Topic ${topic.number}: ${topic.title}

Write a FULL lesson in Markdown that actually teaches — explanatory prose, NOT a list of bullet points. Address the student directly ("you"). Structure it exactly like this:

- Open with a short hook (2-4 sentences): why this topic matters and what they'll understand by the end. No header on this part.
- Then 2-4 "##" sub-sections that develop the ideas step by step. EXPLAIN the why and how — causes, context, significance, and how events connect — in flowing paragraphs. Weave concrete examples into the prose ("For example, ..."), don't just list them. Bold key terms on first mention with **term**.
- "## Key Takeaways": 3-5 bullet points summarizing the must-remember ideas. This is the ONLY place bullets belong.
- "## On the Exam": one short paragraph on how the College Board tests this (causation, continuity/change, comparison, or evidence/argument), with a concrete tip.

Aim for 500-800 words. Teach clearly and accurately; do NOT invent events unsupported by the source or standard APUSH content. Output ONLY the Markdown lesson — no preamble, no closing remarks.

UNIT NOTEGUIDE:
${noteguideText}`;
}

function summaryPrompt({ unit, noteguideText }) {
  return `You are an expert AP U.S. History teacher. Using the UNIT NOTEGUIDE below, write a tight Markdown review summary of ${unit.title} (${unit.range}) for a student doing a final unit review. Include the big-picture narrative, 5-8 must-know terms/events as bullets, and the key themes. ~250 words. Output only Markdown.

UNIT NOTEGUIDE:
${noteguideText}`;
}

/**
 * Generate + cache all content for a unit: a lesson per topic, a unit review
 * summary, and a unit practice set parsed from the MCQ answer-key PDF.
 *
 * @param {number} unitNumber
 * @param {object} [opts] { onProgress?: (msg)=>void, regenerate?: boolean, practiceCount?: number }
 * @returns {Promise<{lessons:number, summary:boolean, practice:number, errors:string[]}>}
 */
export async function generateUnit(unitNumber, opts = {}) {
  const { onProgress = () => {}, regenerate = false, practiceCount = 12 } = opts;
  const unit = getUnit(unitNumber);
  if (!unit) throw new Error(`Unknown unit ${unitNumber}`);
  const result = { lessons: 0, summary: false, practice: 0, errors: [] };

  // 1) Source text from the unit's PDFs.
  onProgress(`Reading noteguide for Unit ${unitNumber}…`);
  const noteguideText = await extractPdfTextFromUrl(unit.noteguidePdf, { maxPages: 30 });
  if (!noteguideText || noteguideText.length < 200) {
    throw new Error(
      `Could not read the noteguide PDF (${unit.noteguidePdf}). It may be a scanned image — OCR (Gemini vision) would be needed.`
    );
  }

  // 2) A lesson per topic.
  for (const topic of unit.topics) {
    if (!regenerate) {
      const existing = await getLesson(topic.id);
      if (existing) { result.lessons += 1; continue; }
    }
    try {
      onProgress(`Generating lesson ${topic.number} — ${topic.title}…`);
      const md = String(
        await geminiService.generateContent(lessonPrompt({ topic, noteguideText }), {
          temperature: 0.5,
          maxOutputTokens: 2400, // full teaching lesson (~500-800 words)
        }) || ''
      ).trim();
      if (!md) throw new Error('empty lesson');
      await setDoc(lessonRef(topic.id), {
        markdown: md,
        title: topic.title,
        number: topic.number,
        unit: unitNumber,
        generatedAt: serverTimestamp(),
      });
      result.lessons += 1;
    } catch (e) {
      result.errors.push(`lesson ${topic.id}: ${e.message}`);
    }
  }

  // 3) Unit review summary.
  try {
    onProgress(`Generating Unit ${unitNumber} review summary…`);
    const summary = String(
      await geminiService.generateContent(summaryPrompt({ unit, noteguideText }), {
        temperature: 0.5,
        maxOutputTokens: 900,
      }) || ''
    ).trim();
    await setDoc(unitRef(unitNumber), {
      summaryMarkdown: summary,
      title: unit.title,
      generatedAt: serverTimestamp(),
    });
    result.summary = true;
  } catch (e) {
    result.errors.push(`summary: ${e.message}`);
  }

  // 4) Practice MCQs from the answer-key PDF.
  try {
    if (regenerate || (await getUnitPractice(unitNumber)) == null) {
      onProgress(`Reading MCQ bank for Unit ${unitNumber}…`);
      const mcqText = await extractPdfTextFromUrl(unit.mcqPdf, { maxPages: 30 });
      if (mcqText && mcqText.length > 200) {
        onProgress(`Structuring practice questions for Unit ${unitNumber}…`);
        const mcqs = await generateMcqs({
          subjectName: SUBJECT,
          sourceText: mcqText,
          count: practiceCount,
          instruction: `The SOURCE MATERIAL is an AP U.S. History multiple-choice question set WITH an answer key. Faithfully reconstruct up to ${practiceCount} of its questions as structured MCQs, using the answer key to set correctIndex and to write the explanations.`,
        });
        if (mcqs.length) {
          await setDoc(practiceRef(unitNumber), { mcqs, generatedAt: serverTimestamp() });
          result.practice = mcqs.length;
        } else {
          result.errors.push('practice: parsed 0 questions');
        }
      } else {
        result.errors.push('practice: could not read MCQ PDF');
      }
    } else {
      const existing = await getUnitPractice(unitNumber);
      result.practice = existing ? existing.length : 0;
    }
  } catch (e) {
    result.errors.push(`practice: ${e.message}`);
  }

  onProgress(`Done with Unit ${unitNumber}.`);
  return result;
}

const curriculumContent = {
  getLesson,
  getUnitSummary,
  getUnitPractice,
  unitHasContent,
  generateUnit,
};
export default curriculumContent;
