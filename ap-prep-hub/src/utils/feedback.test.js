import { areaForPath, formatFeedback } from './feedback';
import { TYPES, AREAS, ROLES, GRADES } from '../../netlify/lib/feedback';
import { FEEDBACK_TYPES, AREAS as UI_AREAS, ROLES as UI_ROLES, GRADES as UI_GRADES } from './feedback';

it('starts the form on the part of the app they were using', () => {
  expect(areaForPath('/study/ap-biology/unit-1')).toBe('learn');
  expect(areaForPath('/practice-tests')).toBe('practice-tests');
  expect(areaForPath('/practice')).toBe('practice-tests');
  expect(areaForPath('/ai-tutors/ap-us-history')).toBe('tutors');
  expect(areaForPath('/')).toBe('whole-app');
});

it('offers only values the server keeps', () => {
  expect(FEEDBACK_TYPES.map((t) => t.value).every((v) => TYPES.includes(v))).toBe(true);
  expect(UI_AREAS.map((a) => a.value).every((v) => AREAS.includes(v))).toBe(true);
  expect(UI_ROLES.map((r) => r.value).every((v) => ROLES.includes(v))).toBe(true);
  expect(UI_GRADES.map((g) => g.value).every((v) => GRADES.includes(v))).toBe(true);
});

it('writes the optional answers only when given', () => {
  const text = formatFeedback({ type: 'feature', area: 'learn', rating: 4, message: 'Add Unit 3', details: 'Study for my test', contactOk: false }, null);
  expect(text).toContain('Rating: 4/5 (Good)');
  expect(text).toContain('What would it help you do?');
  expect(text).not.toContain('About them');
  expect(formatFeedback({ type: 'praise', message: 'Nice', role: 'student', grade: '11' }, null)).toContain('About them: Student · grade 11th');
});
