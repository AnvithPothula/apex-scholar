import { parseQuizletExport, separatorLabel } from './quizletImport';

describe('parseQuizletExport', () => {
  it('parses the Quizlet default: tab between term/definition, newline between cards', () => {
    const { cards, termSeparator } = parseQuizletExport(
      'osmosis\tmovement of water\nmitosis\tcell division'
    );
    expect(termSeparator).toBe('\t');
    expect(cards).toEqual([
      { front: 'osmosis', back: 'movement of water' },
      { front: 'mitosis', back: 'cell division' },
    ]);
  });

  it('handles comma separators', () => {
    const { cards } = parseQuizletExport('osmosis,water movement\nmitosis,cell division');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toEqual({ front: 'osmosis', back: 'water movement' });
  });

  it('handles blank-line-separated cards', () => {
    const { cards } = parseQuizletExport('a\tone\n\nb\ttwo\n\nc\tthree');
    expect(cards).toHaveLength(3);
  });

  it('keeps commas inside the definition when tab is the term separator', () => {
    const { cards } = parseQuizletExport('photosynthesis\tlight, water, and CO2');
    expect(cards[0].back).toBe('light, water, and CO2');
  });

  it('splits on the FIRST separator only, so definitions may contain it', () => {
    const { cards } = parseQuizletExport('term,def, with, commas');
    expect(cards[0]).toEqual({ front: 'term', back: 'def, with, commas' });
  });

  it('honours an explicit separator override', () => {
    const { cards } = parseQuizletExport('a|1\nb|2', { termSeparator: '|' });
    expect(cards).toEqual([{ front: 'a', back: '1' }, { front: 'b', back: '2' }]);
  });

  it('normalises Windows line endings', () => {
    const { cards } = parseQuizletExport('a\t1\r\nb\t2');
    expect(cards).toHaveLength(2);
  });

  it('skips rows with an empty side rather than making a half-card', () => {
    // Majority of rows must still be well-formed — a paste that is mostly
    // malformed is rejected wholesale by the confidence check below, which is
    // the behaviour we want.
    const { cards, skipped } = parseQuizletExport(
      'good\tdefinition\nalso\tfine\nthird\tone\nbad\t'
    );
    expect(cards).toEqual([
      { front: 'good', back: 'definition' },
      { front: 'also', back: 'fine' },
      { front: 'third', back: 'one' },
    ]);
    expect(skipped).toBe(1);
  });

  it('rejects a paste where most rows are malformed, instead of salvaging a few', () => {
    const { cards } = parseQuizletExport('good\tdefinition\nbad\nalso bad\nstill bad');
    expect(cards).toEqual([]);
  });

  it('returns nothing when no separator is consistent, instead of guessing', () => {
    // Prose with no delimiter structure must not become cards.
    const { cards, termSeparator } = parseQuizletExport('just some words\nand more words here');
    expect(cards).toEqual([]);
    expect(termSeparator).toBeNull();
  });

  it('handles empty and whitespace input', () => {
    expect(parseQuizletExport('').cards).toEqual([]);
    expect(parseQuizletExport('   \n  ').cards).toEqual([]);
    expect(parseQuizletExport(null).cards).toEqual([]);
    expect(parseQuizletExport(undefined).cards).toEqual([]);
  });

  it('caps runaway field lengths', () => {
    const { cards } = parseQuizletExport(`${'x'.repeat(5000)}\t${'y'.repeat(5000)}`);
    expect(cards[0].front.length).toBeLessThanOrEqual(1000);
    expect(cards[0].back.length).toBeLessThanOrEqual(2000);
  });
});

describe('separatorLabel', () => {
  it('names the separators a student would recognise', () => {
    expect(separatorLabel('\t')).toBe('Tab');
    expect(separatorLabel(',')).toBe('Comma');
    expect(separatorLabel(null)).toBe('unknown');
  });
});
