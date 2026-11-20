/**
 * Official past AP free-response questions, for the Grader.
 *
 * src/data/pastFrqs.json holds only LINKS to College Board's own PDFs on AP
 * Central (2023 onward, read from each course's "past exam questions" page).
 * Nothing of theirs is stored: at grading time the scoring guidelines are
 * fetched through netlify/functions/past-frq, split into questions, and the
 * chosen question's guidelines go to the grader.
 */
import PAST_FRQS from '../data/pastFrqs.json';
import { subjectName } from '../constants/subjects';
import { extractPdfLines } from './pdfUtils';

/** Exams for a subject (any name, key or slug), newest first: [{ year, label, frq, sg }]. */
export const pastExamsFor = (subject) => PAST_FRQS[subjectName(subject)] || [];

export const examLabel = (e) => `${e.year}${e.label ? ` · ${e.label}` : ''}`;

// "Question 2: Long Essay Question, ...   6 points", "FRQ 1: Article Analysis   7 Points",
// "Synthesis Essay   6 points". A heading is worth 2+ points; "A Describe ... 1 point"
// lines are rubric rows, and so is anything with a second "points" in it.
const HEADING = /^(?!row\b)(?!.*\bpoints?\b.*\b\d+\s+points\s*$)(.{3,160}?)\s+(\d+)\s+points$/i;
const STARTS_TITLE = /^(question|frq|part|task)\b/i;

/**
 * Split scoring-guideline lines into questions: [{ title, points, text }].
 * Numbering can restart within one PDF (U.S. History: SAQ 1-4, then DBQ
 * "Question 1"), so questions are kept in document order, never by number.
 */
export function splitGuidelines(lines) {
  const heads = [];
  lines.forEach((raw, i) => {
    const line = String(raw).replace(/\s+/g, ' ').trim();
    const m = line.match(HEADING);
    // "Examples that earn 2 points" (Seminar) is a rubric note and "Total for
    // part (b) 3 points" / "Total for question 1 9 points" (2024+) is a subtotal,
    // not a question.
    if (!m || Number(m[2]) < 2 || /\bearns?\b/i.test(m[1]) || /^total\b/i.test(m[1])) return;
    let title = m[1].trim();
    let start = i;
    // A long title wraps: "Question 5: Analyze Model ... Biological" / "Concept or Process   4 points".
    const prev = String(lines[i - 1] || '').trim();
    if (!STARTS_TITLE.test(title) && STARTS_TITLE.test(prev) && !HEADING.test(prev)) {
      title = `${prev} ${title}`;
      start = i - 1;
    }
    heads.push({ title, points: Number(m[2]), start });
  });
  let section = 1;
  let lastNum = 0;
  return heads.map((h, k) => {
    const body = lines.slice(h.start, k + 1 < heads.length ? heads[k + 1].start : lines.length);
    // Numbering restarts in a new section (U.S. History: SAQ 1-4, then DBQ "Question 1").
    const num = Number((h.title.match(/^(?:question|frq)\s*(\d+)/i) || [])[1]) || null;
    if (num && num <= lastNum) section += 1;
    if (num) lastNum = num;
    const topic = h.title.replace(/^(?:question|frq)\s*\d+\s*:?\s*/i, '').trim();
    return {
      title: h.title,
      points: h.points,
      label: `${section > 1 ? `Section ${['', 'I', 'II', 'III'][section] || section}, ` : ''}${num ? `Question ${num}` : `Question ${k + 1}`}${topic && num ? ` · ${topic}` : !num ? ` · ${h.title}` : ''}`,
      parts: checkedParts(partsOf(body), h.points),
      text: body.join('\n'),
    };
  });
}

/** Points that don't add up to the question's total are not trusted (shown without points). */
function checkedParts(parts, total) {
  if (!parts.length || !parts.every((p) => p.points)) return parts;
  return parts.reduce((s, p) => s + p.points, 0) === total ? parts : parts.map((p) => ({ ...p, points: null }));
}

// Part markers: "(a) …", "(c)(i) …", "Part A …", "A Describe …" (2025+), essay "Row A".
const PART = [
  [/^\(\s*([a-h])\s*\)/i, (m) => m[1].toLowerCase()],
  [/^part\s+([a-h])\b/i, (m) => m[1].toLowerCase()],
  [/^([A-H])\s+(?:\(\s*i{1,3}v?\s*\)\s*)?(?=[A-Z][a-z]+\s+[a-z])/, (m) => m[1].toLowerCase()],
  [/^row\s+([a-e])\b/i, (m) => `row ${m[1].toLowerCase()}`],
];
// "… 1 point" / "… 2 points", or 2025-style labelled points ("… Point A1", "Point 03") worth 1 each.
const POINTS = /\b(\d+)\s+point\s*s?$/i;
const POINT_LABEL = /\bPoint\s+[A-H]?\d+$/i;

/**
 * The lettered parts of one question, with their points, or [] when they
 * can't be read reliably (parts must run a, b, c… and their points, where
 * stated, must add up). Points come from "Total for part (x)" lines when the
 * guideline has them, else from the point lines inside the part; for essay
 * rows, the row's highest score.
 */
export function partsOf(lines) {
  const parts = [];
  const totals = {};
  for (const raw of lines) {
    const line = String(raw).replace(/\s+/g, ' ').trim();
    const t = line.match(/^total for part \(?\s*([a-h])\s*\)?\s+(\d+)\s+point/i);
    if (t) { totals[t[1].toLowerCase()] = Number(t[2]); continue; }
    if (/^total\b/i.test(line)) continue;
    let id = null;
    for (const [re, key] of PART) {
      const m = line.match(re);
      if (m) { id = key(m); break; }
    }
    if (id && !parts.some((p) => p.id === id)) {
      parts.push({ id, text: line.replace(POINTS, '').replace(POINT_LABEL, '').trim().slice(0, 140), lines: [] });
    }
    if (parts.length) parts[parts.length - 1].lines.push(line);
  }
  if (parts.length < 2) return [];
  const rows = parts[0].id.startsWith('row');
  const expected = parts.map((_, i) => (rows ? `row ${'abcde'[i]}` : 'abcdefgh'[i]));
  if (parts.some((p, i) => p.id !== expected[i])) return [];
  return parts.map((p) => {
    const nums = p.lines.map((l) => Number((l.match(POINTS) || [])[1]) || (POINT_LABEL.test(l) ? 1 : 0)).filter((n) => n > 0);
    const points = totals[p.id] ?? (rows ? (nums.length ? Math.max(...nums) : null) : (nums.length ? nums.reduce((a, b) => a + b, 0) : null));
    return { id: p.id, label: rows ? `Row ${p.id.slice(4).toUpperCase()}` : `(${p.id})`, text: p.text, points };
  });
}

const cache = new Map();

async function pdfLines(url) {
  const resp = await fetch(`/.netlify/functions/past-frq?url=${encodeURIComponent(url)}`);
  if (!resp.ok) {
    const err = new Error(resp.status === 404 ? 'moved' : 'failed');
    err.status = resp.status;
    throw err;
  }
  return extractPdfLines(await resp.arrayBuffer());
}

const bookletCache = new Map();
const BOOKLET_MAX = 60000; // ~15k tokens; a DBQ booklet with all its documents fits

/**
 * The official question booklet as text (every question, with its documents,
 * sources and stimuli), so the grader sees what the student was actually
 * asked. '' when it can't be read; grading then relies on the guidelines.
 */
export function loadQuestionBooklet(frqUrl) {
  if (!frqUrl) return Promise.resolve('');
  if (!bookletCache.has(frqUrl)) {
    bookletCache.set(frqUrl, pdfLines(frqUrl).then((lines) => lines.join('\n').slice(0, BOOKLET_MAX)).catch(() => ''));
  }
  return bookletCache.get(frqUrl);
}

/** The questions in one exam's scoring guidelines (fetched once per session). */
export async function loadGuidelines(sgUrl) {
  if (!cache.has(sgUrl)) {
    cache.set(sgUrl, (async () => {
      let lines;
      try {
        lines = await pdfLines(sgUrl);
      } catch (e) {
        throw new Error(e.status === 404
          ? 'College Board has moved this scoring guideline. Paste the rubric yourself instead.'
          : "Couldn't load the scoring guidelines from College Board. Try again, or paste the rubric yourself.");
      }
      const questions = splitGuidelines(lines);
      if (!questions.length) throw new Error("Couldn't find the questions in that scoring guideline. Paste the rubric yourself instead.");
      return questions;
    })());
    cache.get(sgUrl).catch(() => cache.delete(sgUrl));
  }
  return cache.get(sgUrl);
}
