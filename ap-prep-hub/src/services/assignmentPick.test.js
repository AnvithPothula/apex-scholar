import { pickItemIds, scoreOf } from './classAssignments';

const server = require('../../netlify/lib/assignmentPick');
const { markMcq } = require('../../netlify/functions/class-assignment-submit');

jest.mock('./ai/mcqGenerator', () => ({ generateMcqs: jest.fn() }));
jest.mock('./geminiService', () => ({}));
jest.mock('./classes', () => ({ getMyClasses: jest.fn() }));

const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

test('a bank draw is stable per student, differs between students, and matches the server', () => {
  const cfg = { mode: 'bank', perStudent: 3 };
  const one = pickItemIds(ids, cfg, 'student-1', 'hw1');
  expect(one).toHaveLength(3);
  expect(pickItemIds(ids, cfg, 'student-1', 'hw1')).toEqual(one);
  expect(one.every((id, i, arr) => i === 0 || ids.indexOf(arr[i - 1]) < ids.indexOf(id))).toBe(true);
  const draws = new Set(['s1', 's2', 's3', 's4', 's5', 's6'].map((u) => pickItemIds(ids, cfg, u, 'hw1').join()));
  expect(draws.size).toBeGreaterThan(1);
  for (const u of ['s1', 's2', 'x9', 'student-1']) {
    expect(pickItemIds(ids, cfg, u, 'hw1')).toEqual(server.pickItemIds(ids, cfg, u, 'hw1'));
  }
  expect(pickItemIds(ids, { mode: 'same' }, 'u', 'a')).toEqual(ids);
  expect(pickItemIds(ids, { mode: 'bank', perStudent: 20 }, 'u', 'a')).toEqual(ids);
});

test('the server marks only the student\'s multiple-choice items against the key', () => {
  const items = [{ id: 'a', type: 'mcq' }, { id: 'b', type: 'mcq' }, { id: 'c', type: 'frq' }, { id: 'd', type: 'mcq' }];
  const key = { a: { correctIndex: 2 }, b: { correctIndex: 0 }, d: { correctIndex: 1 } };
  const r = markMcq(['a', 'b', 'c'], items, key, { a: 2, b: '3', c: 'essay' });
  expect(r).toMatchObject({ score: 1, max: 2 });
  expect(r.results.a.correct).toBe(true);
  expect(r.results.b).toMatchObject({ chosen: 3, correct: false });
  expect(r.results.d).toBeUndefined();
  expect(markMcq(['a'], items, key, {}).results.a).toMatchObject({ chosen: null, correct: false });
});

test('a teacher override beats the automatic score', () => {
  expect(scoreOf({ mcqScore: 3, mcqMax: 5, frqGrades: { x: { score: 2, maxPoints: 4 } } })).toEqual({ score: 5, max: 9, by: 'auto' });
  expect(scoreOf({ mcqScore: 3, mcqMax: 5, frqGrades: { x: { score: 2, maxPoints: 4 } }, teacherScore: 8 })).toEqual({ score: 8, max: 9, by: 'teacher' });
  expect(scoreOf({ status: 'done' })).toBeNull();
});
