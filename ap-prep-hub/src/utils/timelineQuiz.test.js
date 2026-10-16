import { pickQuizEvents } from './timelineQuiz';
import usHistory from '../data/timelines/usHistory';

it('picks one event per decade from the chosen unit, in true order', () => {
  const quiz = pickQuizEvents(usHistory.events, usHistory.periods, 2, 5, () => 0.42);
  expect(quiz).toHaveLength(5);
  expect(new Set(quiz.map((q) => q.year)).size).toBe(5);
  expect(quiz.map((q) => q.year)).toEqual([...quiz.map((q) => q.year)].sort((a, b) => a - b));
  const unit2 = new Set(usHistory.events.filter((e) => e.unit === 2).map((e) => e.text));
  expect(quiz.every((q) => unit2.has(q.label))).toBe(true);
});

it('uses fewer events when a unit has fewer decades', () => {
  expect(pickQuizEvents(usHistory.events, usHistory.periods, 1).length).toBe(4);
});
