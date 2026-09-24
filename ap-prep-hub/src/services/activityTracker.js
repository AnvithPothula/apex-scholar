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
    fullLength = false,
  } = info;

  await Promise.all([
    safely('practice test achievement', () =>
      achievementsService.trackActivity(userId, 'complete_practice_test', {
        score: scorePercent,
        subject,
        fullLength,
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
  const { subject = '', cardsStudied = 0, durationMinutes = 0, accuracy, deckId, perfect = false } = info;
  await Promise.all([
    safely('flashcard achievement', () =>
      // perfectScore feeds "Perfect Deck" (every card of a deck right).
      achievementsService.trackActivity(userId, 'study_flashcard', { count: cardsStudied, perfectScore: perfect })
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
        // Progress averages session accuracy; dropping it here zeroed it.
        ...(Number.isFinite(accuracy) ? { accuracy } : {}),
        ...(deckId ? { deckId } : {}),
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
      // 'review_card' is what the Review achievements count. This tracked
      // 'study_flashcard', so "Second Look" and "Spaced Out" could never unlock.
      achievementsService.trackActivity(userId, 'review_card', { count: cardsReviewed })
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

/**
 * A one-off Review milestone: 'comeback' (a card finally right after 3+
 * misses) or 'queue_cleared' (every due card reviewed).
 */
export async function recordReviewEvent(userId, event) {
  if (!userId || !['comeback', 'queue_cleared'].includes(event)) return;
  await safely(`review ${event}`, () => achievementsService.trackActivity(userId, event));
}

/** A new flashcard deck (AI, manual or imported). Counter only. */
export async function recordDeckCreated(userId) {
  if (!userId) return;
  await safely('deck created', () =>
    achievementsService.trackActivity(userId, 'create_flashcard_deck')
  );
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
  recordDeckCreated,
  recordReviewEvent,
  recordSolve,
};

export default activityTracker;
