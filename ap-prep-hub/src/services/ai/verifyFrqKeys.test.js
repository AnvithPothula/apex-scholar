import { verifyFrqKeys } from './mcqGenerator';

jest.mock('../geminiService', () => ({ generateContent: jest.fn() }));

describe('verifyFrqKeys', () => {
  const frq = { type: 'calculator-frq', question: 'h(t) = t^2', parts: ['Find h(3).'], sampleAnswer: 'h(3) = 6', rubric: { scoringGuidelines: '1 pt: 6' } };
  const mcq = { type: 'mcq', question: 'x', options: [] };

  it('replaces a wrong key and leaves other questions alone', async () => {
    const ask = async () => '[{"i": 0, "ok": false, "sampleAnswer": "h(3) = 9", "scoringGuidelines": "1 pt: 9"}]';
    const out = await verifyFrqKeys({ subjectName: 'AP Calculus AB', questions: [mcq, frq], ask });
    expect(out[0]).toBe(mcq);
    expect(out[1].sampleAnswer).toBe('h(3) = 9');
    expect(out[1].rubric.scoringGuidelines).toBe('1 pt: 9');
  });

  it('keeps the original key when the check fails', async () => {
    const ask = async () => { throw new Error('down'); };
    const out = await verifyFrqKeys({ subjectName: 'AP Calculus AB', questions: [frq], ask });
    expect(out[0]).toBe(frq);
  });
});

describe('verifyFrqKeys subject filter', () => {
  it('leaves essay subjects alone without calling the AI', async () => {
    const ask = jest.fn();
    const q = { type: 'frq', question: 'Essai', sampleAnswer: 'Texte', rubric: { scoringGuidelines: '0-5' } };
    const out = await verifyFrqKeys({ subjectName: 'AP French Language and Culture', questions: [q], ask });
    expect(out[0]).toBe(q);
    expect(ask).not.toHaveBeenCalled();
  });
});
