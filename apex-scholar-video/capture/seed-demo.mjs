// Seeds the capture account with clean, made-up demo data for the launch film.
//
//   node capture/seed-demo.mjs            back up, clear the test junk, seed everything
//   node capture/seed-demo.mjs mcq-test   plant the resumable MCQ test (beat 13)
//   node capture/seed-demo.mjs frq-test   plant the resumable Calc AB FRQ (beats 14-15)
//
// Uses the admin credentials in ap-prep-hub/.env. Every document it changes or
// deletes is first written to capture/backup/<time>.json. All names are invented.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(here, '..', '..', 'ap-prep-hub');
const req = createRequire(path.join(APP, 'package.json'));
req('dotenv').config({ path: path.join(APP, '.env') });
const { initializeApp, cert, getApps } = req('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = req('firebase-admin/firestore');
if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }) });
}
const db = getFirestore();

export const UID = 'n6hJheORnphPh2UmzZnfwvBOH5z2'; // testing@gmail.com
export const STUDENT = 'Jordan Reyes';
export const CLASS_CODE = 'MATH2AB7';
const DAY = 864e5;
const NOW = Date.now();
const at = (days, hour = 23, min = 59) => {
  const d = new Date(NOW + days * DAY); d.setHours(hour, min, 0, 0); return Timestamp.fromDate(d);
};

// ---------- the practice tests -------------------------------------------------

const UNIT5 = 'Unit 5: Analytical Applications of Differentiation';

const CALC_MCQ = [
  { q: 'If $f(x) = x^3 - 6x^2 + 9x + 1$, at which value of $x$ does $f$ have a relative maximum?',
    o: ['$x = 1$', '$x = 2$', '$x = 3$', '$x = 4$'], a: 0,
    e: "$f'(x) = 3x^2 - 12x + 9 = 3(x-1)(x-3)$. $f'$ changes from positive to negative at $x = 1$." },
  { q: "The function $g$ is twice differentiable with $g'(2) = 0$ and $g''(2) = -5$. Which statement is true?",
    o: ['$g$ has a relative minimum at $x = 2$', '$g$ has a relative maximum at $x = 2$', '$g$ has a point of inflection at $x = 2$', 'There is not enough information to classify $x = 2$'], a: 1,
    e: 'By the Second Derivative Test, $g\'(2) = 0$ and $g\'\'(2) < 0$ give a relative maximum.' },
  { q: 'On which interval is $h(x) = x^4 - 4x^3$ concave down?',
    o: ['$(-\\infty, 0)$', '$(0, 2)$', '$(2, 3)$', '$(3, \\infty)$'], a: 1,
    e: "$h''(x) = 12x^2 - 24x = 12x(x-2)$, which is negative on $(0, 2)$." },
  { q: 'What is the absolute minimum value of $f(x) = x^2 - 4x + 7$ on the closed interval $[0, 5]$?',
    o: ['$2$', '$3$', '$7$', '$12$'], a: 1,
    e: 'The only critical point is $x = 2$, where $f(2) = 3$. The endpoints give $f(0) = 7$ and $f(5) = 12$.' },
  { q: 'The function $f$ is continuous on $[1, 5]$ and differentiable on $(1, 5)$, with $f(1) = 2$ and $f(5) = 14$. The Mean Value Theorem guarantees a value $c$ in $(1, 5)$ with $f\'(c) =$',
    o: ['$2$', '$3$', '$4$', '$12$'], a: 1,
    e: '$\\frac{f(5) - f(1)}{5 - 1} = \\frac{12}{4} = 3$.' },
  { q: 'A particle moves along the $x$-axis with velocity $v(t) = t^2 - 4t + 3$ for $t \\ge 0$. For what values of $t$ is the particle moving to the left?',
    o: ['$0 < t < 1$', '$1 < t < 3$', '$t > 3$', '$t > 2$'], a: 1,
    e: '$v(t) = (t-1)(t-3)$ is negative between its zeros, so the particle moves left on $1 < t < 3$.' },
];
const mcqQuestions = CALC_MCQ.map((x, i) => ({
  id: i + 1, type: 'mcq', topic: UNIT5, question: x.q, options: x.o, correctAnswer: x.a,
  explanation: x.e, stimulus: '', sampleAnswer: '', prompt: '', documents: [],
}));

// The FRQ from reports/Launch video FRQ and music.md. Anvith's handwritten page
// answers exactly this, with one sign error in (c).
const FRQ = {
  id: 1,
  type: 'no-calculator-frq',
  points: 9,
  question: 'Let $f$ be the function defined by $f(x) = x^3 - 3x^2 - 9x + 5$.',
  parts: [
    'Find the $x$-coordinates of all relative extrema of $f$. Classify each as a relative maximum or a relative minimum. Justify your answer. (4 points)',
    'On what open intervals is the graph of $f$ concave up? Justify your answer. (3 points)',
    'Find the absolute maximum value of $f$ on the closed interval $-2 \\le x \\le 4$. Justify your answer. (2 points)',
  ],
  rubric: {
    totalPoints: 9,
    pointBreakdown: { part_a: '4 points', part_b: '3 points', part_c: '2 points' },
    scoringGuidelines: [
      "Part (a): 1 point for $f'(x) = 3x^2 - 6x - 9$. 1 point for the critical points $x = -1$ and $x = 3$. 1 point for a relative maximum at $x = -1$ because $f'$ changes from positive to negative there. 1 point for a relative minimum at $x = 3$ because $f'$ changes from negative to positive there.",
      "Part (b): 1 point for $f''(x) = 6x - 6$. 1 point for concave up on $(1, \\infty)$. 1 point for the reason: $f''(x) > 0$ for $x > 1$.",
      'Part (c): 1 point for the Candidates Test using $x = -2, -1, 3, 4$. 1 point for the answer: the absolute maximum value is $10$, at $x = -1$. Correct values: $f(-2) = 3$, $f(-1) = 10$, $f(3) = -22$, $f(4) = -15$.',
    ].join('\n'),
  },
  sampleAnswer: [
    "(a) $f'(x) = 3x^2 - 6x - 9 = 3(x - 3)(x + 1)$, so $f'(x) = 0$ at $x = -1$ and $x = 3$. $f' > 0$ for $x < -1$, $f' < 0$ for $-1 < x < 3$, $f' > 0$ for $x > 3$. Relative maximum at $x = -1$ because $f'$ changes from positive to negative; relative minimum at $x = 3$ because $f'$ changes from negative to positive.",
    "(b) $f''(x) = 6x - 6 > 0$ when $x > 1$, so $f$ is concave up on $(1, \\infty)$.",
    '(c) Candidates: $f(-2) = 3$, $f(-1) = 10$, $f(3) = -22$, $f(4) = -15$. The absolute maximum value of $f$ on $[-2, 4]$ is $10$, at $x = -1$.',
  ].join('\n\n'),
  stimulus: '', options: [], correctAnswer: 0, explanation: '', prompt: '', documents: [],
};

const TESTS = {
  'mcq-test': {
    subject: 'AP Calculus AB', section: 'mcq', subsection: '', units: [UNIT5],
    questions: mcqQuestions, userAnswers: { 1: 0, 2: 1 }, currentQuestionIndex: 2,
    marks: { marked: {}, crossed: {} }, timeLimitMinutes: 105, timeRemaining: 94 * 60 + 37,
  },
  'frq-test': {
    subject: 'AP Calculus AB', section: 'frq', subsection: 'no-calculator-frq', units: [UNIT5],
    questions: [FRQ], userAnswers: {}, currentQuestionIndex: 0,
    marks: { marked: {}, crossed: {} }, timeLimitMinutes: 60, timeRemaining: 41 * 60 + 12,
  },
};

/** Puts a test in testProgress/<uid>_inprogress so Practice Tests offers to resume it. */
export async function plantTest(kind) {
  const t = TESTS[kind];
  if (!t) throw new Error(`No test "${kind}"`);
  await db.doc(`testProgress/${UID}_inprogress`).set({ userId: UID, ...t, lastSaved: FieldValue.serverTimestamp() });
  console.log(`planted ${kind}`);
}

/** Restores the review queue to the seeded cards, all due. */
export async function resetQueue() {
  await db.doc(`users/${UID}/progress/reviewQueue`).set({ cards: REVIEW, updatedAt: FieldValue.serverTimestamp() });
}

/** Removes the resumable test, so Practice Tests opens on a clean setup screen. */
export async function clearTest() {
  await db.doc(`testProgress/${UID}_inprogress`).delete();
}

/** Deletes this account's decks called `title` (left by an earlier Quizlet take). */
export async function deleteDecks(title) {
  const q = await db.collection('flashcardDecks').where('userId', '==', UID).where('title', '==', title).get();
  await Promise.all(q.docs.map((d) => d.ref.delete()));
}

/** Deletes this account's tutor conversations in `subject` created since `sinceMs` (re-take leftovers). */
export async function deleteConversations(subject, sinceMs) {
  const q = await db.collection('conversations').where('userId', '==', UID).get();
  for (const d of q.docs) {
    const c = d.data();
    if (c.subject !== subject || (c.createdAt?.toMillis?.() ?? 0) < sinceMs) continue;
    const msgs = await d.ref.collection('messages').get();
    await Promise.all(msgs.docs.map((m) => m.ref.delete()));
    await d.ref.delete();
  }
}

// ---------- the rest of the account ---------------------------------------------

const ASSIGNMENTS = [
  ['5.4–5.5 Homework: First and Second Derivative Tests', 'AP Calculus AB', 'homework', 'Medium', 45, 3, 'canvas'],
  ['Unit 5 Test: Analytical Applications of Differentiation', 'AP Calculus AB', 'test', 'Hard', 120, 6, 'canvas'],
  ['Read AMSCO Chapter 8 and take notes', 'AP U.S. History', 'reading', 'Medium', 60, 4, 'schoology'],
  ['Period 4 DBQ: The Market Revolution', 'AP U.S. History', 'essay', 'Hard', 90, 7, 'schoology'],
  ['Unit 2 Quiz: Memory and Cognition', 'AP Psychology', 'test', 'Medium', 45, 5, 'schoology'],
  ['Cellular Respiration Lab Report', 'AP Biology', 'lab', 'Hard', 120, 10, 'canvas'],
  ['Unit 3 Progress Check: MCQ', 'AP Biology', 'homework', 'Medium', 40, 4, 'canvas'],
  ['Rhetorical Analysis Essay: First Draft', 'AP English Language and Composition', 'essay', 'Hard', 90, 8, 'canvas'],
];

const card = (subject, unit, question, options, correctIndex, userIndex, explanation, daysAgo) => ({
  id: `demo${Math.abs([...`${subject}|${question}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)).toString(36)}`,
  subject, unit, question, stimulus: '', options, correctIndex,
  userAnswer: options[userIndex], correctAnswer: options[correctIndex], explanation,
  ease: 2.36, reps: 1, interval: 1, lapses: 1,
  createdAt: NOW - (daysAgo + 3) * DAY, lastReviewed: NOW - (daysAgo + 1) * DAY, due: NOW - daysAgo * DAY,
});
const REVIEW = [
  card('AP Calculus AB', UNIT5, "If $f''(x) = 6x - 6$, on what interval is $f$ concave down?", ['$(-\\infty, 1)$', '$(1, \\infty)$', '$(-\\infty, 6)$', '$(0, 1)$'], 0, 1, "$f''(x) < 0$ when $6x - 6 < 0$, that is, when $x < 1$.", 2),
  card('AP Calculus AB', UNIT5, 'What does the Extreme Value Theorem require of $f$ on $[a, b]$?', ['Differentiable on $(a, b)$', 'Continuous on $[a, b]$', '$f(a) = f(b)$', "$f'(x) \\ne 0$ on $(a, b)$"], 1, 0, 'A function continuous on a closed interval attains both an absolute maximum and an absolute minimum there.', 1),
  card('AP Calculus AB', 'Unit 4: Contextual Applications of Differentiation', 'A spherical balloon is inflated so its radius grows at 2 cm/s. How fast is the volume increasing when $r = 5$ cm?', ['$100\\pi$ cm³/s', '$200\\pi$ cm³/s', '$50\\pi$ cm³/s', '$40\\pi$ cm³/s'], 1, 0, "$\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt} = 4\\pi(25)(2) = 200\\pi$.", 3),
  card('AP Psychology', 'Unit 2: Cognition', 'Studying for an hour a day over a week beats one seven-hour session. This is the', ['serial position effect', 'spacing effect', 'testing effect', 'next-in-line effect'], 1, 2, 'Distributed practice (the spacing effect) produces better long-term retention than massed practice.', 1),
  card('AP Psychology', 'Unit 2: Cognition', 'Learning Spanish makes it harder to recall the French you learned earlier. This is', ['proactive interference', 'retroactive interference', 'source amnesia', 'motivated forgetting'], 1, 0, 'Retroactive interference: new learning disrupts recall of old information.', 2),
  card('AP Psychology', 'Unit 3: Development and Learning', "In Pavlov's experiments, the bell before conditioning was a", ['conditioned stimulus', 'unconditioned stimulus', 'neutral stimulus', 'unconditioned response'], 2, 0, 'Before pairing with food, the bell produces no salivation, so it is a neutral stimulus.', 4),
  card('AP U.S. History', 'Period 4: 1800–1848', 'The Market Revolution in the early 1800s was driven most directly by', ['the closing of the frontier', 'new transportation networks such as canals and railroads', 'the end of slavery in the North', 'tariff reductions after the War of 1812'], 1, 2, 'Canals, turnpikes and railroads linked farms to distant markets and drove specialization.', 2),
  card('AP U.S. History', 'Period 3: 1754–1800', 'The Articles of Confederation were weak mainly because the national government could not', ['declare war', 'make treaties', 'levy taxes', 'coin money'], 2, 1, 'Congress could only request money from the states, so it could not fund itself.', 5),
  card('AP U.S. History', 'Period 4: 1800–1848', 'Which belief best describes the Monroe Doctrine (1823)?', ['The U.S. would annex Canada', 'European powers should not colonize the Western Hemisphere further', 'The U.S. would join European alliances', 'Slavery should expand westward'], 1, 3, 'Monroe warned Europe against new colonization or intervention in the Americas.', 1),
  card('AP Biology', 'Unit 3: Cellular Energetics', 'Most of the ATP made in aerobic respiration comes from', ['glycolysis', 'the Krebs cycle', 'oxidative phosphorylation', 'fermentation'], 2, 0, 'The electron transport chain and chemiosmosis produce roughly 26–28 of the ~30 ATP.', 2),
  card('AP Biology', 'Unit 3: Cellular Energetics', 'A competitive inhibitor slows an enzyme by', ['changing the shape of the active site', 'binding to the active site', 'denaturing the enzyme', 'raising the activation energy'], 1, 0, 'Competitive inhibitors resemble the substrate and occupy the active site; more substrate can out-compete them.', 3),
  card('AP Biology', 'Unit 2: Cell Structure and Function', 'A cell placed in a hypertonic solution will', ['swell and may burst', 'lose water and shrink', 'stay the same size', 'take in solute by osmosis'], 1, 0, 'Water moves out of the cell toward the higher solute concentration.', 4),
  card('AP English Language and Composition', 'Unit 3', 'A writer who addresses an opposing view and then rebuts it is using', ['a concession and refutation', 'an ad hominem', 'anaphora', 'a false dilemma'], 0, 2, 'Acknowledging a counterargument (concession) and answering it (refutation) builds credibility.', 2),
];

const DECKS = [
  ['AP Calculus AB: Derivative tests', 'AP Calculus AB', 'Analytical applications', 'Made by you · Unit 5', true, [
    ['First Derivative Test', "If $f'$ changes from + to − at $c$, $f$ has a relative max at $c$; from − to +, a relative min."],
    ['Second Derivative Test', "If $f'(c) = 0$ and $f''(c) < 0$, relative max; if $f''(c) > 0$, relative min."],
    ['Candidates Test', 'Evaluate $f$ at critical points and endpoints; the largest value is the absolute max.'],
    ['Point of inflection', "Where $f''$ changes sign (and $f$ is continuous)."],
    ['Mean Value Theorem', "Continuous on $[a,b]$, differentiable on $(a,b)$ ⇒ some $c$ has $f'(c) = \\frac{f(b)-f(a)}{b-a}$."],
    ['Concave up', "$f''(x) > 0$: the graph bends upward and $f'$ is increasing."],
  ]],
  ['AP Psychology: Memory', 'AP Psychology', 'Memory', 'Imported from Quizlet · 8 cards', false, [
    ['Encoding', 'Getting information into the memory system.'],
    ['Spacing effect', 'Distributed study produces better long-term retention than massed study.'],
    ['Proactive interference', 'Old information disrupts recall of new information.'],
    ['Retroactive interference', 'New information disrupts recall of old information.'],
    ['Serial position effect', 'Better recall of the first and last items in a list.'],
    ['Forgetting curve', "Ebbinghaus: most forgetting happens soon after learning, then levels off."],
    ['Implicit memory', 'Retention without conscious recall, like skills and conditioned responses.'],
    ['Chunking', 'Grouping items into meaningful units to hold more in working memory.'],
  ]],
  ['APUSH Period 4: Key terms', 'AP U.S. History', 'Period 4', 'Made by you · 1800–1848', true, [
    ['Market Revolution', 'Shift to a market economy driven by canals, railroads and factories.'],
    ['Erie Canal (1825)', 'Linked the Great Lakes to New York City and cut shipping costs.'],
    ['Monroe Doctrine (1823)', 'Warned Europe against new colonization in the Western Hemisphere.'],
    ['Second Great Awakening', 'Religious revival that fueled reform movements like abolition and temperance.'],
    ['Indian Removal Act (1830)', 'Authorized forced relocation of Native nations west of the Mississippi.'],
  ]],
  ['AP Biology: Cellular respiration', 'AP Biology', 'Cellular energetics', 'Made by you · Unit 3', true, [
    ['Glycolysis', 'Glucose → 2 pyruvate in the cytosol; net 2 ATP and 2 NADH.'],
    ['Krebs cycle', 'In the mitochondrial matrix; makes NADH, FADH₂ and CO₂.'],
    ['Electron transport chain', 'Pumps H⁺ into the intermembrane space to build a gradient.'],
    ['Chemiosmosis', 'H⁺ flows back through ATP synthase, making most of the ATP.'],
    ['Final electron acceptor', 'Oxygen, which forms water.'],
  ]],
];

const CLASSMATES = [
  ['Ava Thompson', 212, 187, 9], ['Ethan Nguyen', 168, 141, 7], ['Sofia Martinez', 154, 126, 6],
  ['Noah Patel', 190, 152, 8], ['Lily Chen', 131, 103, 5], ['Marcus Johnson', 120, 91, 5],
  ['Priya Shah', 98, 76, 4], ['Diego Ramirez', 143, 104, 6], ['Hannah Kim', 87, 63, 4],
  ['Caleb Brooks', 76, 51, 3], ['Zoe Williams', 64, 45, 3], ['Owen Garcia', 52, 34, 2],
];

const PAST_TESTS = [
  ['AP Calculus AB', 'mcq', [UNIT5], 15, 12, 4, 2],
  ['AP Psychology', 'mcq', ['Unit 2: Cognition'], 20, 17, 5, 4],
  ['AP U.S. History', 'mcq', ['Period 4: 1800–1848'], 20, 14, 4, 6],
  ['AP Biology', 'mcq', ['Unit 3: Cellular Energetics'], 15, 10, 3, 9],
];

// ---------- backup + seed --------------------------------------------------------

const plain = (v) => {
  if (v instanceof Timestamp) return { __ts: v.toMillis() };
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
};

async function seedAll() {
  const backup = {};
  const keep = (ref, data) => { backup[ref.path] = plain(data); };
  const snapAll = async (q) => (await q.get()).docs;

  // What gets replaced or removed.
  const userRef = db.doc(`users/${UID}`);
  keep(userRef, (await userRef.get()).data());
  const tasks = await snapAll(db.collection(`users/${UID}/tasks`));
  const queueRef = db.doc(`users/${UID}/progress/reviewQueue`);
  const decks = await snapAll(db.collection('flashcardDecks').where('userId', '==', UID));
  const tests = await snapAll(db.collection('practiceTests').where('userId', '==', UID));
  const progressRef = db.doc(`testProgress/${UID}_inprogress`);
  for (const d of [...tasks, ...decks, ...tests]) keep(d.ref, d.data());
  for (const r of [queueRef, progressRef]) { const s = await r.get(); if (s.exists) keep(r, s.data()); }
  const dir = path.join(here, 'backup');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`backed up ${Object.keys(backup).length} docs -> ${path.relative(process.cwd(), file)}`);

  // Clear the test junk the film would show. Only this account's own documents:
  // classes shared with other accounts are left alone.
  const batch = db.batch();
  for (const d of [...tasks, ...decks, ...tests]) batch.delete(d.ref);
  await batch.commit();

  // Profile.
  await userRef.set({
    fullName: STUDENT, displayName: STUDENT, theme: 'dark',
    subjects: ['calculusAB', 'psychology', 'usHistory', 'biology', 'englishLanguageAndComposition'],
    aiSchedule: [], learningHistory: [],
  }, { merge: true });

  // Assignments, as if imported from Canvas and Schoology.
  for (const [i, [name, subject, type, difficulty, minutes, dueIn, source]] of ASSIGNMENTS.entries()) {
    await db.collection(`users/${UID}/tasks`).add({
      name, subject, type, difficulty, estimated_time: minutes, timeRequired: minutes / 60, timeSpent: 0,
      deadline: at(dueIn), description: '', pages: 0, priority: dueIn <= 4 ? 'high' : 'medium',
      source, schoologyId: `demo-${source}-${i + 1}`, courseName: subject, is_completed: false,
      created_at: at(-3, 16, 5), syncedAt: at(0, 7, 30),
    });
  }

  await resetQueue();

  for (const [title, subject, topic, description, isManual, cards] of DECKS) {
    await db.collection('flashcardDecks').add({
      userId: UID, title, subject, topic, description, isManual, isPublic: false,
      cards: cards.map(([question, answer]) => ({ question, answer })), cardCount: cards.length,
      difficulty: 'Medium', progress: 0, creatorName: STUDENT, lastStudied: null,
      createdAt: at(-6, 18, 20), lastUpdated: at(-1, 20, 10),
    });
  }

  for (const [subject, section, units, total, correct, apScore, daysAgo] of PAST_TESTS) {
    const userAnswers = Object.fromEntries(Array.from({ length: total }, (_, i) => [i + 1, 0]));
    await db.collection('practiceTests').add({
      userId: UID, subject, section, subsection: null, selectedUnits: units, userAnswers, timeSpent: total * 75,
      questions: subject === 'AP Calculus AB' ? mcqQuestions : [],
      results: {
        score: correct, totalPoints: total, percentage: Math.round((correct / total) * 100), apScore,
        questionResults: [], timeSpent: total * 75,
        breakdown: { mcq: { correct, total, percentage: Math.round((correct / total) * 100) } },
      },
      createdAt: at(-daysAgo, 19, 40),
    });
  }

  // A class with invented classmates for the leaderboard shot.
  const classRef = db.doc(`classes/${CLASS_CODE}`);
  await classRef.set({
    name: 'Period 2 AP Calculus AB', subjects: ['AP Calculus AB'],
    ownerIds: ['demo-teacher'], ownerId: 'demo-teacher', ownerName: 'Ms. Okafor',
    memberCount: CLASSMATES.length + 1, archived: false, createdAt: at(-40, 8, 0),
  });
  const rows = [[STUDENT, 176, 152, 8, UID], ...CLASSMATES.map((c, i) => [...c, `demo-student-${i + 1}`])];
  for (const [displayName, questionsAnswered, correctAnswers, testsTaken, uid] of rows) {
    await db.doc(`classes/${CLASS_CODE}/members/${uid}`).set({
      userId: uid, displayName, questionsAnswered, correctAnswers, testsTaken,
      joinedAt: at(-38, 9, 0), lastActive: at(-1, 21, 0),
    });
  }
  await db.doc(`users/${UID}/classes/${CLASS_CODE}`).set({
    classId: CLASS_CODE, name: 'Period 2 AP Calculus AB', subjects: ['AP Calculus AB'], joinedAt: at(-38, 9, 0),
  });

  await plantTest('frq-test');
  console.log('seeded');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const kind = process.argv[2];
  await (kind ? plantTest(kind) : seedAll());
}
