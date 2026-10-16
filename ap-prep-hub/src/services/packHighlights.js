/**
 * Saved highlights in a Learn unit: yellow, blue, green or red, kept across
 * visits and devices.
 *
 * A highlight is stored as the quoted text plus a little context either side
 * (a "text quote" anchor), not as DOM positions. The page re-renders as
 * sections open and checkpoints are answered, so DOM paths go stale; the text
 * doesn't. On each paint the quote is found again in the unit's text, using
 * the context to pick the right copy when it appears more than once.
 *
 * Storage mirrors packProgress: localStorage always, plus
 * users/{uid}/progress/hl_<slug> when signed in (owner-only rule); the newer
 * copy wins.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firestore';
import errorLogger from '../utils/errorLogger';

export const HL_COLORS = ['yellow', 'blue', 'green', 'red'];
const CONTEXT = 32;

/** Every text node under root, with where it starts in the joined text. Exported so a repaint builds it once. */
export function textMap(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let text = '';
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push({ node: n, start: text.length });
    text += n.data;
  }
  return { text, nodes };
}

/** Quote + context for a range inside root. Exported for tests. */
export function anchorFromRange(root, range) {
  const pre = document.createRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const quote = range.toString();
  const { text } = textMap(root);
  return {
    quote,
    prefix: text.slice(Math.max(0, start - CONTEXT), start),
    suffix: text.slice(start + quote.length, start + quote.length + CONTEXT),
  };
}

/** The range for an anchor, or null if its text isn't on the page now. Exported for tests. */
export function rangeFromAnchor(root, anchor, map = textMap(root)) {
  if (!anchor?.quote) return null;
  const { text, nodes } = map;
  if (!nodes.length) return null;
  let best = -1;
  let bestScore = -1;
  for (let i = text.indexOf(anchor.quote); i !== -1; i = text.indexOf(anchor.quote, i + 1)) {
    // Compare in place; slicing the whole text per match is quadratic on long units.
    const end = i + anchor.quote.length;
    const score = (anchor.prefix && text.slice(i - anchor.prefix.length, i) === anchor.prefix ? 2 : 0)
      + (anchor.suffix && text.slice(end, end + anchor.suffix.length) === anchor.suffix ? 1 : 0);
    if (score > bestScore) { best = i; bestScore = score; }
    if (score === 3) break;
  }
  if (best === -1) return null;
  const at = (offset) => {
    // The last node starting at or before offset holds it.
    let lo = 0;
    let hi = nodes.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (nodes[mid].start <= offset) lo = mid; else hi = mid - 1;
    }
    return { node: nodes[lo].node, offset: offset - nodes[lo].start };
  };
  const s = at(best);
  const e = at(best + anchor.quote.length);
  const range = document.createRange();
  range.setStart(s.node, Math.min(s.offset, s.node.length));
  range.setEnd(e.node, Math.min(e.offset, e.node.length));
  return range;
}

const localKey = (uid, slug) => `apex.hl.v1.${uid || 'guest'}.${slug}`;
const docRef = (uid, slug) => doc(db, 'users', uid, 'progress', `hl_${slug.replace(/\//g, '__')}`);

function readLocal(uid, slug) {
  try {
    const raw = localStorage.getItem(localKey(uid, slug)) ?? (uid ? localStorage.getItem(localKey(null, slug)) : null);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loadHighlights(uid, slug) {
  const local = readLocal(uid, slug);
  if (!uid) return local?.items || [];
  try {
    const snap = await getDoc(docRef(uid, slug));
    const remote = snap.exists() ? snap.data() : null;
    const pick = (remote?.updatedAt || 0) > (local?.updatedAt || 0) ? remote : local;
    return pick?.items || [];
  } catch (e) {
    errorLogger.warn('highlights read failed', { slug, error: e?.message });
    return local?.items || [];
  }
}

export async function saveHighlights(uid, slug, items) {
  const data = { updatedAt: Date.now(), items };
  try { localStorage.setItem(localKey(uid, slug), JSON.stringify(data)); } catch { /* private mode */ }
  if (!uid) return;
  try {
    await setDoc(docRef(uid, slug), JSON.parse(JSON.stringify({ ...data, slug })));
  } catch (e) {
    errorLogger.warn('highlights save failed', { slug, error: e?.message });
  }
}
