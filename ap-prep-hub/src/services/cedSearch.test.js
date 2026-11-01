/**
 * cedSearch reads the page-text index in public/ced-index, never the PDFs.
 * Each PDF is 2-43 MB and Netlify bills bandwidth in credits, so opening one
 * per tutor message would pause the site under launch traffic.
 */
const fs = require('fs');
const path = require('path');
const { cedSearch, searchPages, queryTerms } = require('./cedSearch');

const ROOT = path.resolve(__dirname, '..', '..');
const indexOf = (pages) => ({ pages });

describe('queryTerms', () => {
  it('drops filler words and short words', () => {
    expect(queryTerms('Can you explain what caused the French and Indian War?'))
      .toEqual(['caused', 'french', 'indian', 'war']);
  });

  it('returns nothing for a message with no content words', () => {
    expect(queryTerms('can you help me with this?')).toEqual([]);
  });
});

describe('searchPages', () => {
  const pages = [
    'Unit 1 overview. Course framework and skills.',
    'The French and Indian War (1754-1763) reshaped British colonial policy.',
    'Taxation without representation followed the war debt.',
    'Indian removal policy under Jackson.',
  ];

  it('ranks the page holding the most query words first, with 1-based pages', () => {
    const hits = searchPages(indexOf(pages), 'what caused the French and Indian War', 2);
    expect(hits[0].page).toBe(2);
    expect(hits[0].snippet).toMatch(/French and Indian War/);
  });

  it('needs two distinct words, so one common word does not match a page', () => {
    const hits = searchPages(indexOf(pages), 'war debt french', 3);
    expect(hits.map((h) => h.page).sort()).toEqual([2, 3]);
  });

  it('puts a page with the whole phrase first', () => {
    const hits = searchPages(indexOf(pages), 'Indian removal policy', 1);
    expect(hits[0].page).toBe(4);
  });

  it('ignores accents, so a student typing "Chatelier" finds "Châtelier"', () => {
    const hits = searchPages(indexOf(['Le Châtelier’s principle predicts the shift in equilibrium.']), 'le chatelier principle', 1);
    expect(hits[0].page).toBe(1);
  });

  it('returns nothing when no query words remain', () => {
    expect(searchPages(indexOf(pages), 'please help', 2)).toEqual([]);
  });
});

describe('cedSearch', () => {
  afterEach(() => { delete global.fetch; });

  it('fetches the subject index once, not the PDF, and cites the PDF page', async () => {
    const calls = [];
    global.fetch = jest.fn(async (url) => {
      calls.push(url);
      return { ok: true, json: async () => ({ pages: ['Cell membranes regulate transport.', 'Photosynthesis in chloroplasts makes glucose.'] }) };
    });
    const first = await cedSearch('AP Biology', 'how does photosynthesis make glucose');
    const second = await cedSearch('AP Biology', 'what do cell membranes regulate');
    expect(calls).toEqual(['/ced-index/ap-biology-course-and-exam-description.json']);
    expect(first[0]).toMatchObject({ url: '/ced/ap-biology-course-and-exam-description.pdf', page: 2 });
    expect(second[0].page).toBe(1);
  });

  it('returns [] and retries later when the index fails to load', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    expect(await cedSearch('AP Chemistry', 'ionic bonds lattice energy')).toEqual([]);
    expect(await cedSearch('AP Chemistry', 'covalent bonds polarity')).toEqual([]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('public/ced-index', () => {
  const pdfs = fs.readdirSync(path.join(ROOT, 'public/ced')).filter((f) => f.endsWith('.pdf'));

  it('has an index for every CED PDF (run scripts/build-ced-index.mjs)', () => {
    const missing = pdfs.filter((f) => !fs.existsSync(path.join(ROOT, 'public/ced-index', f.replace(/\.pdf$/, '.json'))));
    expect(missing).toEqual([]);
  });

  it('finds real CED pages for a real tutor question', () => {
    const file = path.join(ROOT, 'public/ced-index/ap-us-history-course-and-exam-description.json');
    const { pages } = JSON.parse(fs.readFileSync(file, 'utf8'));
    const hits = searchPages(indexOf(pages), 'What were the causes of the French and Indian War?', 2);
    expect(hits.length).toBe(2);
    expect(hits[0].snippet.toLowerCase()).toMatch(/french|indian/);
  });
});
