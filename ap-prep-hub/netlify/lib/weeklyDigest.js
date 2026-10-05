/**
 * What goes in a student's reminder email, and whether one goes out today.
 *
 * Cadence (product decision, docs/marketing/README.md): weekly on Sundays, and
 * daily only in the final 7 days before one of the student's own exams.
 *
 * Pure (no firebase, no network), so the email-weekly function and its tests
 * share one copy. The body uses the markdown subset email-broadcast renders.
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
// Escape the characters the email markdown subset treats as markup.
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

/**
 * @returns {null | { kind, subject, body }}
 *   subject ≤ ~35 chars so it survives a phone inbox.
 */
function buildDigest({ user, cards = [], tests = [], responses = [], now = new Date() }) {
  const exams = examsFor(user, now);
  const kind = cadenceFor(exams, now);
  if (!kind) return null;

  const nowMs = now.getTime();
  const due = cards.filter((c) => c && (c.due == null || c.due <= nowMs));
  const scores = latestScores(tests);
  const lines = [];

  if (kind === 'examWeek') {
    const soon = exams.filter((e) => e.days >= 1 && e.days <= EXAM_WEEK_DAYS);
    const first = soon[0];
    lines.push('## This week');
    soon.forEach((e) => lines.push(`- **${plain(e.name)}** on ${e.label}: ${e.days === 1 ? 'tomorrow' : `in ${e.days} days`}`));
    lines.push('');
    lines.push(due.length
      ? `Today: clear your **${plural(due.length, 'review')}**, then do one short timed set. [Start reviewing](${SITE}/review)`
      : `Today: one short timed set in the subject that's closest. [Practice now](${SITE}/practice-tests)`);
    lines.push('');
    lines.push('A good night\'s sleep before the exam does more than a late cram session.');
    return {
      kind,
      subject: first.days === 1 ? 'Your AP exam is tomorrow' : `${first.days} days to your AP exam`,
      body: lines.join('\n'),
    };
  }

  const week = weekSummary(responses, tests, nowMs);
  lines.push('## Your week');
  if (week.answered) {
    const trend = week.lastWeekAccuracy == null || week.accuracy === week.lastWeekAccuracy ? ''
      : ` (${week.accuracy > week.lastWeekAccuracy ? 'up' : 'down'} from ${week.lastWeekAccuracy}% the week before)`;
    const where = week.subjects.length ? ` in ${week.subjects.slice(0, 2).map(plain).join(' and ')}` : '';
    lines.push(`- You answered **${plural(week.answered, 'question')}**${where} on ${plural(week.activeDays, 'day')}, **${week.accuracy}%** correct${trend}.`);
  } else if (week.testsTaken) {
    lines.push(`- You finished **${plural(week.testsTaken, 'practice test')}** this week.`);
  } else if (week.everActive) {
    lines.push('- Quiet week. Ten minutes of review keeps what you already learned from fading.');
  }
  if (week.weakest) {
    const w = week.weakest;
    const key = Object.keys(SUBJECT_KEY_TO_EXAM_NAME).find((k) => SUBJECT_KEY_TO_EXAM_NAME[k] === w.subject);
    lines.push(`- Most missed: **${plain(oneLine(w.unit, 60))}** (${w.right} of ${w.total}). [Ask the tutor about it](${SITE}/ai-tutors${key ? `/${key}` : ''})`);
  }
  if (week.answered && week.testsTaken) {
    lines.push(`- Plus **${plural(week.testsTaken, 'practice test')}** finished.`);
  }
  if (due.length) {
    lines.push(`- **${plural(due.length, 'question')}** due for review. [Review now](${SITE}/review)`);
  }
  exams.slice(0, 3).forEach((e) => lines.push(`- **${plain(e.name)}**: ${e.label}, ${plural(e.days, 'day')} away`));
  scores.forEach(([s, score]) => lines.push(`- Latest predicted score in ${plain(s)}: **${score}**`));
  if (!due.length && !scores.length && !week.everActive) {
    lines.push(`- Not sure where you stand? [Take the 10-question check](${SITE}/start). You get a predicted score and what to study first.`);
  }
  if (due.length) {
    lines.push('');
    lines.push('## One to try now');
    lines.push(`${plain(oneLine(due[0].question, 280))}`);
    lines.push('');
    lines.push(`[Answer it](${SITE}/review)`);
  }

  let subject = 'Your AP week';
  if (week.answered >= 5) subject = `Your week: ${week.answered} Qs, ${week.accuracy}% right`;
  else if (due.length) subject = `${plural(due.length, 'AP review')} due`;
  else if (exams[0]) subject = `${plural(exams[0].days, 'day')} to your AP exam`;
  return { kind, subject, body: lines.join('\n') };
}

module.exports = { buildDigest, examsFor, cadenceFor, latestScores, weekSummary, EXAM_WEEK_DAYS };
