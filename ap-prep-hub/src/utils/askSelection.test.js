import { buildSelectionPrompt, usableQuote, snapToWords, MAX_QUOTE } from './askSelection';

describe('highlight-to-ask prompt', () => {
  it('only offers the menu for real text', () => {
    expect(usableQuote('  ')).toBe(false);
    expect(usableQuote('—')).toBe(false);
    expect(usableQuote('a')).toBe(false);
    expect(usableQuote('ΔU')).toBe(true);
    expect(usableQuote('PV = nRT')).toBe(true);
  });

  it('includes where the student is, the passage, the question and recent turns', () => {
    const p = buildSelectionPrompt({
      subject: 'AP Chemistry', unit: 'Unit 1', section: 'Periodic Trends',
      quote: 'Cations are smaller than their atoms', context: 'Ionic radius. Cations are smaller than their atoms (lost electrons).',
      question: 'Why?', history: [1, 2, 3, 4].map((n) => ({ question: `q${n}`, answer: `a${n}` })),
    });
    expect(p).toMatch('AP Chemistry tutor');
    expect(p).toMatch('(Unit 1, Periodic Trends)');
    expect(p).toMatch('"""Cations are smaller than their atoms"""');
    expect(p).toMatch('Text around it:');
    expect(p).toMatch("Student's question: Why?");
    expect(p).not.toMatch('q1'); // only the last three turns
    expect(p).toMatch('q4');
  });

  it('caps a huge selection and skips context identical to the quote', () => {
    const big = 'x '.repeat(5000);
    const p = buildSelectionPrompt({ quote: big, context: big, question: 'What?' });
    const quoted = p.split('"""')[1];
    expect(quoted.length).toBeLessThanOrEqual(MAX_QUOTE);
    expect(p).not.toMatch('Text around it');
  });
});

describe('selection snapping', () => {
  const rangeOver = (text, from, to) => {
    const p = document.createElement('p'); p.textContent = text; document.body.appendChild(p);
    const r = document.createRange(); r.setStart(p.firstChild, from); r.setEnd(p.firstChild, to);
    return r;
  };
  it('grows a selection to whole words on both ends', () => {
    const text = 'mass spectra and photoelectron spectra';
    expect(snapToWords(rangeOver(text, 7, 23)).toString()).toBe('spectra and photoelectron');
  });
  it('leaves a selection that already ends on word boundaries alone', () => {
    const text = 'Cations are smaller than their atoms.';
    expect(snapToWords(rangeOver(text, 0, 19)).toString()).toBe('Cations are smaller');
  });
});
