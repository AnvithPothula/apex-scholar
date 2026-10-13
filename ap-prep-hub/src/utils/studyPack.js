/**
 * Study packs: the rules, kept pure so they're testable.
 *
 * A pack is authored content (src/data/packs). What adapts is how much of it a
 * student sees and in what order:
 *   - they choose the length: key ideas only, full lessons, or a pre-check
 *     first ("test before study") that collapses what they already know;
 *   - a missed checkpoint shows that section's recap and one more question on
 *     the topic, and brings the missed one back at the end of the session;
 *   - every answer updates a per-topic status that is saved, so a returning
 *     student gets "Focus on my weak spots" (full lessons only where they
 *     missed or haven't been yet) and a pre-check that skips what they've shown.
 */

export const MODES = {
  quick: { label: 'Key ideas', hint: 'Summaries and checkpoints only' },
  full: { label: 'Full lessons', hint: 'Everything, in order' },
  precheck: { label: 'Skip what I know', hint: 'One question per topic first; full lessons only where you miss' },
  adaptive: { label: 'Focus on my weak spots', hint: 'Full lessons where you missed or haven\'t been; summaries for what you know' },
};

/**
 * Section ids to show in full vs as a summary. `known` is { [id]: true } for
 * topics the student has shown they know (pre-check right, or mastered before).
 */
export function planSections(pack, mode = 'full', known = {}) {
  return pack.sections.map((s) => {
    if (mode === 'quick') return { id: s.id, full: false };
    if (mode === 'precheck' || mode === 'adaptive') return { id: s.id, full: known[s.id] !== true };
    return { id: s.id, full: true };
  });
}

/** Rough minutes for a plan: a summary-only section takes about a third as long. */
export function planMinutes(pack, plan) {
  const byId = new Map(pack.sections.map((s) => [s.id, s]));
  return Math.max(1, Math.round(plan.reduce((t, p) => t + (byId.get(p.id)?.minutes || 0) * (p.full ? 1 : 0.35), 0)));
}

/**
 * Shuffle a question's choices (and their explanations) with a fixed seed, so
 * the order is stable for one student and the key isn't always in the same
 * place. Packs are authored with the key first; this is what hides it.
 */
export function shuffleQuestion(q, seed = 1) {
  let s = (Number(seed) >>> 0) || 1;
  const rand = () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const order = q.choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    explanations: order.map((i) => q.explanations[i]),
    answer: order.indexOf(q.answer),
  };
}

/** Small stable hash for seeding per question. */
export function seedFor(text = '') {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const isQuestion = (q) => q && typeof q.question === 'string' && q.question.trim()
  && Array.isArray(q.choices) && q.choices.length === 4 && q.choices.every((c) => typeof c === 'string' && c.trim())
  && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4
  && Array.isArray(q.explanations) && q.explanations.length === 4;

/**
 * Problems with a pack, as strings. Empty means it's fine. Catches the class of
 * error a wrong AI key produced elsewhere: an explanation that disagrees with
 * the key ("Incorrect" on the keyed choice, "Correct" on a distractor).
 */
export function validatePack(pack) {
  const problems = [];
  const ids = new Set();
  for (const s of pack?.sections || []) {
    if (ids.has(s.id)) problems.push(`${s.id}: duplicate id`);
    ids.add(s.id);
    for (const k of ['title', 'summary', 'body', 'revisit']) {
      if (typeof s[k] !== 'string' || !s[k].trim()) problems.push(`${s.id}: missing ${k}`);
    }
    if (!(s.minutes > 0)) problems.push(`${s.id}: minutes`);
    const qs = [['precheck', s.precheck], ...(s.checkpoints || []).map((q, i) => [`checkpoint ${i + 1}`, q])];
    if (!s.checkpoints?.length) problems.push(`${s.id}: no checkpoints`);
    for (const [label, q] of qs) {
      if (!isQuestion(q)) { problems.push(`${s.id} ${label}: malformed`); continue; }
      q.explanations.forEach((e, i) => {
        const says = /^\s*incorrect\b/i.test(e) ? 'incorrect' : /^\s*correct\b/i.test(e) ? 'correct' : null;
        if (i === q.answer && says !== 'correct') problems.push(`${s.id} ${label}: key's explanation doesn't start "Correct"`);
        if (i !== q.answer && says !== 'incorrect') problems.push(`${s.id} ${label}: choice ${i} explanation doesn't start "Incorrect"`);
      });
      if (new Set(q.choices.map((c) => c.trim().toLowerCase())).size !== 4) problems.push(`${s.id} ${label}: duplicate choices`);
    }
    for (const b of s.blocks || []) {
      if (b.type === 'flashcards' && !(b.cards || []).every((c) => c.front && c.back)) problems.push(`${s.id}: empty flashcard`);
      if (!['flashcards', 'sim'].includes(b.type)) problems.push(`${s.id}: unknown block ${b.type}`);
      if (b.sim === 'timeline-order') {
        const ev = b.props?.events || [];
        if (ev.length < 3 || !ev.every((e, i) => e.label && Number.isFinite(e.year) && (!i || ev[i - 1].year <= e.year))) problems.push(`${s.id}: timeline events must be 3+ with labels and ascending years`);
      }
      if (b.sim === 'sort-buckets') {
        const { buckets = [], items = [] } = b.props || {};
        if (buckets.length < 2 || buckets.length > 6 || items.length < 3
          || !items.every((it) => it.label && Number.isInteger(it.bucket) && it.bucket >= 0 && it.bucket < buckets.length)
          || new Set(items.map((it) => it.label)).size !== items.length) problems.push(`${s.id}: sort needs 2–6 buckets and 3+ uniquely labeled items with valid buckets`);
      }
    }
  }
  if (!ids.size) problems.push('no sections');
  return problems;
}

/**
 * What this session's answers say about each topic. `results` maps question
 * keys (`${id}:pre`, `${id}:cp${i}`, `${id}:more`) to true/false.
 *   shaky    — missed a checkpoint (or the follow-up), or missed the pre-check
 *              and hasn't answered every checkpoint right since
 *   mastered — every checkpoint right first time
 *   known    — only the pre-check, answered right (weaker evidence; see mergeTopics)
 * Topics with no evidence yet are left out.
 */
export function topicStatus(pack, results = {}) {
  const out = {};
  for (const s of pack.sections) {
    const cps = s.checkpoints.map((_, i) => results[`${s.id}:cp${i}`]);
    if (cps.includes(false) || results[`${s.id}:more`] === false) out[s.id] = 'shaky';
    else if (cps.length && cps.every((r) => r === true)) out[s.id] = 'mastered';
    else if (results[`${s.id}:pre`] === true) out[s.id] = 'known';
    else if (results[`${s.id}:pre`] === false) out[s.id] = 'shaky';
  }
  return out;
}

/**
 * Saved history plus this pass. Only topics this pass tested change. One right
 * pre-check answer marks a new topic mastered, but doesn't clear a topic the
 * student has missed before: that takes its checkpoints, all right.
 */
export function mergeTopics(saved = {}, pass = {}) {
  const out = { ...saved };
  Object.entries(pass).forEach(([id, status]) => {
    out[id] = status === 'known' ? (saved[id] === 'shaky' ? 'shaky' : 'mastered') : status;
  });
  return out;
}

/** Counts for a unit card, saved alongside progress so lists don't load the pack. */
export function packSummary(pack, plan, results, topics) {
  const byId = new Map(pack.sections.map((s) => [s.id, s]));
  const keys = plan.flatMap((p) => byId.get(p.id).checkpoints.map((_, i) => `${p.id}:cp${i}`));
  return {
    answered: keys.filter((k) => results[k] !== undefined).length,
    correct: keys.filter((k) => results[k] === true).length,
    total: keys.length,
    mastered: pack.sections.filter((s) => topics[s.id] === 'mastered').length,
    topicCount: pack.sections.length,
  };
}

/**
 * Which unit of a class to point at: the one in progress, else the first not
 * yet finished, else the one with the fewest mastered topics (to revisit).
 * `units` is [{ slug }] in course order; `progress` maps slug -> saved progress.
 */
export function nextUnit(units, progress = {}) {
  if (!units.length) return null;
  const sum = (u) => progress[u.slug]?.summary;
  const started = units.find((u) => sum(u) && sum(u).answered > 0 && sum(u).answered < sum(u).total);
  if (started) return { slug: started.slug, why: 'continue' };
  const fresh = units.find((u) => !sum(u) || sum(u).answered < sum(u).total);
  if (fresh) return { slug: fresh.slug, why: 'next' };
  const weakest = [...units].sort((a, b) => sum(a).mastered / sum(a).topicCount - sum(b).mastered / sum(b).topicCount)[0];
  return { slug: weakest.slug, why: 'review' };
}

const unitNumber = (slug) => Number(slug.split('/')[1]?.replace(/\D/g, '')) || 0;

/**
 * Courses joined with the packs that exist. Each unit is { n, slug, title,
 * ready }; a course with no verified unit list still shows any packs it has.
 * `courseUnits` comes from data/packs/catalog (passed in to keep this pure).
 */
export function joinCatalog(courses, packs, courseUnits) {
  return courses.map((c) => {
    let units = courseUnits(c).map((u) => ({ ...u, ready: !!packs[u.slug], title: packs[u.slug]?.title || u.title }));
    const known = new Set(units.map((u) => u.slug));
    const extra = Object.entries(packs)
      .filter(([slug]) => slug.startsWith(`${c.id}/`) && !known.has(slug))
      .map(([slug, p]) => ({ n: unitNumber(slug), slug, title: p.title, ready: true }));
    units = [...units, ...extra].sort((a, b) => a.n - b.n);
    return { ...c, units, ready: units.filter((u) => u.ready).length };
  });
}
