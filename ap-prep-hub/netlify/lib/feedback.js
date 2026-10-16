/**
 * Feedback form validation, shared by netlify/functions/feedback.js and its
 * tests. Pure (no firebase). Everything optional is dropped when empty, and
 * every string is capped, so a doc can't be used to store arbitrary blobs.
 */

const TYPES = ['suggestion', 'confusing', 'feature', 'praise', 'content', 'other'];
const AREAS = ['learn', 'tutors', 'practice-tests', 'review', 'flashcards', 'scheduler', 'solver',
  'diagnostics', 'score-calculator', 'classes', 'progress', 'settings', 'whole-app', 'other'];
const ROLES = ['student', 'teacher', 'parent', 'other'];
const GRADES = ['9', '10', '11', '12', 'other'];

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = (v, list) => (list.includes(v) ? v : null);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns { doc } ready to store, or { error } naming what's missing.
 * `uid` comes from a verified ID token (or null for a guest), never the body.
 */
function normalizeFeedback(body, uid = null) {
  const b = body && typeof body === 'object' ? body : {};
  const type = pick(b.type, TYPES);
  const message = str(b.message, 4000);
  if (!type) return { error: 'Choose what kind of feedback this is' };
  if (!message) return { error: 'Write a message' };
  const rating = Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 5 ? b.rating : null;
  const email = str(b.email, 254);
  const doc = {
    type,
    message,
    summary: str(b.summary, 140) || null,
    details: str(b.details, 2000) || null,
    area: pick(b.area, AREAS),
    rating,
    role: pick(b.role, ROLES),
    grade: pick(b.grade, GRADES),
    subjects: str(b.subjects, 300) || null,
    contactOk: b.contactOk === true,
    email: EMAIL.test(email) ? email : null,
    page: str(b.page, 300) || null,
    device: b.device && typeof b.device === 'object' ? {
      browser: str(b.device.browser, 300) || null,
      viewport: str(b.device.viewport, 40) || null,
      appVersion: str(b.device.appVersion, 40) || null,
      theme: str(b.device.theme, 20) || null,
    } : null,
    uid: uid || null,
    status: 'new',
  };
  return { doc };
}

module.exports = { normalizeFeedback, TYPES, AREAS, ROLES, GRADES };
