import { rankMembers } from './classes';

jest.mock('../config/firestoreLazy', () => ({ loadFirestore: jest.fn() }));

it('ranks real samples by accuracy, small samples after them, idle members last', () => {
  const row = (uid, correct, answered) => ({ uid, correctAnswers: correct, questionsAnswered: answered, accuracy: answered ? Math.round((correct / answered) * 100) : null });
  const order = rankMembers([row('tiny', 2, 3), row('idle', 0, 0), row('steady', 5, 16), row('strong', 15, 20)]).map((r) => r.uid);
  expect(order).toEqual(['strong', 'steady', 'tiny', 'idle']);
});
