jest.mock('./responseLog', () => ({ logResponses: jest.fn() }));
jest.mock('./srs', () => ({ addMisses: jest.fn() }));
// eslint-disable-next-line import/first
import { logResponses } from './responseLog';
// eslint-disable-next-line import/first
import { addMisses } from './srs';
// eslint-disable-next-line import/first
import { queueAnswer, flushOutbox } from './lessonOutbox';

describe('lesson outbox', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('sends a whole lesson as one write and one queue update', () => {
    expect(queueAnswer('u1', { itemId: 'a' })).toBe(1);
    expect(queueAnswer('u1', { itemId: 'b' }, { question: 'b?' })).toBe(2);
    queueAnswer('u1', { itemId: 'c' }, { question: 'c?' });
    flushOutbox('u1');
    expect(logResponses).toHaveBeenCalledTimes(1);
    expect(logResponses.mock.calls[0][1]).toHaveLength(3);
    expect(addMisses).toHaveBeenCalledTimes(1);
    expect(addMisses.mock.calls[0][1]).toHaveLength(2);
  });

  it('keeps what a closed tab never sent, and sends it once', () => {
    queueAnswer('u1', { itemId: 'a' });
    // The page went away here. Next visit:
    flushOutbox('u1');
    flushOutbox('u1');
    expect(logResponses).toHaveBeenCalledTimes(1);
  });

  it('keeps accounts apart and ignores guests', () => {
    queueAnswer('u1', { itemId: 'a' });
    expect(queueAnswer(null, { itemId: 'g' })).toBe(0);
    flushOutbox('u2');
    expect(logResponses).not.toHaveBeenCalled();
    flushOutbox('u1');
    expect(logResponses.mock.calls[0][0]).toBe('u1');
  });
});
