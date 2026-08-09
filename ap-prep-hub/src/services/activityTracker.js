/**
 * Records what the student actually did, so streaks, the weekly chart and
 * achievements have something to read.
 *
 * All three of those features were fully built and completely unwired:
 *   - `achievementsService.trackActivity` had ZERO callers app-wide, so no
 *     achievement could ever unlock and the streak never advanced.
 *   - `dataService.saveStudySession` had exactly ONE caller — creating a manual
 *     flashcard deck — so "study sessions" recorded deck authoring and nothing
 *     else. Taking a test, studying cards, and reviewing all recorded nothing.
 *
 * Everything here is fire-and-forget and swallows its own errors on purpose:
 * failing to log a streak must never break submitting a test or finishing a
 * deck. The study data is the product; the gamification is decoration.
 */

import achievementsService from './achievementsService';
import dataService from './dataService';

/** Never throws, never blocks the caller. */
async function safely(label, fn) {
  try {
    await fn();
  } catch (e) {
    console.debug(`[activity] ${label} failed (non-fatal)`, e?.message || e);
  }
}

/**
 * A finished practice test.
 * @param {string} userId
 * @param {object} info { subject, questionsAnswered, correctAnswers, durationMinutes, scorePercent }
 */
export async function recordPracticeTest(userId, info = {}) {
  if (!userId) return;
  const {
    subject = '',
    questionsAnswered = 0,
    correctAnswers = 0,
    durationMinutes = 0,
    scorePercent = null,
  } = info;

  await Promise.all([
    safely('practice test achievement', () =>
      achievementsService.trackActivity(userId, 'complete_practice_test', {
        score: scorePercent,
        subject,
      })
    ),
    // A test is also a study session — that's what advances the streak.
    safely('practice test streak', () =>
      achievementsService.trackActivity(userId, 'study_session', { subject })
    ),
    safely('practice test session', () =>
      dataService.saveStudySession(userId, {
        type: 'practice_test',
        subject,
        questionsAnswered,
        correctAnswers,
        duration: durationMinutes,
      })
    ),
  ]);

  if (subject) {
    await safely('subject breadth', () =>
      achievementsService.trackActivity(userId, 'study_subject', { subject })
    );
  }
}

/** A finished flashcard study run. */
export async function recordFlashcardStudy(userId, info = {}) {
  if (!userId) return;
  const { subject = '', cardsStudied = 0, durationMinutes = 0 } = info;
  await Promise.all([
    safely('flashcard achievement', () =>
      achievementsService.trackActivity(userId, 'study_flashcard', { count: cardsStudied })
    ),
    safely('flashcard streak', () =>
      achievementsService.trackActivity(userId, 'study_session', { subject })
    ),
    safely('flashcard session', () =>
      dataService.saveStudySession(userId, {
        type: 'flashcards',
        subject,
        cardsStudied,
        duration: durationMinutes,
      })
    ),
  ]);
}

/** A finished spaced-repetition review run. */
export async function recordReviewSession(userId, info = {}) {
  if (!userId) return;
  const { cardsReviewed = 0, subject = '' } = info;
  await Promise.all([
    safely('review achievement', () =>
      achievementsService.trackActivity(userId, 'study_flashcard', { count: cardsReviewed })
    ),
    safely('review streak', () =>
      achievementsService.trackActivity(userId, 'study_session', { subject })
    ),
    safely('review session', () =>
      dataService.saveStudySession(userId, {
        type: 'review',
        subject,
        cardsStudied: cardsReviewed,
        duration: 0,
      })
    ),
  ]);
}

/** One message sent to an AI tutor. Counter only — not a study session. */
export async function recordTutorMessage(userId, subject = '') {
  if (!userId) return;
  await safely('tutor message', () =>
    achievementsService.trackActivity(userId, 'ai_chat_message', { subject })
  );
}

/** One problem run through the solver. Counter only. */
export async function recordSolve(userId) {
  if (!userId) return;
  await safely('solve', () => achievementsService.trackActivity(userId, 'solve_problem'));
}

const activityTracker = {
  recordPracticeTest,
  recordFlashcardStudy,
  recordReviewSession,
  recordTutorMessage,
  recordSolve,
};

export default activityTracker;
