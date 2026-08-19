/**
 * `repairInlineTables` was previously verified only against hand-made input.
 * This pins it against the shape a live tutor reply actually produced (header,
 * separator and body rows all joined onto one line, which GFM renders as a
 * single paragraph of pipes) and asserts the OUTPUT is well-formed GFM.
 *
 * The rendering half — react-markdown + remark-gfm turning well-formed table
 * markdown into a <table> — is library behavior, and @testing-library/react is
 * not a dependency here. What is ours is the repair, so that is what is tested.
 */
import { repairInlineTables, preprocessContent } from './latexPreprocess';

const BROKEN =
  '| Structure | Function | |-----------|----------| | Thylakoid | Light reactions | | Stroma | Calvin cycle |';

/** GFM needs: a header row, a separator row directly under it, then body rows. */
const isWellFormedTable = (text) => {
  const rows = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (rows.length < 3) return false;
  if (!rows.every((r) => r.startsWith('|') && r.endsWith('|'))) return false;
  if (!/^\|(\s*:?-{3,}:?\s*\|)+$/.test(rows[1])) return false;
  const cols = (r) => r.split('|').slice(1, -1).length;
  return rows.every((r) => cols(r) === cols(rows[0]));
};

describe('repairInlineTables', () => {
  it('splits a real single-line reply into well-formed GFM', () => {
    const out = repairInlineTables(BROKEN);
    expect(isWellFormedTable(out)).toBe(true);
    expect(out.split('\n').filter(Boolean)).toHaveLength(4); // header + sep + 2 rows
  });

  it('loses no cell content', () => {
    const out = repairInlineTables(BROKEN);
    for (const cell of ['Structure', 'Function', 'Thylakoid', 'Light reactions', 'Stroma', 'Calvin cycle']) {
      expect(out).toContain(cell);
    }
  });

  it('runs as part of preprocessContent, which is what the renderer calls', () => {
    // The gap flagged earlier was whether this is wired into the live path.
    expect(isWellFormedTable(preprocessContent(BROKEN))).toBe(true);
  });

  it('leaves an already-correct table untouched', () => {
    const good = '| A | B |\n|---|---|\n| 1 | 2 |';
    expect(repairInlineTables(good)).toBe(good);
  });

  it('does not touch prose that merely contains a pipe', () => {
    const prose = 'Use a | b to mean "or" in this notation.';
    expect(repairInlineTables(prose)).toBe(prose);
  });

  it('is a no-op on input with no pipes at all', () => {
    expect(repairInlineTables('Photosynthesis occurs in chloroplasts.'))
      .toBe('Photosynthesis occurs in chloroplasts.');
    expect(repairInlineTables(null)).toBeNull();
  });
});
