/**
 * Leaderboard credit for one saved practice test.
 *
 * Pure (no firebase), so the class-record-test function and its tests share one
 * copy. The function feeds it the practiceTests doc as stored in Firestore.
 *
 * What it can and cannot check. Multiple-choice answers are re-marked here
 * against the answer key saved with the test, so a client that claims "10/10"
 * next to ten wrong answers gets the real number. Written responses were graded
 * by the AI in the browser; the stored grade is used, clamped to its own
 * maximum, because there is nothing server-side to re-grade them with. And the
 * test doc itself, answer key included, is written by the student's browser, so
 * a student who forges a whole fake test can still inflate their score. Closing
 * that needs tests generated and graded on the server.
 */

/** A test longer than this is not a real practice test. */
const MAX_QUESTIONS = 200;

/** Same rule as src/utils/whyWrong.js wasSkipped: blank means skipped. */
function wasSkipped(answer) {
  return answer === null || answer === undefined || String(answer).trim() === '';
}

/**
 * @param {object} test  practiceTests doc data
 * @returns {{answered:number, correct:number} | null}  null when the doc is not
 *   a scoreable test (missing or oversized question list)
 */
function scoreSavedTest(test) {
  const questions = test && Array.isArray(test.questions) ? test.questions : null;
  if (!questions || questions.length > MAX_QUESTIONS) return null;

  // Firestore turns numeric map keys into strings, so look up both ways.
  const answers = test.userAnswers && typeof test.userAnswers === 'object' ? test.userAnswers : {};
  const results = Array.isArray(test.results && test.results.questionResults)
    ? test.results.questionResults
    : [];
  const resultById = new Map(results.map((r) => [String(r && r.questionId), r]));

  let answered = 0;
  let correct = 0;
  const seen = new Set();

  for (const q of questions) {
    if (!q) continue;
    const id = String(q.id);
    if (seen.has(id)) continue; // a duplicated id must not count twice
    seen.add(id);

    const answer = answers[id] !== undefined ? answers[id] : answers[q.id];
    if (wasSkipped(answer)) continue; // skipping is not answering wrong

    const result = resultById.get(id);
    // The grader was down: PracticeTests leaves these out of the score.
    if (result && result.ungraded) continue;

    if (q.type === 'mcq') {
      answered += 1;
      // Same comparison PracticeTests' scoreQuestion uses.
      if (q.correctAnswer !== null && q.correctAnswer !== undefined && answer === q.correctAnswer) {
        correct += 1;
      }
      continue;
    }

    // Written response: trust the stored AI grade only as far as it is
    // internally consistent. No result means it was never graded.
    if (!result) continue;
    const max = Number(result.maxPoints);
    const score = Number(result.score);
    if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(score)) continue;
    answered += 1;
    if (score >= max) correct += 1;
  }

  return { answered, correct };
}

module.exports = { scoreSavedTest, wasSkipped, MAX_QUESTIONS };
