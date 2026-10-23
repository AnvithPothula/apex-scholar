import { COURSES } from '../data/packs/catalog';

export const AP_SUBJECTS = {
    "AP African American Studies": { name: "AP African American Studies", short: "AP African American Studies", description: "Explore the history, culture, and movements of the African diaspora.", icon: "📜" },
    "AP Art History": { name: "AP Art History", short: "AP Art History", description: "Explore art across cultures and time periods.", icon: "🎨" },
    "AP Biology": { name: "AP Biology", short: "AP Biology", description: "Dive into the science of living organisms.", icon: "🔬" },
    "AP Business with Personal Finance": { name: "AP Business with Personal Finance", short: "AP Business with Personal Finance", description: "Business, entrepreneurship, and managing your own money.", icon: "💼" },
    "AP Cybersecurity": { name: "AP Cybersecurity", short: "AP Cybersecurity", description: "Find vulnerabilities, stop attacks, secure systems.", icon: "🔐" },
    "AP Calculus AB": { name: "AP Calculus AB", short: "AP Calculus AB", description: "Master derivatives, integrals, and limits.", icon: "∫" },
    "AP Calculus BC": { name: "AP Calculus BC", short: "AP Calculus BC", description: "Advanced topics in calculus.", icon: "∬" },
    "AP Chemistry": { name: "AP Chemistry", short: "AP Chemistry", description: "Understand the composition of matter.", icon: "🧪" },
    "AP Chinese Language and Culture": { name: "AP Chinese Language and Culture", short: "AP Chinese", description: "Develop your Chinese language skills.", icon: "中文" },
    "AP Computer Science A": { name: "AP Computer Science A", short: "AP Computer Science A", description: "Learn Java and object-oriented programming.", icon: "💻" },
    "AP Computer Science Principles": { name: "AP Computer Science Principles", short: "AP CS Principles", description: "Learn the basics of computer science.", icon: "💻" },
    "AP English Language and Composition": { name: "AP English Language and Composition", short: "AP English Language", description: "Analyze rhetoric and compose arguments.", icon: "✍️" },
    "AP English Literature and Composition": { name: "AP English Literature and Composition", short: "AP English Literature", description: "Study and interpret literary works.", icon: "📚" },
    "AP Environmental Science": { name: "AP Environmental Science", short: "AP Environmental Science", description: "Examine the natural world and its challenges.", icon: "🌍" },
    "AP European History": { name: "AP European History", short: "AP European History", description: "Journey through Europe's past.", icon: "🏰" },
    "AP French Language and Culture": { name: "AP French Language and Culture", short: "AP French", description: "Enhance your French proficiency.", icon: "🇫🇷" },
    "AP German Language and Culture": { name: "AP German Language and Culture", short: "AP German", description: "Enhance your German proficiency.", icon: "🇩🇪" },
    "AP Comparative Government and Politics": { name: "AP Comparative Government and Politics", short: "AP Comparative Government", description: "Compare and contrast different political systems.", icon: "🏛" },
    "AP Human Geography": { name: "AP Human Geography", short: "AP Human Geography", description: "Study human populations and cultures.", icon: "🗺️" },
    "AP Italian Language and Culture": { name: "AP Italian Language and Culture", short: "AP Italian", description: "Immerse yourself in Italian language.", icon: "🇮🇹" },
    "AP Japanese Language and Culture": { name: "AP Japanese Language and Culture", short: "AP Japanese", description: "Explore Japanese language and society.", icon: "日本" },
    "AP Latin": { name: "AP Latin", short: "AP Latin", description: "Read and analyze classical texts.", icon: "🏛️" },
    "AP Macroeconomics": { name: "AP Macroeconomics", short: "AP Macroeconomics", description: "Study economy-wide phenomena.", icon: "📈" },
    "AP Microeconomics": { name: "AP Microeconomics", short: "AP Microeconomics", description: "Analyze individual economic decisions.", icon: "📉" },
    "AP Music Theory": { name: "AP Music Theory", short: "AP Music Theory", description: "Study musical structure, composition, and analysis.", icon: "🎵" },
    "AP Physics 1: Algebra-Based": { name: "AP Physics 1: Algebra-Based", short: "AP Physics 1", description: "Explore the fundamental principles of physics.", icon: "🔬" },
    "AP Physics 2: Algebra-Based": { name: "AP Physics 2: Algebra-Based", short: "AP Physics 2", description: "Advanced physics concepts and applications.", icon: "⚛️" },
    "AP Physics C: Mechanics": { name: "AP Physics C: Mechanics", short: "AP Physics C: Mechanics", description: "Delve into classical mechanics with calculus.", icon: "📐" },
    "AP Physics C: Electricity and Magnetism": { name: "AP Physics C: Electricity and Magnetism", short: "AP Physics C: E&M", description: "Master electromagnetism with calculus.", icon: "⚡" },
    "AP Precalculus": { name: "AP Precalculus", short: "AP Precalculus", description: "Build foundations for calculus and beyond.", icon: "📐" },
    "AP Psychology": { name: "AP Psychology", short: "AP Psychology", description: "Investigate the human mind and behavior.", icon: "🧠" },
    "AP Spanish Language and Culture": { name: "AP Spanish Language and Culture", short: "AP Spanish Language", description: "Master the Spanish language.", icon: "🇪🇸" },
    "AP Spanish Literature and Culture": { name: "AP Spanish Literature and Culture", short: "AP Spanish Literature", description: "Explore Spanish literature and culture.", icon: "📖" },
    "AP Statistics": { name: "AP Statistics", short: "AP Statistics", description: "Learn to collect, analyze, and interpret data.", icon: "📊" },
    "AP U.S. Government and Politics": { name: "AP U.S. Government and Politics", short: "AP U.S. Government", description: "Understand the American political system.", icon: "🇺🇸" },
    "AP U.S. History": { name: "AP U.S. History", short: "AP U.S. History", description: "Explore the history of the United States.", icon: "🦅" },
    "AP World History: Modern": { name: "AP World History: Modern", short: "AP World History", description: "Examine global history from 1200 CE.", icon: "🌐" },
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
