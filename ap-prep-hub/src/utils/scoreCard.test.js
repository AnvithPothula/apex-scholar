import {
  verdictFor,
  scoreCardLines,
  shareCaption,
  scoreCardFilename,
  scoreColor,
} from './scoreCard';

const result = (over = {}) => ({
  model: { label: 'AP Biology' },
  score: 4,
  composite: 80,
  compositeMax: 120,
  percent: 67,
  next: { nextScore: 5, pointsNeeded: 13 },
  ...over,
});

describe('verdictFor', () => {
  it('uses College Board wording for every score', () => {
    expect(verdictFor(5)).toBe('Extremely well qualified');
    expect(verdictFor(3)).toBe('Qualified');
    expect(verdictFor(1)).toBe('No recommendation');
  });

  it('says nothing for a score that does not exist', () => {
    expect(verdictFor(0)).toBe('');
    expect(verdictFor(undefined)).toBe('');
  });
});

describe('scoreCardLines', () => {
  it('uses the real field names from pointsToNextScore', () => {
    // scoreFor returns { nextScore, pointsNeeded }. Guessing { score, points }
    // renders "undefined more points for a undefined" on a shared image.
    const l = scoreCardLines({ subject: 'AP Biology', result: result() });
    expect(l.next).not.toMatch(/undefined/);
  });

  it('builds the card content from a score result', () => {
    const l = scoreCardLines({ subject: 'AP Biology', result: result() });
    expect(l.subject).toBe('AP Biology');
    expect(l.score).toBe(4);
    expect(l.composite).toBe('80 / 120 composite');
    expect(l.next).toBe('13 more points for a 5');
  });

  it('singularises a one-point gap', () => {
    const l = scoreCardLines({ subject: 'AP Biology', result: result({ next: { nextScore: 5, pointsNeeded: 1 } }) });
    expect(l.next).toBe('1 more point for a 5');
  });

  it('drops the next-score line at a 5', () => {
    // There is nothing above a 5 to reach for.
    const l = scoreCardLines({ subject: 'AP Biology', result: result({ score: 5, next: null }) });
    expect(l.next).toBeNull();
  });

  it('always carries the estimate disclaimer', () => {
    // The whole point: a cropped screenshot must not be able to lose this.
    expect(scoreCardLines({ subject: 'AP Biology', result: result() }).disclaimer)
      .toMatch(/does not publish/i);
  });

  it('falls back to the model label when no subject is passed', () => {
    expect(scoreCardLines({ result: result() }).subject).toBe('AP Biology');
  });

  it('returns null rather than a blank card when there is no result', () => {
    expect(scoreCardLines({ subject: 'AP Biology', result: null })).toBeNull();
  });
});

describe('shareCaption', () => {
  it('repeats the card numbers so the two cannot disagree', () => {
    const c = shareCaption(scoreCardLines({ subject: 'AP Biology', result: result() }));
    expect(c).toContain('AP Biology: estimated 4/5');
    expect(c).toContain('80 / 120 composite');
    expect(c).toMatch(/projection, not a result/);
  });

  it('handles a missing card', () => {
    expect(shareCaption(null)).toBe('');
  });
});

describe('scoreCardFilename', () => {
  it('slugifies the subject', () => {
    expect(scoreCardFilename('AP U.S. History')).toBe('ap-u-s-history-score-card.png');
  });

  it('never produces a bare or dangling name', () => {
    expect(scoreCardFilename('')).toBe('ap-score-card.png');
    expect(scoreCardFilename('!!!')).toBe('ap-score-card.png');
  });
});

describe('scoreColor', () => {
  it('greens a pass and reds a fail', () => {
    expect(scoreColor(5)).toBe(scoreColor(4));
    expect(scoreColor(2)).toBe(scoreColor(1));
    expect(scoreColor(3)).not.toBe(scoreColor(5));
  });
});
