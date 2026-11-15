/**
 * What goes in a student's reminder email, and whether one goes out today.
 *
 * Cadence (product decision, docs/marketing/README.md): weekly on Sundays, and
 * daily only in the final 7 days before one of the student's own exams.
 *
 * Pure (no firebase, no network), so the email-weekly function and its tests
 * share one copy. It returns plain text and inner HTML; email-broadcast's buildHtml
 * wraps the HTML in the shared layout.
 */

const { SUBJECT_KEY_TO_EXAM_NAME, EXAM_DATES } = require('./examDates');

const SITE = 'https://apex-scholar.com';
const DAY_MS = 86400000;
const EXAM_WEEK_DAYS = 7;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The function runs at 14:00 UTC (9:00 CT), when the UTC date is the US date.
const utcDay = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

function parseDate(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  return { at: Date.UTC(y, m - 1, d), label: `${MONTHS[m - 1]} ${d}` };
}

/** The student's upcoming exams, soonest first. */
function examsFor(user, now) {
  const today = utcDay(now);
  const names = [...new Set((user?.subjects || []).map((k) => SUBJECT_KEY_TO_EXAM_NAME[k]).filter(Boolean))];
  return names
    .filter((n) => EXAM_DATES[n])
    .map((name) => {
      const { at, label } = parseDate(EXAM_DATES[name]);
      return { name, label, days: Math.round((at - today) / DAY_MS) };
    })
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days);
}

/** 'examWeek' (daily), 'weekly' (Sundays), or null for no email today. */
function cadenceFor(exams, now) {
  if (exams.some((e) => e.days >= 1 && e.days <= EXAM_WEEK_DAYS)) return 'examWeek';
  return now.getUTCDay() === 0 ? 'weekly' : null;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const oneLine = (s, max) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};
// Strip markdown-ish markers from user content (question text, subject names).
const plain = (s) => String(s).replace(/[*[\]]/g, '');

const WEEK_MS = 7 * DAY_MS;
const MIN_TOPIC_ANSWERS = 3;

/**
 * What this student actually did in the last 7 days, with the week before for
 * comparison. `responses` are rows from the response log ({ correct, subject,
 * unit, atMs }); `tests` are saved practice tests ({ subject, results, createdAtMs }).
 */
function weekSummary(responses = [], tests = [], nowMs = Date.now()) {
  const thisWeek = responses.filter((r) => r.atMs > nowMs - WEEK_MS);
  const lastWeek = responses.filter((r) => r.atMs <= nowMs - WEEK_MS && r.atMs > nowMs - 2 * WEEK_MS);
  const pct = (rows) => (rows.length ? Math.round((100 * rows.filter((r) => r.correct).length) / rows.length) : null);

  const topics = new Map();
  thisWeek.forEach((r) => {
    if (!r.unit) return;
    const t = topics.get(r.unit) || { unit: r.unit, subject: r.subject, right: 0, total: 0 };
    t.total += 1;
    if (r.correct) t.right += 1;
    topics.set(r.unit, t);
  });
  // Weakest topic with enough answers to mean something; ties go to more evidence.
  const weakest = [...topics.values()]
    .filter((t) => t.total >= MIN_TOPIC_ANSWERS && t.right < t.total)
    .sort((a, b) => a.right / a.total - b.right / b.total || b.total - a.total)[0] || null;

  const testsThisWeek = tests.filter((t) => (t.createdAtMs || 0) > nowMs - WEEK_MS);
  const days = new Set([...thisWeek.map((r) => r.atMs), ...testsThisWeek.map((t) => t.createdAtMs)]
    .map((ms) => Math.floor(ms / DAY_MS)));

  return {
    answered: thisWeek.length,
    accuracy: pct(thisWeek),
    lastWeekAccuracy: lastWeek.length >= 5 ? pct(lastWeek) : null,
    subjects: [...new Set(thisWeek.map((r) => r.subject).filter(Boolean))],
    weakest,
    testsTaken: testsThisWeek.length,
    activeDays: days.size,
    everActive: responses.length > 0 || tests.length > 0,
  };
}

/** Latest predicted score per subject, newest first. */
function latestScores(tests = []) {
  const bySubject = new Map();
  [...tests]
    .filter((t) => t && t.subject && Number.isInteger(t.results?.apScore))
    .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
    .forEach((t) => { if (!bySubject.has(t.subject)) bySubject.set(t.subject, t.results.apScore); });
  return [...bySubject.entries()].slice(0, 2);
}

// Light, inline-styled email parts (Gmail strips <style>; see email-broadcast).
const INK = '#111827';
const BODY = '#374151';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const TEAL = '#0f766e';
const PANEL = '#f9fafb';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const para = (html) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BODY}">${html}</p>`;
const link = (label, url) => `<a href="${url}" style="color:${TEAL};text-decoration:underline">${esc(label)}</a>`;
const section = (title) => `<h2 style="margin:28px 0 8px;font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};font-weight:700">${esc(title)}</h2>`;
// A table, not a styled <a> alone: Outlook drops padding on links.
const button = (label, url) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px"><tr><td style="background:${TEAL};border-radius:8px"><a href="${url}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${esc(label)}</a></td></tr></table>`;
const rows = (pairs) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">${pairs.map(([left, right]) => `<tr><td style="padding:10px 12px 10px 0;border-top:1px solid ${LINE};font-size:15px;line-height:1.4;color:${INK}">${left}</td><td align="right" style="padding:10px 0;border-top:1px solid ${LINE};font-size:14px;line-height:1.4;color:${MUTED};white-space:nowrap">${right}</td></tr>`).join('')}</table>`;

// Questions that point at something the email can't show, or use LaTeX an
// inbox can't render, make a confusing "try this one".
const NEEDS_CONTEXT = /\b(described|shown|above|below|following|passage|excerpt|image|picture|graph|table|map|figure|chart|source|diagram|stimulus|quotation|cartoon|artwork|painting)\b/i;
const MARKUP = /[$\\]/;
function pickTryCard(due) {
  return due.find((c) => {
    const q = String(c?.question || '');
    const opts = Array.isArray(c?.options) ? c.options.map(String) : [];
    return q && !c.stimulus && q.length <= 240 && opts.length >= 2 && opts.length <= 5
      && opts.every((o) => o.length <= 120) && ![q, ...opts].some((t) => MARKUP.test(t))
      && !NEEDS_CONTEXT.test(q);
  }) || null;
}

/**
 * @returns {null | { kind, subject, preheader, heading, body, html }}
 *   subject ≤ ~35 chars so it survives a phone inbox. `body` is the plain-text
 *   version; `html` is the inner HTML that email-broadcast's buildHtml wraps.
 */
function buildDigest({ user, cards = [], tests = [], responses = [], now = new Date() }) {
  const exams = examsFor(user, now);
  const kind = cadenceFor(exams, now);
  if (!kind) return null;

  const nowMs = now.getTime();
  const due = cards.filter((c) => c && (c.due == null || c.due <= nowMs));
  const html = [];
  const text = [];

  if (kind === 'examWeek') {
    const soon = exams.filter((e) => e.days >= 1 && e.days <= EXAM_WEEK_DAYS);
    const first = soon[0];
    const when = (e) => (e.days === 1 ? 'tomorrow' : `in ${e.days} days`);
    const heading = `${plain(first.name)} is ${when(first)}`;
    const [label, path] = due.length
      ? [`Review ${plural(due.length, 'question')}`, '/review']
      : ['Do a timed practice set', '/practice-tests'];
    const advice = due.length
      ? 'Today: clear your reviews, then do one short timed set.'
      : "Today: one short timed set in the subject that's closest.";
    html.push(rows(soon.map((e) => [`<strong>${esc(e.name)}</strong>`, `${e.label} · ${when(e)}`])));
    html.push('<div style="height:16px"></div>', para(esc(advice)), button(label, `${SITE}${path}`));
    html.push(para(esc("A good night's sleep before the exam does more than a late cram session.")));
    text.push(heading, '', ...soon.map((e) => `${e.name}: ${e.label}, ${when(e)}`), '', advice, `${label}: ${SITE}${path}`, '',
      "A good night's sleep before the exam does more than a late cram session.");
    return {
      kind,
      subject: first.days === 1 ? 'Your AP exam is tomorrow' : `${first.days} days to your AP exam`,
      preheader: advice,
      heading,
      body: text.join('\n'),
      html: html.join(''),
    };
  }

  const week = weekSummary(responses, tests, nowMs);
  const scores = latestScores(tests);

  // What they did, in a sentence or two.
  let intro;
  if (week.answered) {
    const trend = week.lastWeekAccuracy == null || week.accuracy === week.lastWeekAccuracy ? ''
      : `, ${week.accuracy > week.lastWeekAccuracy ? 'up' : 'down'} from ${week.lastWeekAccuracy}% the week before`;
    const where = week.subjects.length ? ` in ${week.subjects.slice(0, 2).map(plain).join(' and ')}` : '';
    intro = `You answered <strong>${plural(week.answered, 'question')}</strong>${esc(where)} on ${plural(week.activeDays, 'day')}, <strong>${week.accuracy}%</strong> correct${esc(trend)}.`;
    if (week.testsTaken) intro += ` You also finished ${plural(week.testsTaken, 'practice test')}.`;
  } else if (week.testsTaken) {
    intro = `You finished <strong>${plural(week.testsTaken, 'practice test')}</strong> this week.`;
  } else if (week.everActive) {
    intro = 'A quiet week. Ten minutes of review keeps what you already learned from fading.';
  } else {
    intro = 'Not sure where you stand? Ten questions give you a predicted AP score and what to study first.';
  }
  const introText = intro.replace(/<[^>]+>/g, '');

  let heading = 'Your AP week';
  let subject = 'Your AP week';
  if (week.answered >= 5) {
    heading = `Your week: ${plural(week.answered, 'question')}, ${week.accuracy}% correct`;
    subject = `Your week: ${week.answered} Qs, ${week.accuracy}% right`;
  } else if (due.length) {
    heading = `${plural(due.length, 'question')} ${due.length === 1 ? 'is' : 'are'} ready for review`;
    subject = `${plural(due.length, 'AP review')} due`;
  } else if (exams[0]) {
    subject = `${plural(exams[0].days, 'day')} to your AP exam`;
  }

  const [ctaLabel, ctaPath] = due.length ? [`Review ${plural(due.length, 'question')}`, '/review']
    : !week.everActive ? ['Take the 10-question check', '/start']
      : ['Practice now', '/practice-tests'];

  html.push(para(intro));
  text.push(introText);
  if (week.weakest) {
    const w = week.weakest;
    const key = Object.keys(SUBJECT_KEY_TO_EXAM_NAME).find((k) => SUBJECT_KEY_TO_EXAM_NAME[k] === w.subject);
    const tutor = `${SITE}/ai-tutors${key ? `/${key}` : ''}`;
    const unit = oneLine(w.unit, 60);
    html.push(para(`Most missed: <strong>${esc(unit)}</strong> (${w.right} of ${w.total} right). ${link('Ask the tutor about it', tutor)}`));
    text.push(`Most missed: ${unit} (${w.right} of ${w.total} right). Ask the tutor: ${tutor}`);
  }
  html.push(button(ctaLabel, `${SITE}${ctaPath}`));
  text.push('', `${ctaLabel}: ${SITE}${ctaPath}`);

  if (exams.length) {
    const shown = exams.slice(0, 3);
    html.push(section('Your exams'), rows(shown.map((e) => [esc(e.name), `${e.label} · ${plural(e.days, 'day')}`])));
    text.push('', 'YOUR EXAMS', ...shown.map((e) => `${e.name}: ${e.label} (${plural(e.days, 'day')})`));
  }
  if (scores.length) {
    html.push(section('Practice-test estimates'),
      rows(scores.map(([s, score]) => [esc(s), `<strong style="color:${INK}">${score}</strong> out of 5`])),
      `<p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:${MUTED}">From your latest practice test in each subject. Estimates, not official scores.</p>`);
    text.push('', 'PRACTICE-TEST ESTIMATES', ...scores.map(([s, score]) => `${s}: ${score} out of 5`));
  }
  const card = pickTryCard(due);
  if (card) {
    const q = plain(oneLine(card.question, 240));
    const letters = 'ABCDE';
    const opts = card.options.map((o, i) => `${letters[i]}. ${plain(oneLine(o, 120))}`);
    html.push(section('Try this one'),
      `<div style="background:${PANEL};border:1px solid ${LINE};border-radius:10px;padding:16px 18px">`
      + `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:${INK};font-weight:600">${esc(q)}</p>`
      + opts.map((o) => `<p style="margin:0 0 6px;font-size:15px;line-height:1.5;color:${BODY}">${esc(o)}</p>`).join('')
      + `<p style="margin:12px 0 0;font-size:14px">${link('Answer it in your reviews', `${SITE}/review`)}</p></div>`);
    text.push('', 'TRY THIS ONE', q, ...opts, `Answer it in your reviews: ${SITE}/review`);
  }

  return {
    kind,
    subject,
    preheader: introText,
    heading,
    body: [heading, '', ...text].join('\n'),
    html: html.join(''),
  };
}

module.exports = { buildDigest, examsFor, cadenceFor, latestScores, weekSummary, pickTryCard, EXAM_WEEK_DAYS };
