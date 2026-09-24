/**
 * This table exists because nine URLs shipped a canonical pointing at the
 * homepage, so Google indexed 2 pages instead of 11. The regressions that would
 * silently reinstate that: a sitemap URL losing its entry, a calculator path
 * gaining one (two writers racing), or a title growing past the SERP truncation
 * point so the page ranks under a cut-off headline.
 */
import fs from 'fs';
import path from 'path';
import { ROUTE_META, metaFor } from './routeMeta';

describe('routeMeta', () => {
  it('gives every route a distinct title and description', () => {
    const titles = Object.values(ROUTE_META).map((m) => m.title);
    const descs = Object.values(ROUTE_META).map((m) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
  });

  it('keeps titles inside what Google shows', () => {
    // '/' is exempt and only '/': it intentionally mirrors index.html's title
    // so that fixing canonicals does not also change the one page Google has
    // indexed. Shortening it is a separate, separately-measured change.
    for (const [route, m] of Object.entries(ROUTE_META)) {
      if (route === '/') continue;
      expect(`${route}:${m.title.length}`).toBe(`${route}:${Math.min(m.title.length, 65)}`);
      expect(m.description.length).toBeGreaterThan(50);
      expect(m.description.length).toBeLessThanOrEqual(170);
    }
  });

  it('leaves score-calculator routes to ScoreCalculator', () => {
    // Two components writing the canonical on the same navigation is a race,
    // and the loser is whichever effect runs second.
    expect(metaFor('/ap-score-calculator')).toBeNull();
    expect(metaFor('/ap-score-calculator/ap-biology')).toBeNull();
  });

  it('treats a trailing slash as the same page', () => {
    expect(metaFor('/ai-tutors/')).toBe(metaFor('/ai-tutors'));
    expect(metaFor('/')).not.toBeNull();
  });

  it('returns null for unknown routes rather than guessing', () => {
    expect(metaFor('/nope')).toBeNull();
    expect(metaFor('')).toBeNull();
    expect(metaFor(undefined)).toBeNull();
  });

  it('covers every non-calculator URL in the sitemap', () => {
    // The actual failure: a URL in the sitemap with no entry here keeps
    // index.html's homepage canonical and gets folded into "/".
    const xml = fs.readFileSync(path.resolve(__dirname, '..', '..', 'public', 'sitemap.xml'), 'utf8');
    const paths = [...xml.matchAll(/<loc>https:\/\/apex-scholar\.com([^<]*)<\/loc>/g)]
      .map((m) => m[1] || '/')
      .filter((p) => !p.startsWith('/ap-score-calculator'));
    expect(paths.length).toBeGreaterThan(5);
    const missing = paths.filter((p) => !metaFor(p));
    expect(missing).toEqual([]);
  });
});
