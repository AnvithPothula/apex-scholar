/**
 * "Did you mean…?" for the 404 page: the closest real route to a mistyped
 * path (/practice-test, /flashcard, /aitutors, /ScoreCalculator).
 */
const ROUTES = [
  ['/ai-tutors', 'AI Tutors', true], ['/study', 'Study packs', true], ['/practice-tests', 'Practice tests', false],
  ['/practice', 'Practice', false], ['/flashcards', 'Flashcards', false], ['/review', 'Review', false],
  ['/solver', 'Solver', false], ['/smart-scheduler', 'Study scheduler', false], ['/diagnostics', 'Diagnostics', true],
  ['/ap-score-calculator', 'AP score calculator', true], ['/progress', 'Progress', false], ['/classes', 'Classes', true],
  ['/settings', 'Settings', false], ['/privacy', 'Privacy', false], ['/terms', 'Terms', false], ['/start', 'Get started', false],
];

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

/** @returns {{path: string, label: string} | null} */
export function suggestRoute(pathname = '') {
  const [first = '', ...rest] = String(pathname).split('/').filter(Boolean);
  const want = norm(first);
  if (!want) return null;
  let best = null;
  for (const [path, label, nested] of ROUTES) {
    const have = norm(path);
    // A prefix either way ("flashcard" / "aitutorsbio") counts as a near miss.
    const d = have.startsWith(want) || want.startsWith(have)
      ? Math.abs(have.length - want.length) * 0.5
      : distance(want, have);
    if (!best || d < best.d) best = { d, path, label, nested };
  }
  if (!best || best.d > Math.max(2, Math.floor(want.length / 3))) return null;
  // Keep the rest of the path where the route takes one (/ai-tutor/biology).
  return { path: best.nested && rest.length ? `${best.path}/${rest.join('/')}` : best.path, label: best.label };
}
