/**
 * Every AP course, for the study-pack lists. Units are listed only where the
 * names were read from that course's current Course and Exam Description, so
 * a "Coming soon" unit is never a guess; `units: null` means the class shows
 * as coming soon without a unit list until its first pack is written.
 *
 * `id` is the URL segment (/study/<id>), `key` the subject key users save
 * (constants/apExamDates SUBJECT_KEY_TO_EXAM_NAME), `subject` the exam name
 * packs, the response log and Progress use. Physics 2 and Physics C: E&M
 * number their units on from Physics 1 and Mechanics, so `first` is the
 * course's own first unit number. CSP, Seminar and Research are organised by
 * Big Ideas rather than units (`label: 'Big Idea'`). AP Art and Design is left
 * out: it is a portfolio course with no units to write a pack for.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */
export const COURSES = [
  { id: 'ap-african-american-studies', key: 'africanAmericanStudies', subject: 'AP African American Studies',
    units: ['Origins of the African Diaspora', 'Freedom, Enslavement, and Resistance', 'The Practice of Freedom', 'Movements and Debates'] },
  { id: 'ap-art-history', key: 'artHistory', subject: 'AP Art History',
    units: ['Global Prehistory, 30,000–500 BCE', 'Ancient Mediterranean, 3500 BCE–300 CE', 'Early Europe and Colonial Americas, 200–1750 CE', 'Later Europe and Americas, 1750–1980 CE', 'Indigenous Americas, 1000 BCE–1980 CE', 'Africa, 1100–1980 CE', 'West and Central Asia, 500 BCE–1980 CE', 'South, East, and Southeast Asia, 300 BCE–1980 CE', 'The Pacific, 700–1980 CE', 'Global Contemporary, 1980 CE to Present'] },
  {
    id: 'ap-biology', key: 'biology', subject: 'AP Biology',
    units: ['Chemistry of Life', 'Cells', 'Cellular Energetics', 'Cell Communication and Cell Cycle', 'Heredity',
      'Gene Expression and Regulation', 'Natural Selection', 'Ecology'],
  },
  {
    id: 'ap-business-with-personal-finance', key: 'businessPersonalFinance', subject: 'AP Business with Personal Finance',
    units: ['Businesses, Competition, and New Ideas', 'Marketing', 'Personal Saving and Borrowing; Business Finance and Accounting',
      'Management and Strategy', 'Personal Goals, Budgeting, and Investing'],
  },
  {
    id: 'ap-calculus-ab', key: 'calculusAB', subject: 'AP Calculus AB',
    units: ['Limits and Continuity', 'Differentiation: Definition and Fundamental Properties',
      'Differentiation: Composite, Implicit, and Inverse Functions', 'Contextual Applications of Differentiation',
      'Analytical Applications of Differentiation', 'Integration and Accumulation of Change', 'Differential Equations',
      'Applications of Integration'],
  },
  {
    id: 'ap-calculus-bc', key: 'calculusBC', subject: 'AP Calculus BC',
    units: ['Limits and Continuity', 'Differentiation: Definition and Fundamental Properties',
      'Differentiation: Composite, Implicit, and Inverse Functions', 'Contextual Applications of Differentiation',
      'Analytical Applications of Differentiation', 'Integration and Accumulation of Change', 'Differential Equations',
      'Applications of Integration', 'Parametric Equations, Polar Coordinates, and Vector-Valued Functions',
      'Infinite Sequences and Series'],
  },
  {
    id: 'ap-chemistry', key: 'chemistry', subject: 'AP Chemistry',
    units: ['Atomic Structure and Properties', 'Compound Structure and Properties', 'Properties of Substances and Mixtures',
      'Chemical Reactions', 'Kinetics', 'Thermochemistry', 'Equilibrium', 'Acids and Bases', 'Thermodynamics and Electrochemistry'],
  },
  { id: 'ap-chinese-language-and-culture', key: 'chineseLanguage', subject: 'AP Chinese Language and Culture',
    units: ['Families and Communities', 'Language and Culture', 'Art and Creativity', 'Science and Technology', 'Contemporary Life', 'Global Contexts'] },
  {
    id: 'ap-comparative-government-and-politics', key: 'comparativeGovernment', subject: 'AP Comparative Government and Politics',
    units: ['Political Systems, Regimes, and Governments', 'Political Institutions', 'Political Culture and Participation',
      'Party and Electoral Systems and Citizen Organizations', 'Political and Economic Changes and Development'],
  },
  {
    id: 'ap-computer-science-a', key: 'computerScienceA', subject: 'AP Computer Science A',
    units: ['Using Objects and Methods', 'Selection and Iteration', 'Class Creation', 'Data Collections'],
  },
  { id: 'ap-computer-science-principles', key: 'computerSciencePrinciples', subject: 'AP Computer Science Principles', label: 'Big Idea',
    units: ['Creative Development', 'Data', 'Algorithms and Programming', 'Computing Systems and Networks', 'Impact of Computing'] },
  {
    id: 'ap-cybersecurity', key: 'cybersecurity', subject: 'AP Cybersecurity',
    units: ['Introduction to Security', 'Securing Spaces', 'Securing Networks', 'Securing Devices', 'Securing Applications and Data'],
  },
  { id: 'ap-english-language-and-composition', key: 'englishLanguageAndComposition', subject: 'AP English Language and Composition',
    units: ['', '', '', '', '', '', '', '', ''] },
  { id: 'ap-english-literature-and-composition', key: 'englishLiteratureAndComposition', subject: 'AP English Literature and Composition',
    units: ['Short Fiction I', 'Poetry I', 'Longer Fiction or Drama I', 'Short Fiction II', 'Poetry II', 'Longer Fiction or Drama II', 'Short Fiction III', 'Poetry III', 'Longer Fiction or Drama III'] },
  {
    id: 'ap-environmental-science', key: 'environmentalScience', subject: 'AP Environmental Science',
    units: ['The Living World: Ecosystems', 'The Living World: Biodiversity', 'Populations', 'Earth Systems and Resources',
      'Land and Water Use', 'Energy Resources and Consumption', 'Atmospheric Pollution', 'Aquatic and Terrestrial Pollution', 'Global Change'],
  },
  {
    id: 'ap-european-history', key: 'europeanHistory', subject: 'AP European History',
    units: ['Renaissance and Exploration', 'Age of Reformation', 'Absolutism and Constitutionalism',
      'Scientific, Philosophical, and Political Developments', 'Conflict, Crisis, and Reaction in the Late 18th Century',
      'Industrialization and Its Effects', '19th-Century Perspectives and Political Developments', '20th-Century Global Conflicts',
      'Cold War and Contemporary Europe'],
  },
  { id: 'ap-french-language-and-culture', key: 'frenchLanguage', subject: 'AP French Language and Culture',
    units: ['Families and Communities', 'Language and Culture', 'Art and Creativity', 'Science and Technology', 'Contemporary Life', 'Global Contexts'] },
  { id: 'ap-german-language-and-culture', key: 'germanLanguage', subject: 'AP German Language and Culture',
    units: ['Families and Communities', 'Language and Culture', 'Art and Creativity', 'Science and Technology', 'Contemporary Life', 'Global Contexts'] },
  {
    id: 'ap-human-geography', key: 'humanGeography', subject: 'AP Human Geography',
    units: ['Thinking Geographically', 'Population and Migration Patterns and Processes', 'Cultural Patterns and Processes',
      'Political Patterns and Processes', 'Agriculture and Rural Land-Use Patterns and Processes',
      'Cities and Urban Land-Use Patterns and Processes', 'Industrial and Economic Development Patterns and Processes'],
  },
  { id: 'ap-italian-language-and-culture', key: 'italianLanguage', subject: 'AP Italian Language and Culture',
    units: ['Families and Communities', 'Language and Culture', 'Art and Creativity', 'Science and Technology', 'Contemporary Life', 'Global Contexts'] },
  { id: 'ap-japanese-language-and-culture', key: 'japaneseLanguage', subject: 'AP Japanese Language and Culture',
    units: ['Families and Communities', 'Language and Culture', 'Art and Creativity', 'Science and Technology', 'Contemporary Life', 'Global Contexts'] },
  { id: 'ap-latin', key: 'latin', subject: 'AP Latin',
    units: ['Teacher’s Choice – Latin Prose', 'Pliny’s Letters: Eruption of Mt. Vesuvius', 'Pliny’s Letters: Ghosts and Apparitions, Letters to Trajan', 'Teacher’s Choice – Latin Poetry and Vergil’s Aeneid', 'Vergil’s Aeneid, Excerpts from Books 4, 6, 7, 11, and 12', 'Course Project and Teacher’s Choice – Latin Poetry'] },
  {
    id: 'ap-macroeconomics', key: 'macroeconomics', subject: 'AP Macroeconomics',
    units: ['Basic Economic Concepts', 'Economic Indicators and the Business Cycle', 'National Income and Price Determination',
      'Financial Sector', 'Long-Run Consequences of Stabilization Policies', 'Open Economy—International Trade and Finance'],
  },
  {
    id: 'ap-microeconomics', key: 'microeconomics', subject: 'AP Microeconomics',
    units: ['Basic Economic Concepts', 'Supply and Demand', 'Production, Cost, and the Perfect Competition Model',
      'Imperfect Competition', 'Factor Markets', 'Market Failure and the Role of Government'],
  },
  {
    id: 'ap-music-theory', key: 'musicTheory', subject: 'AP Music Theory',
    units: ['Music Fundamentals I: Pitch, Major Scales and Key Signatures, Rhythm, Meter, and Expressive Elements',
      'Music Fundamentals II: Minor Scales and Key Signatures, Melody, Timbre, and Texture',
      'Music Fundamentals III: Triads and Seventh Chords', 'Harmony and Voice Leading I: Chord Function, Cadence, and Phrase',
      'Harmony and Voice Leading II: Chord Progressions and Predominant Function',
      'Harmony and Voice Leading III: Embellishments, Motives, and Melodic Devices',
      'Harmony and Voice Leading IV: Secondary Function', 'Modes and Form'],
  },
  {
    id: 'ap-physics-1', key: 'physics1', subject: 'AP Physics 1: Algebra-Based',
    units: ['Kinematics', 'Force and Translational Dynamics', 'Work, Energy, and Power', 'Linear Momentum',
      'Torque and Rotational Dynamics', 'Energy and Momentum of Rotating Systems', 'Oscillations', 'Fluids'],
  },
  {
    id: 'ap-physics-2', key: 'physics2', subject: 'AP Physics 2: Algebra-Based', first: 9,
    units: ['Thermodynamics', 'Electric Force, Field, and Potential', 'Electric Circuits', 'Magnetism and Electromagnetism',
      'Geometric Optics', 'Waves, Sound, and Physical Optics', 'Modern Physics'],
  },
  { id: 'ap-physics-c-electricity-and-magnetism', key: 'physicsC_ElectricityMagnetism', subject: 'AP Physics C: Electricity and Magnetism', first: 8,
    units: ['Electric Charges, Fields, and Gauss’s Law', 'Electric Potential', 'Conductors and Capacitors', 'Electric Circuits', 'Magnetic Fields and Electromagnetism', 'Electromagnetic Induction'] },
  {
    id: 'ap-physics-c-mechanics', key: 'physicsC_Mechanics', subject: 'AP Physics C: Mechanics',
    units: ['Kinematics', 'Force and Translational Dynamics', 'Work, Energy, and Power', 'Linear Momentum',
      'Torque and Rotational Dynamics', 'Energy and Momentum of Rotating Systems', 'Oscillations'],
  },
  {
    id: 'ap-precalculus', key: 'precalculus', subject: 'AP Precalculus',
    units: ['Polynomial and Rational Functions', 'Exponential and Logarithmic Functions', 'Trigonometric and Polar Functions',
      'Functions Involving Parameters, Vectors, and Matrices'],
  },
  {
    id: 'ap-psychology', key: 'psychology', subject: 'AP Psychology',
    units: ['Biological Bases of Behavior', 'Cognition', 'Development and Learning', 'Social Psychology and Personality',
      'Mental and Physical Health'],
  },
  { id: 'ap-research', key: 'research', subject: 'AP Research', label: 'Big Idea',
    units: ['Question and Explore', 'Understand and Analyze', 'Evaluate Multiple Perspectives', 'Synthesize Ideas', 'Team, Transform, and Transmit'] },
  { id: 'ap-seminar', key: 'seminar', subject: 'AP Seminar', label: 'Big Idea',
    units: ['Question and Explore', 'Understand and Analyze', 'Evaluate Multiple Perspectives', 'Synthesize Ideas', 'Team, Transform, and Transmit'] },
  { id: 'ap-spanish-language-and-culture', key: 'spanishLanguage', subject: 'AP Spanish Language and Culture',
    units: ['Families and Communities', 'Language and Culture', 'Art and Creativity', 'Science and Technology', 'Contemporary Life', 'Global Contexts'] },
  { id: 'ap-spanish-literature-and-culture', key: 'spanishLiterature', subject: 'AP Spanish Literature and Culture',
    units: ['La época medieval', 'El siglo XVI', 'El siglo XVII', 'La literatura romántica, realista y naturalista', 'La Generación del 98 y el Modernismo', 'Teatro y poesía del siglo XX', 'El Boom latinoamericano', 'Escritores contemporáneos de Estados Unidos y España'] },
  { id: 'ap-statistics', key: 'statistics', subject: 'AP Statistics',
    units: ['Exploring One-Variable Data and Collecting Data', 'Probability, Random Variables, and Probability Distributions', 'Inference for Categorical Data: Proportions', 'Inference for Quantitative Data: Means', 'Regression Analysis'] },
  { id: 'ap-us-government-and-politics', key: 'usGovernmentPolitics', subject: 'AP U.S. Government and Politics',
    units: ['Foundations of American Democracy', 'Interactions Among Branches of Government', 'Civil Liberties and Civil Rights', 'American Political Ideologies and Beliefs', 'Political Participation'] },
  {
    id: 'ap-us-history', key: 'usHistory', subject: 'AP U.S. History',
    units: ['Period 1: 1491–1607', 'Period 2: 1607–1754', 'Period 3: 1754–1800', 'Period 4: 1800–1848', 'Period 5: 1844–1877',
      'Period 6: 1865–1898', 'Period 7: 1890–1945', 'Period 8: 1945–1980', 'Period 9: 1980–Present'],
  },
  {
    id: 'ap-world-history-modern', key: 'worldHistory', subject: 'AP World History: Modern',
    units: ['The Global Tapestry', 'Networks of Exchange', 'Land-Based Empires', 'Transoceanic Interconnections', 'Revolutions',
      'Consequences of Industrialization', 'Global Conflict', 'Cold War and Decolonization', 'Globalization'],
  },
];

/** Unit slugs/titles for a course: [{ n, slug, title }]. */
export function courseUnits(course) {
  const first = course.first || 1;
  const label = course.label || 'Unit';
  return (course.units || []).map((name, i) => {
    const head = `${label} ${first + i}`;
    return {
      n: first + i,
      slug: `${course.id}/unit-${first + i}`,
      // AP Lang's units have numbers but no names. APUSH units are named by
      // period, written "Unit 1 – Period 1: 1491–1607" as the CED does.
      title: !name ? head : name.startsWith('Period') ? `${head} – ${name}` : `${head}: ${name}`,
    };
  });
}
