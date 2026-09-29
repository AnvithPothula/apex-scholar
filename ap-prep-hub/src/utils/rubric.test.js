import { pointsColumn, maxPoints, rubricInfo } from './rubric';

// hast for the exact table a live tutor produced (the one that rendered as
// plain text before remark-gfm was wired in).
const cell = (tag, text) => ({ type: 'element', tagName: tag, children: [{ type: 'text', value: text }] });
const row = (tag, cells) => ({ type: 'element', tagName: 'tr', children: cells.map((c) => cell(tag, c)) });
const table = (headers, rows) => ({
  type: 'element',
  tagName: 'table',
  children: [
    { type: 'element', tagName: 'thead', children: [row('th', headers)] },
    { type: 'element', tagName: 'tbody', children: rows.map((r) => row('td', r)) },
  ],
});

const AP_LANG = table(['Category', 'Points', 'Requirement'], [
  ['Thesis', '0-1', 'Responds to the prompt with a defensible thesis…'],
  ['Evidence and Commentary', '0–4', 'Provides evidence from the text…'],
  ['Sophistication', '0-1', 'Demonstrates a complex understanding…'],
]);

describe('rubric detection', () => {
  it('turns the AP Lang rhetorical-analysis table into a 6-point rubric', () => {
    expect(rubricInfo(AP_LANG)).toEqual({ pointsCol: 1, rowMax: [1, 4, 1], total: 6 });
  });

  it('recognises the usual points-column headers, never the first column', () => {
    expect(pointsColumn(['Row', 'Pts', 'Criteria'])).toBe(1);
    expect(pointsColumn(['Criterion', 'Description', 'Max Points'])).toBe(2);
    expect(pointsColumn(['Row', '**Points**'])).toBe(1);
    expect(pointsColumn(['Points', 'What it means'])).toBe(-1);
    expect(pointsColumn(['Year', 'Event'])).toBe(-1);
  });

  it('reads the most a row is worth', () => {
    expect(maxPoints('0–4')).toBe(4);
    expect(maxPoints('1 point')).toBe(1);
    expect(maxPoints('Up to 2 pts')).toBe(2);
    expect(maxPoints('—')).toBeNull();
    expect(maxPoints('1998')).toBeNull();
  });

  it('ignores ordinary tables', () => {
    expect(rubricInfo(table(['Structure', 'Function'], [['Thylakoid', 'Light reactions']]))).toBeNull();
    // A points column with only one scored row is not a rubric.
    expect(rubricInfo(table(['Item', 'Points'], [['Total', '6']]))).toBeNull();
  });
});
