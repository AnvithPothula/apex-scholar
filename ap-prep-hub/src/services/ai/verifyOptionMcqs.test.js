import { verifyOptionMcqs } from './mcqGenerator';

jest.mock('../geminiService', () => ({ __esModule: true, default: {} }));

describe('verifyOptionMcqs', () => {
  const mcq = (key, extra = {}) => ({
    type: 'mcq', question: `Q${key}`,
    options: [0, 1, 2, 3].map((i) => ({ text: `opt${i}`, correct: i === key })), ...extra,
  });

  it('drops multiple-choice questions the checker disagrees with, keeps everything else', async () => {
    const qs = [mcq(1), { type: 'frq', question: 'essay' }, mcq(3, { stimulus: 'A long source passage' })];
    let seen;
    const verify = async ({ mcqs }) => { seen = mcqs; return mcqs.filter((m) => m.i !== 0); };
    const out = await verifyOptionMcqs({ subjectName: 'AP Biology', questions: qs, verify });
    expect(out).toEqual([qs[1], qs[2]]);
    expect(seen.map((m) => m.correctIndex)).toEqual([1, 3]);
    expect(seen[1].question).toContain('Source: A long source passage');
    expect(seen[1].choices).toEqual(['opt0', 'opt1', 'opt2', 'opt3']);
  });

  it('skips the call entirely when there is nothing to check', async () => {
    const verify = jest.fn();
    const qs = [{ type: 'saq', question: 'x' }];
    expect(await verifyOptionMcqs({ subjectName: 's', questions: qs, verify })).toBe(qs);
    expect(verify).not.toHaveBeenCalled();
  });
});
