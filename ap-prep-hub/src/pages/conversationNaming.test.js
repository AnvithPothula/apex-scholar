import { nextSessionNumber } from './conversationNaming';

describe('nextSessionNumber', () => {
  it('starts at 1 with no conversations', () => {
    expect(nextSessionNumber([])).toBe(1);
    expect(nextSessionNumber()).toBe(1);
  });

  it('continues from the highest existing session', () => {
    expect(nextSessionNumber([
      { name: 'AP Biology - Session 1' },
      { name: 'AP Biology - Session 2' },
    ])).toBe(3);
  });

  it('does not reuse a name after a delete', () => {
    // The bug: with `length + 1`, deleting Session 1 left [Session 2] and the
    // next new chat was ALSO called Session 2.
    expect(nextSessionNumber([{ name: 'AP Biology - Session 2' }])).toBe(3);
  });

  it('ignores renamed conversations without a session suffix', () => {
    expect(nextSessionNumber([
      { name: 'Photosynthesis questions' },
      { name: 'AP Biology - Session 4' },
    ])).toBe(5);
  });

  it('tolerates missing or malformed names', () => {
    expect(nextSessionNumber([{}, { name: null }, { name: 'Session abc' }])).toBe(1);
  });
});
