import fs from 'fs';
import path from 'path';
import { MODELLED_SUBJECTS, slugFor } from './apScoreModels';

// Every modelled subject is a landing page students search for by name
// ("ap bio score calculator"). Adding a model without adding its sitemap entry
// is silent — the page works, it just never gets indexed — so this asserts the
// two stay in step rather than relying on anyone remembering.
describe('sitemap covers every modelled subject', () => {
  const sitemap = fs.readFileSync(
    path.join(__dirname, '..', '..', 'public', 'sitemap.xml'),
    'utf8'
  );

  it('lists a per-subject calculator URL for each model', () => {
    const missing = MODELLED_SUBJECTS
      .map(slugFor)
      .filter((slug) => !sitemap.includes(`/ap-score-calculator/${slug}<`));
    expect(missing).toEqual([]);
  });

  it('does not list calculator URLs for subjects that no longer have a model', () => {
    const known = new Set(MODELLED_SUBJECTS.map(slugFor));
    const listed = [...sitemap.matchAll(/\/ap-score-calculator\/([a-z0-9-]+)</g)].map((m) => m[1]);
    expect(listed.filter((s) => !known.has(s))).toEqual([]);
  });

  it('has no duplicate calculator entries', () => {
    const listed = [...sitemap.matchAll(/\/ap-score-calculator\/([a-z0-9-]+)</g)].map((m) => m[1]);
    expect(listed.length).toBe(new Set(listed).size);
  });
});
