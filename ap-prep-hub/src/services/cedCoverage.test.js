/**
 * Every subject the app can load must resolve to a CED file that exists.
 *
 * `cedSearch` does an exact `SUBJECT_TO_PDF[subjectName]` lookup and returns []
 * on a miss, so a subject with no mapping loses CED grounding with no error,
 * no warning, and no visible difference except worse answers. The three
 * AP Studio Art courses were in exactly that state while the CED that covers
 * them sat on disk, already mapped under a different name.
 *
 * AITutors passes `curriculumData?.name`, so the curriculum files' `name`
 * fields are the keys that actually matter at runtime — not subjects.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const cedSrc = fs.readFileSync(path.join(ROOT, 'src/services/cedSearch.js'), 'utf8');
const files = new Set(fs.readdirSync(path.join(ROOT, 'public/ced')).filter((f) => f.endsWith('.pdf')));

const mapped = Object.fromEntries(
  [...cedSrc.matchAll(/'([^']+)':\s*'([^']+\.pdf)'/g)].map((m) => [m[1], m[2]])
);

const curriculumNames = () => {
  const dir = path.join(ROOT, 'src/constants/curriculum');
  const names = new Set();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js') && x !== 'index.js')) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of src.matchAll(/^\s*name:\s*"(AP [^"]+)"/gm)) names.add(m[1]);
  }
  return [...names];
};

// AP Capstone (Seminar + Research) share one CED that is not in public/ced, and
// neither course is selectable in subjects.js. Tracked, not silently ignored.
const KNOWN_UNMAPPED = ['AP Research', 'AP Seminar'];

describe('CED coverage', () => {
  it('maps every curriculum subject to a CED file', () => {
    const missing = curriculumNames()
      .filter((n) => !KNOWN_UNMAPPED.includes(n))
      .filter((n) => !mapped[n]);
    expect(missing).toEqual([]);
  });

  it('never points a mapping at a file that is not on disk', () => {
    const broken = Object.entries(mapped)
      .filter(([, f]) => !files.has(f.split('/').pop()))
      .map(([k, f]) => `${k} -> ${f}`);
    expect(broken).toEqual([]);
  });

  it('covers all three Art and Design courses with the one shared CED', () => {
    for (const n of ['AP Studio Art: 2-D Design', 'AP Studio Art: 3-D Design', 'AP Studio Art: Drawing']) {
      expect(mapped[n]).toBe('ap-art-and-design-course-and-exam-description.pdf');
    }
  });

  it('keeps both spellings of the renamed subjects aliased', () => {
    // subjects.js says "AP U.S. History"; the curriculum says "AP United
    // States History". Whichever reaches cedSearch must resolve.
    for (const pair of [
      ['AP U.S. History', 'AP United States History'],
      ['AP U.S. Government and Politics', 'AP United States Government and Politics'],
      ['AP Government and Politics: Comparative', 'AP Comparative Government and Politics'],
    ]) {
      expect(mapped[pair[0]]).toBeDefined();
      expect(mapped[pair[0]]).toBe(mapped[pair[1]]);
    }
  });

  it('leaves no CED file unreachable', () => {
    const used = new Set(Object.values(mapped).map((f) => f.split('/').pop()));
    expect([...files].filter((f) => !used.has(f))).toEqual([]);
  });
});
