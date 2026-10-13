/**
 * Study packs that exist, keyed by URL slug (/study/<slug>). Content is loaded
 * on demand so it stays out of the main bundle.
 */
export const PACKS = {
  'ap-biology/unit-1': {
    subject: 'AP Biology',
    title: 'Unit 1: Chemistry of Life',
    file: 'apBiologyUnit1', // scripts/prerender.mjs reads the content from here
    load: () => import('./apBiologyUnit1'),
  },
  'ap-calculus-ab/unit-1': {
    subject: 'AP Calculus AB',
    title: 'Unit 1: Limits and Continuity',
    file: 'apCalculusAbUnit1',
    load: () => import('./apCalculusAbUnit1'),
  },
  'ap-psychology/unit-1': {
    subject: 'AP Psychology',
    title: 'Unit 1: Biological Bases of Behavior',
    file: 'apPsychologyUnit1',
    load: () => import('./apPsychologyUnit1'),
  },
  'ap-biology/unit-2': {
    subject: 'AP Biology',
    title: 'Unit 2: Cells',
    file: 'apBiologyUnit2',
    load: () => import('./apBiologyUnit2'),
  },
  'ap-calculus-ab/unit-2': {
    subject: 'AP Calculus AB',
    title: 'Unit 2: Differentiation: Definition and Fundamental Properties',
    file: 'apCalculusAbUnit2',
    load: () => import('./apCalculusAbUnit2'),
  },
  // BC Unit 1 is the same CED topics (1.1–1.16) as AB Unit 1, so it is the
  // same content with BC's subject, slug and exam weighting.
  'ap-calculus-bc/unit-1': {
    subject: 'AP Calculus BC',
    title: 'Unit 1: Limits and Continuity',
    file: 'apCalculusAbUnit1',
    overrides: { slug: 'ap-calculus-bc/unit-1', subject: 'AP Calculus BC', examWeight: '5–10% of the BC exam' },
    load: () => import('./apCalculusAbUnit1').then((m) => ({ default: { ...m.default, ...PACKS['ap-calculus-bc/unit-1'].overrides } })),
  },
  'ap-psychology/unit-2': {
    subject: 'AP Psychology',
    title: 'Unit 2: Cognition',
    file: 'apPsychologyUnit2',
    load: () => import('./apPsychologyUnit2'),
  },
  'ap-physics-1/unit-1': {
    subject: 'AP Physics 1: Algebra-Based',
    title: 'Unit 1: Kinematics',
    file: 'apPhysics1Unit1',
    load: () => import('./apPhysics1Unit1'),
  },
  'ap-environmental-science/unit-1': {
    subject: 'AP Environmental Science',
    title: 'Unit 1: The Living World: Ecosystems',
    file: 'apEnvironmentalScienceUnit1',
    load: () => import('./apEnvironmentalScienceUnit1'),
  },
  'ap-human-geography/unit-1': {
    subject: 'AP Human Geography',
    title: 'Unit 1: Thinking Geographically',
    file: 'apHumanGeographyUnit1',
    load: () => import('./apHumanGeographyUnit1'),
  },
  'ap-chemistry/unit-1': {
    subject: 'AP Chemistry',
    title: 'Unit 1: Atomic Structure and Properties',
    file: 'apChemistryUnit1',
    load: () => import('./apChemistryUnit1'),
  },
  'ap-statistics/unit-1': {
    subject: 'AP Statistics',
    title: 'Unit 1: Exploring One-Variable Data and Collecting Data',
    file: 'apStatisticsUnit1',
    load: () => import('./apStatisticsUnit1'),
  },
  'ap-precalculus/unit-1': {
    subject: 'AP Precalculus',
    title: 'Unit 1: Polynomial and Rational Functions',
    file: 'apPrecalculusUnit1',
    load: () => import('./apPrecalculusUnit1'),
  },
  'ap-physics-2/unit-9': {
    subject: 'AP Physics 2: Algebra-Based',
    title: 'Unit 9: Thermodynamics',
    file: 'apPhysics2Unit9',
    load: () => import('./apPhysics2Unit9'),
  },
  'ap-physics-c-mechanics/unit-1': {
    subject: 'AP Physics C: Mechanics',
    title: 'Unit 1: Kinematics',
    file: 'apPhysicsCMechanicsUnit1',
    load: () => import('./apPhysicsCMechanicsUnit1'),
  },
  'ap-physics-c-electricity-and-magnetism/unit-8': {
    subject: 'AP Physics C: Electricity and Magnetism',
    title: 'Unit 8: Electric Charges, Fields, and Gauss’s Law',
    file: 'apPhysicsCEMUnit8',
    load: () => import('./apPhysicsCEMUnit8'),
  },
  'ap-macroeconomics/unit-1': {
    subject: 'AP Macroeconomics',
    title: 'Unit 1: Basic Economic Concepts',
    file: 'apMacroeconomicsUnit1',
    load: () => import('./apMacroeconomicsUnit1'),
  },
  'ap-microeconomics/unit-1': {
    subject: 'AP Microeconomics',
    title: 'Unit 1: Basic Economic Concepts',
    file: 'apMicroeconomicsUnit1',
    load: () => import('./apMicroeconomicsUnit1'),
  },
  'ap-us-history/unit-1': {
    subject: 'AP U.S. History',
    title: 'Unit 1: Period 1, 1491–1607',
    file: 'apUsHistoryUnit1',
    load: () => import('./apUsHistoryUnit1'),
  },
  'ap-world-history-modern/unit-1': {
    subject: 'AP World History: Modern',
    title: 'Unit 1: The Global Tapestry',
    file: 'apWorldHistoryUnit1',
    load: () => import('./apWorldHistoryUnit1'),
  },
  'ap-european-history/unit-1': {
    subject: 'AP European History',
    title: 'Unit 1: Renaissance and Exploration',
    file: 'apEuropeanHistoryUnit1',
    load: () => import('./apEuropeanHistoryUnit1'),
  },
  'ap-us-government-and-politics/unit-1': {
    subject: 'AP U.S. Government and Politics',
    title: 'Unit 1: Foundations of American Democracy',
    file: 'apUsGovernmentUnit1',
    load: () => import('./apUsGovernmentUnit1'),
  },
  'ap-comparative-government-and-politics/unit-1': {
    subject: 'AP Government and Politics: Comparative',
    title: 'Unit 1: Political Systems, Regimes, and Governments',
    file: 'apComparativeGovernmentUnit1',
    load: () => import('./apComparativeGovernmentUnit1'),
  },
  'ap-computer-science-a/unit-1': {
    subject: 'AP Computer Science A',
    title: 'Unit 1: Using Objects and Methods',
    file: 'apComputerScienceAUnit1',
    load: () => import('./apComputerScienceAUnit1'),
  },
  'ap-computer-science-principles/unit-1': {
    subject: 'AP Computer Science Principles',
    title: 'Big Idea 1: Creative Development',
    file: 'apComputerSciencePrinciplesUnit1',
    load: () => import('./apComputerSciencePrinciplesUnit1'),
  },
  'ap-english-language-and-composition/unit-1': {
    subject: 'AP English Language and Composition',
    title: 'Unit 1: Rhetorical Situation, Claims, and Evidence',
    file: 'apEnglishLanguageUnit1',
    load: () => import('./apEnglishLanguageUnit1'),
  },
  'ap-english-literature-and-composition/unit-1': {
    subject: 'AP English Literature and Composition',
    title: 'Unit 1: Short Fiction I',
    file: 'apEnglishLiteratureUnit1',
    load: () => import('./apEnglishLiteratureUnit1'),
  },
  'ap-cybersecurity/unit-1': {
    subject: 'AP Cybersecurity',
    title: 'Unit 1: Introduction to Security',
    file: 'apCybersecurityUnit1',
    load: () => import('./apCybersecurityUnit1'),
  },
  'ap-business-with-personal-finance/unit-1': {
    subject: 'AP Business with Personal Finance',
    title: 'Unit 1: Businesses, Competition, and New Ideas',
    file: 'apBusinessPersonalFinanceUnit1',
    load: () => import('./apBusinessPersonalFinanceUnit1'),
  },
  'ap-art-history/unit-1': {
    subject: 'AP Art History',
    title: 'Unit 1: Global Prehistory, 30,000–500 BCE',
    file: 'apArtHistoryUnit1',
    load: () => import('./apArtHistoryUnit1'),
  },
  'ap-music-theory/unit-1': {
    subject: 'AP Music Theory',
    title: 'Unit 1: Music Fundamentals I',
    file: 'apMusicTheoryUnit1',
    load: () => import('./apMusicTheoryUnit1'),
  },
  'ap-latin/unit-1': {
    subject: 'AP Latin',
    title: 'Unit 1: Teacher’s Choice – Latin Prose',
    file: 'apLatinUnit1',
    load: () => import('./apLatinUnit1'),
  },
  'ap-african-american-studies/unit-1': {
    subject: 'AP African American Studies',
    title: 'Unit 1: Origins of the African Diaspora',
    file: 'apAfricanAmericanStudiesUnit1',
    load: () => import('./apAfricanAmericanStudiesUnit1'),
  },
  'ap-spanish-language-and-culture/unit-1': {
    subject: 'AP Spanish Language and Culture',
    title: 'Unit 1: Families and Communities',
    file: 'apSpanishLanguageUnit1',
    load: () => import('./apSpanishLanguageUnit1'),
  },
  'ap-french-language-and-culture/unit-1': {
    subject: 'AP French Language and Culture',
    title: 'Unit 1: Families and Communities',
    file: 'apFrenchLanguageUnit1',
    load: () => import('./apFrenchLanguageUnit1'),
  },
  'ap-german-language-and-culture/unit-1': {
    subject: 'AP German Language and Culture',
    title: 'Unit 1: Families and Communities',
    file: 'apGermanLanguageUnit1',
    load: () => import('./apGermanLanguageUnit1'),
  },
  'ap-italian-language-and-culture/unit-1': {
    subject: 'AP Italian Language and Culture',
    title: 'Unit 1: Families and Communities',
    file: 'apItalianLanguageUnit1',
    load: () => import('./apItalianLanguageUnit1'),
  },
  'ap-japanese-language-and-culture/unit-1': {
    subject: 'AP Japanese Language and Culture',
    title: 'Unit 1: Families and Communities',
    file: 'apJapaneseLanguageUnit1',
    load: () => import('./apJapaneseLanguageUnit1'),
  },
  'ap-chinese-language-and-culture/unit-1': {
    subject: 'AP Chinese Language and Culture',
    title: 'Unit 1: Families and Communities',
    file: 'apChineseLanguageUnit1',
    load: () => import('./apChineseLanguageUnit1'),
  },
  'ap-spanish-literature-and-culture/unit-1': {
    subject: 'AP Spanish Literature and Culture',
    title: 'Unit 1: La época medieval',
    file: 'apSpanishLiteratureUnit1',
    load: () => import('./apSpanishLiteratureUnit1'),
  },
  'ap-seminar/unit-1': {
    subject: 'AP Seminar',
    title: 'Big Idea 1: Question and Explore',
    file: 'apSeminarUnit1',
    load: () => import('./apSeminarUnit1'),
  },
  'ap-research/unit-1': {
    subject: 'AP Research',
    title: 'Big Idea 1: Question and Explore',
    file: 'apResearchUnit1',
    load: () => import('./apResearchUnit1'),
  },
};

/** The first pack for a subject, or null. */
export function packForSubject(subject) {
  const hit = Object.entries(PACKS).find(([, p]) => p.subject === subject);
  return hit ? { slug: hit[0], ...hit[1] } : null;
}
