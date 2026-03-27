// Lazy-loaded modular curriculum data
// Each subject is loaded on demand via dynamic import() and cached.

// Map of subject keys to their dynamic import functions
const subjectImports = {
  artHistory: () => import('./art-history'),
  biology: () => import('./biology'),
  calculusAB: () => import('./calculus-a-b'),
  calculusBC: () => import('./calculus-b-c'),
  chemistry: () => import('./chemistry'),
  computerScienceA: () => import('./computer-science-a'),
  computerSciencePrinciples: () => import('./computer-science-principles'),
  englishLanguageAndComposition: () => import('./english-language-and-composition'),
  englishLiteratureAndComposition: () => import('./english-literature-and-composition'),
  environmentalScience: () => import('./environmental-science'),
  europeanHistory: () => import('./european-history'),
  humanGeography: () => import('./human-geography'),
  macroeconomics: () => import('./macroeconomics'),
  microeconomics: () => import('./microeconomics'),
  musicTheory: () => import('./music-theory'),
  physics1: () => import('./physics1'),
  physics2: () => import('./physics2'),
  physicsC_Mechanics: () => import('./physics-c--mechanics'),
  physicsC_ElectricityMagnetism: () => import('./physics-c--electricity-magnetism'),
  psychology: () => import('./psychology'),
  precalculus: () => import('./precalculus'),
  statistics: () => import('./statistics'),
  usGovernmentPolitics: () => import('./us-government-politics'),
  usHistory: () => import('./us-history'),
  worldHistory: () => import('./world-history'),
  studioArt: () => import('./studio-art'),
  research: () => import('./research'),
  seminar: () => import('./seminar'),
  spanishLanguage: () => import('./spanish-language'),
  frenchLanguage: () => import('./french-language'),
  germanLanguage: () => import('./german-language'),
  italianLanguage: () => import('./italian-language'),
  chineseLanguage: () => import('./chinese-language'),
  japaneseLanguage: () => import('./japanese-language'),
  latin: () => import('./latin'),
  comparativeGovernment: () => import('./comparative-government'),
  spanishLiterature: () => import('./spanish-literature'),
  studioArt2D: () => import('./studio-art2-d'),
  studioArt3D: () => import('./studio-art3-d'),
  studioArtDrawing: () => import('./studio-art-drawing'),
};

// Lightweight sync map of subject names (no need to load full data just for names)
const subjectNames = {
  artHistory: "AP Art History",
  biology: "AP Biology",
  calculusAB: "AP Calculus AB",
  calculusBC: "AP Calculus BC",
  chemistry: "AP Chemistry",
  computerScienceA: "AP Computer Science A",
  computerSciencePrinciples: "AP Computer Science Principles",
  englishLanguageAndComposition: "AP English Language and Composition",
  englishLiteratureAndComposition: "AP English Literature and Composition",
  environmentalScience: "AP Environmental Science",
  europeanHistory: "AP European History",
  humanGeography: "AP Human Geography",
  macroeconomics: "AP Macroeconomics",
  microeconomics: "AP Microeconomics",
  musicTheory: "AP Music Theory",
  physics1: "AP Physics 1: Algebra-Based",
  physics2: "AP Physics 2: Algebra-Based",
  physicsC_Mechanics: "AP Physics C: Mechanics",
  physicsC_ElectricityMagnetism: "AP Physics C: Electricity and Magnetism",
  psychology: "AP Psychology",
  precalculus: "AP Precalculus",
  statistics: "AP Statistics",
  usGovernmentPolitics: "AP United States Government and Politics",
  usHistory: "AP United States History",
  worldHistory: "AP World History: Modern",
  studioArt: "AP Studio Art and Design",
  research: "AP Research",
  seminar: "AP Seminar",
  spanishLanguage: "AP Spanish Language and Culture",
  frenchLanguage: "AP French Language and Culture",
  germanLanguage: "AP German Language and Culture",
  italianLanguage: "AP Italian Language and Culture",
  chineseLanguage: "AP Chinese Language and Culture",
  japaneseLanguage: "AP Japanese Language and Culture",
  latin: "AP Latin",
  comparativeGovernment: "AP Comparative Government and Politics",
  spanishLiterature: "AP Spanish Literature and Culture",
  studioArt2D: "AP Studio Art: 2-D Design",
  studioArt3D: "AP Studio Art: 3-D Design",
  studioArtDrawing: "AP Studio Art: Drawing",
};

// Comprehensive display-name → key mapping for all subjects
const displayNameMap = {
  // Arts
  'AP Art History': 'artHistory',
  'AP Studio Art and Design': 'studioArt',
  'AP Studio Art: 2-D Design': 'studioArt2D',
  'AP Studio Art: 3-D Design': 'studioArt3D',
  'AP Studio Art: Drawing': 'studioArtDrawing',
  'AP Music Theory': 'musicTheory',

  // Sciences
  'AP Biology': 'biology',
  'AP Chemistry': 'chemistry',
  'AP Environmental Science': 'environmentalScience',
  'AP Physics 1': 'physics1',
  'AP Physics 1: Algebra-Based': 'physics1',
  'AP Physics 2': 'physics2',
  'AP Physics 2: Algebra-Based': 'physics2',
  'AP Physics C: Mechanics': 'physicsC_Mechanics',
  'AP Physics C: Electricity and Magnetism': 'physicsC_ElectricityMagnetism',
  'AP Physics C: E&M': 'physicsC_ElectricityMagnetism',
  'AP Psychology': 'psychology',

  // Math
  'AP Calculus AB': 'calculusAB',
  'AP Calculus BC': 'calculusBC',
  'AP Precalculus': 'precalculus',
  'AP Statistics': 'statistics',

  // Computer Science
  'AP Computer Science A': 'computerScienceA',
  'AP Computer Science Principles': 'computerSciencePrinciples',
  'AP CS Principles': 'computerSciencePrinciples',

  // English
  'AP English Language and Composition': 'englishLanguageAndComposition',
  'AP English Language': 'englishLanguageAndComposition',
  'AP English Literature and Composition': 'englishLiteratureAndComposition',
  'AP English Literature': 'englishLiteratureAndComposition',

  // History & Social Sciences
  'AP European History': 'europeanHistory',
  'AP Human Geography': 'humanGeography',
  'AP Macroeconomics': 'macroeconomics',
  'AP Microeconomics': 'microeconomics',
  'AP United States History': 'usHistory',
  'AP U.S. History': 'usHistory',
  'AP US History': 'usHistory',
  'AP United States Government and Politics': 'usGovernmentPolitics',
  'AP U.S. Government and Politics': 'usGovernmentPolitics',
  'AP US Government': 'usGovernmentPolitics',
  'AP Comparative Government and Politics': 'comparativeGovernment',
  'AP Government and Politics: Comparative': 'comparativeGovernment',
  'AP Comparative Government': 'comparativeGovernment',
  'AP World History: Modern': 'worldHistory',
  'AP World History': 'worldHistory',

  // World Languages
  'AP Chinese Language and Culture': 'chineseLanguage',
  'AP Chinese': 'chineseLanguage',
  'AP French Language and Culture': 'frenchLanguage',
  'AP French': 'frenchLanguage',
  'AP German Language and Culture': 'germanLanguage',
  'AP German': 'germanLanguage',
  'AP Italian Language and Culture': 'italianLanguage',
  'AP Italian': 'italianLanguage',
  'AP Japanese Language and Culture': 'japaneseLanguage',
  'AP Japanese': 'japaneseLanguage',
  'AP Latin': 'latin',
  'AP Spanish Language and Culture': 'spanishLanguage',
  'AP Spanish Language': 'spanishLanguage',
  'AP Spanish Literature and Culture': 'spanishLiterature',
  'AP Spanish Literature': 'spanishLiterature',

  // Special Programs
  'AP Research': 'research',
  'AP Seminar': 'seminar',
  'AP African American Studies': 'africanAmericanStudies',
};

// Cache for loaded subject data
const cache = {};

/**
 * Resolve a subject string (camelCase key, display name, or fuzzy match) to a canonical key.
 * Returns the key or null.
 */
const resolveSubjectKey = (subject) => {
  // Direct key match
  if (subjectImports[subject]) return subject;

  // Display name lookup
  const mappedKey = displayNameMap[subject];
  if (mappedKey && subjectImports[mappedKey]) return mappedKey;

  // Normalized fuzzy lookup
  const normalizedSubject = subject.toLowerCase().replace(/^ap\s+/i, '').replace(/[\s\-:]+/g, '');
  for (const key of Object.keys(subjectImports)) {
    const normalizedKey = key.toLowerCase().replace(/[\s\-_]+/g, '');
    if (normalizedKey === normalizedSubject) return key;
  }

  return null;
};

/**
 * Get curriculum data for a subject. Returns a Promise that resolves to the subject data object, or null.
 * Supports camelCase keys, display names, and fuzzy matching.
 */
export const getCurriculumData = async (subject) => {
  const key = resolveSubjectKey(subject);
  if (!key) return null;

  // Return from cache if available
  if (cache[key]) return cache[key];

  // Lazy load
  try {
    const mod = await subjectImports[key]();
    cache[key] = mod.default;
    return mod.default;
  } catch (err) {
    console.error(`Failed to load curriculum data for "${key}":`, err);
    return null;
  }
};

/**
 * Synchronous version of getCurriculumData — returns cached data or null.
 * Use this in render paths where async is not possible (JSX expressions).
 * Data must have been loaded via the async getCurriculumData first.
 */
export const getCurriculumDataSync = (subject) => {
  const key = resolveSubjectKey(subject);
  if (!key) return null;
  return cache[key] || null;
};

/**
 * Get the display name of a subject synchronously (no data loading needed).
 * Useful in render paths where async is not convenient.
 */
export const getSubjectName = (subject) => {
  const key = resolveSubjectKey(subject);
  if (!key) return subject;
  return subjectNames[key] || subject;
};

/**
 * Get all available subject keys (synchronous).
 */
export const getAvailableSubjects = () => {
  return Object.keys(subjectImports);
};

/**
 * Get subject units (async). Returns the units array or [].
 */
export const getSubjectUnits = async (subject) => {
  const curriculum = await getCurriculumData(subject);
  return curriculum ? curriculum.units : [];
};

/**
 * Get all topics for a subject (async). Returns a flat array of topic strings.
 */
export const getSubjectTopics = async (subject) => {
  const units = await getSubjectUnits(subject);
  return units.flatMap(unit => unit.topics);
};

/**
 * Generate contextual curriculum information for AI prompts (async).
 */
export const generateCurriculumContext = async (subject) => {
  const curriculum = await getCurriculumData(subject);
  if (!curriculum) return "";

  return `
OFFICIAL AP ${curriculum.name.toUpperCase()} CURRICULUM CONTEXT:

Course Description: ${curriculum.description}

Exam Format: ${curriculum.examFormat.duration}
${curriculum.examFormat.sections.map(section =>
    `- ${section.name}: ${section.questions} questions, ${section.time}, ${section.weight}`
  ).join('\n')}

Big Ideas:
${curriculum.bigIdeas.map(idea => `• ${idea}`).join('\n')}

Key Units (with exam weights):
${curriculum.units.map(unit =>
    `• ${unit.name} (${unit.weight}): ${unit.topics.slice(0, 4).join(', ')}${unit.topics.length > 4 ? '...' : ''}`
  ).join('\n')}

Essential Skills:
${curriculum.keySkills.map(skill => `• ${skill}`).join('\n')}

Study Recommendations:
${curriculum.studyTips.map(tip => `• ${tip}`).join('\n')}
`;
};
