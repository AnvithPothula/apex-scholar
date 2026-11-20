import { splitGuidelines, pastExamsFor, partsOf } from './pastFrq';

jest.mock('./pdfUtils', () => ({ extractPdfLines: jest.fn() }));

test('splits scoring guidelines into questions in document order', () => {
  const lines = [
    'AP History Scoring Guidelines',
    'Question 1: Short Answer Secondary Source 3 points',
    'A Briefly describe one purpose. 1 point',
    'Accept one of the following:',
    'Question 2: Short Answer No Stimulus 3 points',
    'Row B 0 points 1 point 2 points',
    // numbering restarts in Section II
    'Question 1: Document-Based Question, Role of Government 7 points',
    'Examples that earn 2 points',
    'Question 5: Analyze Model or Visual Representation of a Biological',
    'Concept or Process 4 points',
    'Figure 1 shows a pathway.',
  ];
  const qs = splitGuidelines(lines);
  expect(qs.map((q) => [q.title, q.points])).toEqual([
    ['Question 1: Short Answer Secondary Source', 3],
    ['Question 2: Short Answer No Stimulus', 3],
    ['Question 1: Document-Based Question, Role of Government', 7],
    ['Question 5: Analyze Model or Visual Representation of a Biological Concept or Process', 4],
  ]);
  expect(qs[0].text).toContain('Briefly describe one purpose');
  expect(qs[0].text).not.toContain('No Stimulus');
  expect(qs[3].text).toContain('Figure 1 shows a pathway.');
});

test('every past exam links official AP Central scoring guidelines', () => {
  const exams = pastExamsFor('AP Biology');
  expect(exams.length).toBeGreaterThanOrEqual(4);
  for (const e of exams) expect(e.sg).toMatch(/^https:\/\/apcentral\.collegeboard\.org\/media\/pdf\/ap\d\d-sg-[a-z0-9-]+\.pdf$/);
  expect(pastExamsFor('usHistory').length).toBeGreaterThan(0);
});

test('subtotal lines are not questions, and a restart in numbering is labelled as a new section', () => {
  const qs = splitGuidelines([
    'Question 1: Interpreting Results 9 points',
    '(a) Describe the function of S phase.',
    '1 point',
    'Total for part (a) 2 points',
    'Total for question 1 9 points',
    'Question 2: Short Answer 3 points',
    'Question 1: Document-Based Question 7 points',
  ]);
  expect(qs.map((q) => q.label)).toEqual([
    'Question 1 · Interpreting Results',
    'Question 2 · Short Answer',
    'Section II, Question 1 · Document-Based Question',
  ]);
});

test('parts come with their points, in the formats College Board uses', () => {
  expect(partsOf([
    '(a) Describe the function of S phase.', '1 point', '1 point', 'Total for part (a) 2 points',
    '( b ) Identify the control group.', '1 point', '1 point', '1 point', 'Total for part ( b ) 3 points',
    '(c) Describe the effect.', '1 point',
  ]).map((p) => [p.label, p.points])).toEqual([['(a)', 2], ['(b)', 3], ['(c)', 1]]);
  expect(partsOf([
    'A Describe the function of ribosomes. Point A1',
    'B (i) Identify the dependent variable. Point B1', '(ii) Justify the choice. Point B2',
  ]).map((p) => [p.label, p.points])).toEqual([['(a)', 1], ['(b)', 2]]);
  expect(partsOf(['Row A Thesis', '0 points', '1 point', 'Row B Evidence and Commentary', '0 points', '4 points', 'Row C Sophistication', '1 point'])
    .map((p) => [p.label, p.points])).toEqual([['Row A', 1], ['Row B', 4], ['Row C', 1]]);
  expect(partsOf(['(b) only one part'])).toEqual([]);
  expect(partsOf(['(a) first', '(c) skipped b'])).toEqual([]);
});
