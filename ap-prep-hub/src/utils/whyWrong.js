/**
 * "Why was I wrong?" — hands a missed question off to the AI tutor.
 *
 * Practice and tutoring were two disconnected products: a student who got a
 * question wrong could see the correct answer but had no way to ask *why*
 * without retyping the whole thing. This builds the prompt that carries the
 * question, their answer, and the correct answer into the tutor.
 *
 * The prompt deliberately asks for the misconception rather than the answer.
 * The student can already see the answer on the results/review screen; what
 * they can't see is which piece of their reasoning broke.
 */

// Keep the handoff well inside a sane request size. Cards already cap question
// at 1000 and explanation at 1500 (services/srs.js), but results-panel
// questions come straight from the generator and are unbounded.
const LIMITS = { question: 1200, answer: 800, explanation: 1200, stimulus: 1500 };

const clean = (v, max) => {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

/** True when the student never answered (skipped), rather than answered wrongly. */
export function wasSkipped(userAnswer) {
  return clean(userAnswer, LIMITS.answer) === '';
}

/**
 * Build the tutor prompt for a missed question.
 *
 * @param {object} miss { subject, question, userAnswer, correctAnswer, explanation, unit }
 * @returns {string} prompt, or '' when there is no question to ask about
 */
export function buildWhyWrongPrompt(miss = {}) {
  const question = clean(miss.question, LIMITS.question);
  if (!question) return '';

  const userAnswer = clean(miss.userAnswer, LIMITS.answer);
  const correctAnswer = clean(miss.correctAnswer, LIMITS.answer);
  const explanation = clean(miss.explanation, LIMITS.explanation);
  const subject = clean(miss.subject, 80);
  const unit = clean(miss.unit, 80);

  const stimulus = clean(miss.stimulus, LIMITS.stimulus);

  const lines = [];
  lines.push(
    wasSkipped(userAnswer)
      ? "I skipped this question on a practice test and I want to understand it."
      : "I got this question wrong on a practice test and I want to understand why."
  );
  lines.push('');
  if (subject) lines.push(`Subject: ${subject}${unit ? ` — ${unit}` : ''}`);
  // Without this, questions that say "described in the stimulus" reached the
  // tutor with the stimulus missing, and it had to guess what the source said.
  if (stimulus) lines.push(`Stimulus: ${stimulus}`);
  lines.push(`Question: ${question}`);
  if (userAnswer) lines.push(`My answer: ${userAnswer}`);
  if (correctAnswer) lines.push(`Correct answer: ${correctAnswer}`);
  if (explanation) lines.push(`Explanation I was given: ${explanation}`);
  lines.push('');
  lines.push(
    userAnswer
      ? "Don't just restate the correct answer — tell me what misconception would lead someone to pick my answer, then how to recognise this question type next time."
      : "Walk me through how to approach this question type from scratch, then tell me the one thing to check so I don't get stuck on it again."
  );

  return lines.join('\n');
}

/**
 * Normalise a PracticeTests `question` + `questionResults` entry into the shape
 * buildWhyWrongPrompt wants.
 *
 * MCQ answers are stored as option *indices*, which mean nothing to a tutor, so
 * they're rendered as "C) <option text>". Free-response questions have no single
 * correct answer, so the AI feedback carries the explanation instead.
 */
/**
 * MCQ options are normally plain strings, but the >900KB payload-trim path in
 * PracticeTests rewrites them as `{ text, correct }`. Coerce both, or a trimmed
 * test would render its choices as "[object Object]".
 */
export function optionText(o) {
  if (o === null || o === undefined) return '';
  if (typeof o === 'string') return o;
  if (typeof o === 'object') return String(o.text ?? o.label ?? o.value ?? '');
  return String(o);
}

export function missFromResult(question = {}, result = {}, subject = '') {
  const options = (Array.isArray(question.options) ? question.options : []).map(optionText);
  const asChoice = (i) => {
    // Guard before Number(): Number(null) and Number('') are both 0, which would
    // report an unanswered question as "A)" — the same skipped-counted-as-wrong
    // bug class as A18, and worse here because it invents the student's answer.
    if (i === null || i === undefined || i === '') return '';
    const idx = Number(i);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) return '';
    return `${String.fromCharCode(65 + idx)}) ${options[idx]}`;
  };

  const isMcq = question.type === 'mcq' && options.length > 0;
  // result.correctAnswer wins — ResultsPanel treats it as authoritative — but
  // older saved tests only carry it on the question.
  const correctIdx = result.correctAnswer !== undefined && result.correctAnswer !== null
    ? result.correctAnswer
    : question.correctAnswer;

  return {
    subject,
    unit: question.unit || null,
    stimulus: question.stimulus || '',
    question: question.question || question.prompt || '',
    userAnswer: isMcq ? asChoice(result.userAnswer) : result.userAnswer,
    correctAnswer: isMcq ? asChoice(correctIdx) : '',
    explanation: result.feedback || question.explanation || '',
  };
}

/**
 * Full answer-choice breakdown: why the right answer is right, and why each
 * other option is wrong.
 *
 * Distinct from buildWhyWrongPrompt, which diagnoses one specific mistake.
 * Knowing why B is wrong is what stops you picking B on the next question that
 * offers it — and that's worth knowing even when you got this one right, which
 * is why this is offered on correct answers too.
 */
export function buildExplainAllPrompt(card = {}) {
  const question = clean(card.question, LIMITS.question);
  if (!question) return '';

  const options = Array.isArray(card.options) ? card.options : [];
  if (!options.length) return buildWhyWrongPrompt(card);

  const stimulus = clean(card.stimulus, LIMITS.stimulus);
  const subject = clean(card.subject, 80);
  const correctIdx = Number.isInteger(card.correctIndex) ? card.correctIndex : null;
  const letter = (i) => String.fromCharCode(65 + i);

  const lines = [];
  lines.push('Break down every answer choice on this practice question.');
  lines.push('');
  if (subject) lines.push(`Subject: ${subject}`);
  if (stimulus) lines.push(`Stimulus: ${stimulus}`);
  lines.push(`Question: ${question}`);
  lines.push('');
  lines.push('Answer choices:');
  options.forEach((o, i) => {
    const mark = correctIdx === i ? '  [correct]' : '';
    lines.push(`${letter(i)}) ${clean(o, 300)}${mark}`);
  });
  const explanation = clean(card.explanation, LIMITS.explanation);
  if (explanation) {
    lines.push('');
    lines.push(`Explanation I was given: ${explanation}`);
  }
  lines.push('');
  lines.push(
    'For each choice, give one or two sentences: for the correct one say what makes it right, ' +
    'and for every wrong one say specifically what is wrong with it and what misconception would ' +
    'make someone pick it. Use the format "A) …" on its own line for each. Do not skip any choice.'
  );

  return lines.join('\n');
}

export default buildWhyWrongPrompt;
