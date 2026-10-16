import { anchorFromRange, rangeFromAnchor } from './packHighlights';

jest.mock('../config/firestore', () => ({ db: {} }));

describe('highlight anchors', () => {
  const root = () => {
    const el = document.createElement('div');
    el.innerHTML = '<p>The cell <b>membrane</b> is selective.</p><p>The cell membrane is fluid.</p>';
    document.body.appendChild(el);
    return el;
  };

  it('finds the same text again, choosing the copy whose context matches', () => {
    const el = root();
    const second = el.querySelectorAll('p')[1].firstChild; // "The cell membrane is fluid."
    const r = document.createRange();
    r.setStart(second, 4); r.setEnd(second, 17); // "cell membrane"
    const anchor = anchorFromRange(el, r);
    expect(anchor.quote).toBe('cell membrane');
    const back = rangeFromAnchor(el, anchor);
    expect(back.toString()).toBe('cell membrane');
    expect(back.startContainer).toBe(second); // not the first paragraph's copy
  });

  it('spans element boundaries and returns null for text that is gone', () => {
    const el = root();
    const p = el.querySelector('p');
    const r = document.createRange();
    r.setStart(p.firstChild, 4); r.setEnd(p.lastChild, 3); // "cell membrane is"
    const anchor = anchorFromRange(el, r);
    expect(rangeFromAnchor(el, anchor).toString()).toBe('cell membrane is');
    expect(rangeFromAnchor(el, { quote: 'not on the page' })).toBeNull();
  });
});
