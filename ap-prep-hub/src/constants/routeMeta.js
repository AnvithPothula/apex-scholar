/**
 * Per-route title, description and canonical for the app's public routes.
 *
 * Every SPA route served `build/index.html`, whose head hardcodes
 * `<link rel="canonical" href="https://apex-scholar.com/">`. Nine indexed-able
 * URLs therefore told Google "I am really the homepage", so Google consolidated
 * all nine into `/` and indexed one page instead of nine. Search Console on
 * 2026-09-17: **2 indexed, 12 not**, impressions flat at ~5/day since June.
 *
 * `useDocumentMeta` already did this job correctly and had exactly one caller
 * (ScoreCalculator). This is the table that gives it the rest.
 *
 * Titles are kept at or under 65 characters, the point where Google starts
 * truncating in the SERP — same rule `pageMeta.test.js` enforces for the
 * calculator pages.
 *
 * Score-calculator paths are deliberately absent: ScoreCalculator.jsx sets its
 * own per-subject meta and must stay the single writer for those, or the two
 * would race on every navigation.
 */
export const ROUTE_META = {
  '/': {
    // Deliberately identical to the <title> in public/index.html. The homepage
    // is one of only two pages Google currently has indexed; changing its title
    // while fixing an indexing bug would confound the two changes and make the
    // recovery unreadable. It is 71 characters, past the 65-char truncation
    // point, and worth shortening — but as its own change, measured on its own.
    title: 'Apex Scholar — AI Tutors, Practice Tests & Smart Scheduler for AP Exams',
    description:
      'Free AP exam prep: subject-specific AI tutors, generated practice tests, flashcards with spaced repetition, and a study scheduler. No cost, no ads.',
  },
  '/ai-tutors': {
    title: 'AI Tutors for Every AP Subject — Apex Scholar',
    description:
      'Chat with an AI tutor trained on the College Board curriculum for your AP subject. Ask questions, walk through problems, and check your reasoning — free.',
  },
  '/practice-tests': {
    title: 'AP Practice Tests, Generated and Scored — Apex Scholar',
    description:
      'Generate AP practice tests by subject and unit, answer them timed, and get scored feedback with an explanation for every choice.',
  },
  '/smart-scheduler': {
    title: 'AP Study Scheduler with Schoology Sync — Apex Scholar',
    description:
      'Build a study plan around your real assignments and AP exam dates. Syncs with Schoology so your schedule reflects what is actually due.',
  },
  '/flashcards': {
    title: 'AP Flashcards with Spaced Repetition — Apex Scholar',
    description:
      'Create, study and share AP flashcard decks. Spaced repetition brings each card back exactly when you are about to forget it.',
  },
  '/solver': {
    title: 'AP Problem Solver — Photo or Text — Apex Scholar',
    description:
      'Photograph a problem or type it in and get a worked solution, step by step, for AP maths and science.',
  },
  '/practice': {
    title: 'AP Practice Hub — Tests, Flashcards, Review — Apex Scholar',
    description:
      'One place for AP practice: generated tests, flashcard decks, and a review queue built from the questions you got wrong.',
  },
  '/login': {
    // In the sitemap, so it needs its own canonical like any other URL.
    // Low search value, but a login page silently claiming to be the homepage
    // is exactly the bug this table exists to remove.
    title: 'Sign in — Apex Scholar',
    description: 'Sign in to Apex Scholar to save your progress, decks and study schedule across devices.',
  },
  '/privacy': {
    title: 'Privacy Policy — Apex Scholar',
    description: 'What Apex Scholar collects, why, and how to delete it.',
  },
  '/terms': {
    title: 'Terms of Service — Apex Scholar',
    description:
      'The terms that apply to using Apex Scholar, including acceptable use, account responsibilities and limits of liability.',
  },

  // Signed-in pages. Not in the sitemap, but useDocumentMeta never resets, so
  // without an entry a client-side hop from /flashcards to /progress left the
  // tab titled "AP Flashcards…" (and GA logged the page view under that title).
  '/progress': {
    title: 'Your Progress — Apex Scholar',
    description: 'Accuracy, streaks, weekly activity and measured weak spots across every AP subject you practise.',
  },
  '/review': {
    title: 'Review Queue — Apex Scholar',
    description: 'Spaced-repetition review of every practice question you missed, scheduled to come back before you forget it.',
  },
  '/classes': {
    title: 'Classes — Apex Scholar',
    description: 'Join a class or club with a link and compare practice-test accuracy on a shared leaderboard.',
  },
  '/diagnostics': {
    title: 'Diagnostics — Apex Scholar',
    description: 'A short diagnostic per AP subject that pinpoints which units you already know and which need work.',
  },
  '/settings': {
    title: 'Settings — Apex Scholar',
    description: 'Choose your AP subjects, personalise the AI tutor, and manage email preferences and integrations.',
  },
};

/** Meta for a path, or null when the route manages its own. */
export function metaFor(pathname) {
  if (!pathname) return null;
  // Trailing slashes are the same page; Netlify serves both.
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return ROUTE_META[p] || null;
}
