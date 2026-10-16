/**
 * Feedback form options and formatting. Values must match the server's
 * allow-lists in netlify/lib/feedback.js, which drops anything else.
 */

export const FEEDBACK_TYPES = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'confusing', label: 'Something was confusing' },
  { value: 'feature', label: 'Feature request' },
  { value: 'content', label: 'Wrong or unclear content' },
  { value: 'praise', label: 'Something I liked' },
  { value: 'other', label: 'Other' },
];

// Optional follow-up question per type; types not listed have none.
export const TYPE_DETAILS = {
  confusing: { label: 'What did you expect instead?', placeholder: 'e.g. I thought Review would only show this unit' },
  feature: { label: 'What would it help you do?', placeholder: 'e.g. Study for a unit test the night before' },
  content: { label: 'Where exactly?', placeholder: 'Course, unit, and the question or sentence (paste it if you can)' },
};

export const MESSAGE_PLACEHOLDER = {
  suggestion: 'What should we change, and why?',
  confusing: 'What were you trying to do, and what happened?',
  feature: 'Describe what you would like Apex Scholar to do.',
  content: "What's wrong or unclear, and what should it say?",
  praise: 'What worked well for you?',
  other: 'Tell us anything.',
};

export const AREAS = [
  { value: 'learn', label: 'Learn (lessons, timelines)', paths: ['/study'] },
  { value: 'tutors', label: 'AI Tutors', paths: ['/ai-tutors'] },
  { value: 'practice-tests', label: 'Practice tests', paths: ['/practice-tests', '/practice'] },
  { value: 'review', label: 'Review', paths: ['/review'] },
  { value: 'flashcards', label: 'Flashcards', paths: ['/flashcards'] },
  { value: 'scheduler', label: 'Scheduler', paths: ['/smart-scheduler'] },
  { value: 'solver', label: 'Solver', paths: ['/solver'] },
  { value: 'diagnostics', label: 'Diagnostics', paths: ['/diagnostics', '/start'] },
  { value: 'score-calculator', label: 'Score calculator', paths: ['/ap-score-calculator'] },
  { value: 'classes', label: 'Classes', paths: ['/classes', '/join'] },
  { value: 'progress', label: 'Progress', paths: ['/progress'] },
  { value: 'settings', label: 'Settings', paths: ['/settings'] },
  { value: 'whole-app', label: 'The whole app' },
  { value: 'other', label: 'Something else' },
];

export const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Other' },
];

export const GRADES = [
  { value: '9', label: '9th' }, { value: '10', label: '10th' }, { value: '11', label: '11th' },
  { value: '12', label: '12th' }, { value: 'other', label: 'Other' },
];

export const RATING_LABELS = ['', 'Not working for me', 'Needs work', 'Okay', 'Good', 'Great'];

/** The area a page belongs to, so the form starts on the page they were on. */
export function areaForPath(pathname = '') {
  const hit = AREAS.find((a) => a.paths?.some((p) => pathname === p || pathname.startsWith(`${p}/`)));
  return hit ? hit.value : 'whole-app';
}

const labelOf = (list, v) => list.find((o) => o.value === v)?.label || v || 'Not given';

/** Plain-text body for the email copy. Exported for tests. */
export function formatFeedback(f, device) {
  const lines = [
    `Type: ${labelOf(FEEDBACK_TYPES, f.type)}`,
    `Area: ${labelOf(AREAS, f.area)}`,
    `Rating: ${f.rating ? `${f.rating}/5 (${RATING_LABELS[f.rating]})` : 'Not given'}`,
    '',
    f.message?.trim() || '',
  ];
  if (TYPE_DETAILS[f.type] && f.details?.trim()) lines.push('', `${TYPE_DETAILS[f.type].label}`, f.details.trim());
  const about = [f.role && labelOf(ROLES, f.role), f.grade && `grade ${labelOf(GRADES, f.grade)}`, f.subjects?.trim()].filter(Boolean);
  if (about.length) lines.push('', `About them: ${about.join(' · ')}`);
  lines.push('', `OK to contact: ${f.contactOk ? `yes${f.email ? ` (${f.email})` : ''}` : 'no'}`);
  if (device) lines.push('', '--- Page and device ---', `Page: ${device.page}`, `App version: ${device.appVersion}`, `Browser: ${device.browser}`, `Viewport: ${device.viewport} · Theme: ${device.theme}`);
  return lines.join('\n');
}
