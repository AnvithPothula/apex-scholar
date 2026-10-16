/**
 * Review cards save the student's original answer as the choice's TEXT
 * (sometimes "B) text", sometimes just "B"). The old repeated-mistake check
 * compared it with a bare letter, so picking the same wrong answer again was
 * always called "a different mistake".
 */
const stripLetter = (t) => String(t ?? '').trim().replace(/^[A-E][).:]\s*/, '');

/** The saved answer as shown in a sentence: no letter, no trailing full stop. */
export const shownAnswer = (t) => stripLetter(t).replace(/[.\s]+$/, '');

export function sameAnswer(saved, optionText, index) {
  const s = String(saved ?? '').trim();
  if (/^[A-E]$/.test(s)) return s === String.fromCharCode(65 + index);
  return stripLetter(s).toLowerCase() === stripLetter(optionText).toLowerCase();
}
