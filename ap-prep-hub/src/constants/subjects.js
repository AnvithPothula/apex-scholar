import { COURSES } from '../data/packs/catalog';

export const AP_SUBJECTS = {
    "AP African American Studies": { name: "AP African American Studies", short: "AP African American Studies", description: "Origins of the African diaspora through emancipation, the Black freedom movements and today.", icon: "📜" },
    "AP Art History": { name: "AP Art History", short: "AP Art History", description: "The 250 required works, from prehistoric art to contemporary, and how to compare them.", icon: "🎨" },
    "AP Biology": { name: "AP Biology", short: "AP Biology", description: "Cells, energetics, genetics, evolution and ecology, plus the experiment and data FRQs.", icon: "🔬" },
    "AP Business with Personal Finance": { name: "AP Business with Personal Finance", short: "AP Business with Personal Finance", description: "Starting a business, budgeting, credit, investing and taxes.", icon: "💼" },
    "AP Cybersecurity": { name: "AP Cybersecurity", short: "AP Cybersecurity", description: "Spotting vulnerabilities, defending networks and devices, and responding to attacks.", icon: "🔐" },
    "AP Calculus AB": { name: "AP Calculus AB", short: "AP Calculus AB", description: "Limits, derivatives, integrals and differential equations, with FRQ practice.", icon: "∫" },
    "AP Calculus BC": { name: "AP Calculus BC", short: "AP Calculus BC", description: "Everything in AB plus series, and parametric, polar and vector functions.", icon: "∬" },
    "AP Chemistry": { name: "AP Chemistry", short: "AP Chemistry", description: "Atoms, bonding, reactions, kinetics, equilibrium, acids and bases, and thermodynamics.", icon: "🧪" },
    "AP Chinese Language and Culture": { name: "AP Chinese Language and Culture", short: "AP Chinese", description: "Mandarin conversation, story narration, emails and cultural presentations.", icon: "中文" },
    "AP Computer Science A": { name: "AP Computer Science A", short: "AP Computer Science A", description: "Java: classes, loops, arrays, ArrayLists and 2D arrays, and the four FRQ types.", icon: "💻" },
    "AP Computer Science Principles": { name: "AP Computer Science Principles", short: "AP CS Principles", description: "Algorithms, data, the internet and computing's impact, plus the Create task.", icon: "💻" },
    "AP English Language and Composition": { name: "AP English Language and Composition", short: "AP English Language", description: "Rhetorical analysis, argument and synthesis essays, and close reading of nonfiction.", icon: "✍️" },
    "AP English Literature and Composition": { name: "AP English Literature and Composition", short: "AP English Literature", description: "Poetry, prose fiction and drama, and the three literary-analysis essays.", icon: "📚" },
    "AP Environmental Science": { name: "AP Environmental Science", short: "AP Environmental Science", description: "Ecosystems, populations, energy, pollution and the calculation FRQs.", icon: "🌍" },
    "AP European History": { name: "AP European History", short: "AP European History", description: "Renaissance to the European Union, with DBQ, LEQ and SAQ practice.", icon: "🏰" },
    "AP French Language and Culture": { name: "AP French Language and Culture", short: "AP French", description: "French emails, argumentative essays, conversations and cultural comparisons.", icon: "🇫🇷" },
    "AP German Language and Culture": { name: "AP German Language and Culture", short: "AP German", description: "German grammar and reading, and the email, essay and conversation tasks.", icon: "🇩🇪" },
    "AP Comparative Government and Politics": { name: "AP Comparative Government and Politics", short: "AP Comparative Government", description: "The governments of the UK, Mexico, Russia, Iran, China and Nigeria compared.", icon: "🏛" },
    "AP Human Geography": { name: "AP Human Geography", short: "AP Human Geography", description: "Population, migration, culture, cities, farming and development, and the models behind them.", icon: "🗺️" },
    "AP Italian Language and Culture": { name: "AP Italian Language and Culture", short: "AP Italian", description: "Italian reading and listening, and the email, essay and presentation tasks.", icon: "🇮🇹" },
    "AP Japanese Language and Culture": { name: "AP Japanese Language and Culture", short: "AP Japanese", description: "Japanese in kana and kanji, conversation, and cultural presentations.", icon: "日本" },
    "AP Latin": { name: "AP Latin", short: "AP Latin", description: "Translating and analyzing Vergil's Aeneid and Caesar's Gallic War.", icon: "🏛️" },
    "AP Macroeconomics": { name: "AP Macroeconomics", short: "AP Macroeconomics", description: "GDP, inflation, unemployment, and monetary and fiscal policy, with the graphs.", icon: "📈" },
    "AP Microeconomics": { name: "AP Microeconomics", short: "AP Microeconomics", description: "Supply and demand, firm costs, market structures and market failure, with the graphs.", icon: "📉" },
    "AP Music Theory": { name: "AP Music Theory", short: "AP Music Theory", description: "Scales, harmony, voice leading, sight-singing and dictation.", icon: "🎵" },
    "AP Physics 1: Algebra-Based": { name: "AP Physics 1: Algebra-Based", short: "AP Physics 1", description: "Kinematics, forces, energy, momentum, rotation and fluids, using algebra.", icon: "🔬" },
    "AP Physics 2: Algebra-Based": { name: "AP Physics 2: Algebra-Based", short: "AP Physics 2", description: "Thermodynamics, electricity, magnetism, optics and modern physics.", icon: "⚛️" },
    "AP Physics C: Mechanics": { name: "AP Physics C: Mechanics", short: "AP Physics C: Mechanics", description: "Calculus-based kinematics, Newton's laws, energy, momentum, rotation and oscillations.", icon: "📐" },
    "AP Physics C: Electricity and Magnetism": { name: "AP Physics C: Electricity and Magnetism", short: "AP Physics C: E&M", description: "Calculus-based electrostatics, circuits, magnetic fields and induction.", icon: "⚡" },
    "AP Precalculus": { name: "AP Precalculus", short: "AP Precalculus", description: "Polynomial, rational, exponential, logarithmic and trig functions, and modeling with them.", icon: "📐" },
    "AP Psychology": { name: "AP Psychology", short: "AP Psychology", description: "Brain and behavior, cognition, development, learning and mental health, with the AAQ and EBQ.", icon: "🧠" },
    "AP Spanish Language and Culture": { name: "AP Spanish Language and Culture", short: "AP Spanish Language", description: "Spanish emails, persuasive essays, conversations and cultural comparisons.", icon: "🇪🇸" },
    "AP Spanish Literature and Culture": { name: "AP Spanish Literature and Culture", short: "AP Spanish Literature", description: "The required readings, from medieval Spain to modern Latin America, analyzed in Spanish.", icon: "📖" },
    "AP Statistics": { name: "AP Statistics", short: "AP Statistics", description: "Exploring data, sampling and experiments, probability, and inference.", icon: "📊" },
    "AP U.S. Government and Politics": { name: "AP U.S. Government and Politics", short: "AP U.S. Government", description: "The Constitution, the three branches, civil rights and liberties, and the required cases.", icon: "🇺🇸" },
    "AP U.S. History": { name: "AP U.S. History", short: "AP U.S. History", description: "Colonization to the present, with DBQ, LEQ and SAQ practice.", icon: "🦅" },
    "AP World History: Modern": { name: "AP World History: Modern", short: "AP World History", description: "Empires, trade networks, revolutions and globalization since 1200 CE.", icon: "🌐" },
};

// ---- One name per course --------------------------------------------------
//
// Every page names a course one of two ways: the official College Board name
// (headings, page titles, pickers, prose) or its fixed short form (chips,
// tags, compact labels). Both come from here. Anything holding a subject in
// another form (a curriculum key like "usHistory", a URL slug, or an older
// stored name like "AP US History") resolves through courseFor().


// Portfolio courses have no Learn units, so the catalog leaves them out.
const ART = [
  { id: 'ap-art-and-design', key: 'studioArt', subject: 'AP Art and Design' },
  { id: 'ap-2-d-art-and-design', key: 'studioArt2D', subject: 'AP 2-D Art and Design' },
  { id: 'ap-3-d-art-and-design', key: 'studioArt3D', subject: 'AP 3-D Art and Design' },
  { id: 'ap-drawing', key: 'studioArtDrawing', subject: 'AP Drawing' },
];

// Names this app used before (or that students and links still use).
const LEGACY = {
  'AP Government and Politics: Comparative': 'AP Comparative Government and Politics',
  'AP Government and Politics: United States': 'AP U.S. Government and Politics',
  'AP Studio Art and Design': 'AP Art and Design',
  'AP Studio Art: 2-D Design': 'AP 2-D Art and Design',
  'AP Studio Art: 3-D Design': 'AP 3-D Art and Design',
  'AP Studio Art: Drawing': 'AP Drawing',
  'AP CSA': 'AP Computer Science A',
  'AP CS A': 'AP Computer Science A',
  'AP CSP': 'AP Computer Science Principles',
  'AP Lang': 'AP English Language and Composition',
  'AP Lit': 'AP English Literature and Composition',
  'APUSH': 'AP U.S. History',
};

const norm = (s) => String(s || '').toLowerCase().replace(/united states/g, 'us').replace(/[^a-z0-9]/g, '');

const ROWS = [...COURSES, ...ART].map((c) => ({
  slug: c.id,
  key: c.key,
  name: c.subject,
  short: AP_SUBJECTS[c.subject]?.short || c.subject,
}));
const BY_NAME = new Map(ROWS.map((r) => [r.name, r]));
const INDEX = new Map();
ROWS.forEach((r) => [r.name, r.short, r.key, r.slug, r.slug.replace(/^ap-/, '')].forEach((n) => INDEX.set(norm(n), r)));
Object.entries(LEGACY).forEach(([old, name]) => INDEX.set(norm(old), BY_NAME.get(name)));

/** The course row ({ slug, key, name, short }) for any name, key or slug, or null. */
export function courseFor(subject) {
  return INDEX.get(norm(subject)) || null;
}

// Courses outside AP_SUBJECTS (portfolio and Capstone), so they stay out of the pickers.
const EXTRA_BLURBS = {
  studioArt: 'Planning your portfolio: the sustained investigation, selected works and written evidence.',
  studioArt2D: 'Your 2-D portfolio: the sustained investigation, selected works and written evidence.',
  studioArt3D: 'Your 3-D portfolio: the sustained investigation, selected works and written evidence.',
  studioArtDrawing: 'Your Drawing portfolio: the sustained investigation, selected works and written evidence.',
  research: 'Designing, carrying out and writing up your academic paper and presentation.',
  seminar: 'The team project, individual research report, written argument and end-of-course exam.',
};

/** One line on what the course covers, for any name, key or slug, or ''. */
export const subjectBlurb = (subject) =>
  AP_SUBJECTS[courseFor(subject)?.name]?.description || EXTRA_BLURBS[subject] || '';

/** Official College Board name; unknown input comes back unchanged. */
export const subjectName = (subject) => courseFor(subject)?.name || subject;

/** Fixed short form for tight spots; unknown input comes back unchanged. */
export const shortSubjectName = (subject) => courseFor(subject)?.short || subject;

/** URL slug shared by Learn, tutors and diagnostics ("ap-biology"), or null. */
export const subjectSlug = (subject) => courseFor(subject)?.slug || null;

/**
 * A title that starts with a course (AP US History — Period 3) shown with
 * that course's short form. Seeded and older decks were titled with older
 * names; the rest of the title is left alone.
 */
export function courseTitle(title) {
  const m = /^(.+?)( [—-] )(.*)$/s.exec(title || '');
  // Only titles that already lead with an AP course; "Biology - cells" is the student's own wording.
  return m && /^AP /.test(m[1]) && courseFor(m[1]) ? `${courseFor(m[1]).short}${m[2]}${m[3]}` : title;
}

// Default export for backwards compatibility
export const subjects = AP_SUBJECTS;
export default AP_SUBJECTS;
