/**
 * Email categories a student can turn off one by one (Settings, and the page
 * behind the unsubscribe link). Keys are a contract with
 * netlify/lib/emailPrefs.js; emailPrefs.test.js fails if they drift.
 */
export const EMAIL_CATEGORIES = {
  weekly: 'Weekly digest on Sundays: what you did, reviews due, exam countdown',
  examWeek: 'A short daily reminder in the final week before each of your exams',
  announcements: 'Occasional announcements: new subjects and features',
};
