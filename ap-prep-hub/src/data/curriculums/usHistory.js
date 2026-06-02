/**
 * AP U.S. History curriculum structure (CED topic outline).
 *
 * This file is the STABLE, hand-defined structure — units and their topics
 * per the College Board CED. Lesson bodies and practice questions are NOT
 * here; they're AI-generated from the source PDFs and cached (see
 * services/curriculumContent.js).
 *
 * Source materials live in public/curriculums/apush/. Filenames are
 * inconsistent (APUSH_HRG vs AP_US_HRG, _Answers vs not, and Unit 7's video
 * uses an EN-DASH), so every path is mapped explicitly here — never build a
 * path by string interpolation.
 *
 * videoUrl: currently the local public path so Unit review plays in dev.
 * TODO(phase 2): replace with external hosting URLs (Firebase Storage / R2 /
 * YouTube) — the mp4s are gitignored and won't ship in the Netlify deploy.
 */

const BASE = '/curriculums/apush';

const unit = (number, title, range, examWeight, video, noteguide, mcq, topics) => ({
  number,
  title,
  range,
  examWeight,
  videoUrl: `${BASE}/videos/${video}`,
  noteguidePdf: `${BASE}/${noteguide}`,
  mcqPdf: `${BASE}/${mcq}`,
  topics: topics.map(([id, t]) => ({ id, number: id, title: t })),
});

const units = [
  unit(1, 'Period 1: 1491–1607', 'Pre-1491–1607', '4–6%',
    'APUSH_Unit_1__1491-1607.mp4', 'APUSH_HRG_Unit_1_Noteguide.pdf', 'AP_US_HRG_Unit_1_MCQ_Answers.pdf', [
      ['1.1', 'Contextualizing Period 1'],
      ['1.2', 'Native American Societies Before European Contact'],
      ['1.3', 'European Exploration in the Americas'],
      ['1.4', 'Columbian Exchange, Spanish Exploration, and Conquest'],
      ['1.5', 'Labor, Slavery, and Caste in the Spanish Colonial System'],
      ['1.6', 'Cultural Interactions Between Europeans, Native Americans, and Africans'],
      ['1.7', 'Causation in Period 1'],
    ]),
  unit(2, 'Period 2: 1607–1754', '1607–1754', '6–8%',
    'APUSH_Unit_2__1607-1754.mp4', 'AP_US_HRG_Unit_2_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_2_MCQ_Answers.pdf', [
      ['2.1', 'Contextualizing Period 2'],
      ['2.2', 'European Colonization'],
      ['2.3', 'The Regions of British Colonies'],
      ['2.4', 'Transatlantic Trade'],
      ['2.5', 'Interactions Between American Indians and Europeans'],
      ['2.6', 'Slavery in the British Colonies'],
      ['2.7', 'Colonial Society and Culture'],
      ['2.8', 'Comparison in Period 2'],
    ]),
  unit(3, 'Period 3: 1754–1800', '1754–1800', '10–17%',
    'APUSH_Unit_3__1754-1800.mp4', 'APUSH_HRG_Unit_3_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_3_MCQ_Answers.pdf', [
      ['3.1', 'Contextualizing Period 3'],
      ['3.2', "The Seven Years' War (The French and Indian War)"],
      ['3.3', 'Taxation Without Representation'],
      ['3.4', 'Philosophical Foundations of the American Revolution'],
      ['3.5', 'The American Revolution'],
      ['3.6', 'The Influence of Revolutionary Ideals'],
      ['3.7', 'The Articles of Confederation'],
      ['3.8', 'The Constitutional Convention and Debates over Ratification'],
      ['3.9', 'The Constitution'],
      ['3.10', 'Shaping a New Republic'],
      ['3.11', 'Developing an American Identity'],
      ['3.12', 'Movement in the Early Republic'],
      ['3.13', 'Continuity and Change in Period 3'],
    ]),
  unit(4, 'Period 4: 1800–1848', '1800–1848', '10–17%',
    'APUSH_Unit_4__1800-1848.mp4', 'APUSH_HRG_Unit_4_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_4_MCQ_Answers.pdf', [
      ['4.1', 'Contextualizing Period 4'],
      ['4.2', 'The Rise of Political Parties and the Era of Jefferson'],
      ['4.3', 'Politics and Regional Interests'],
      ['4.4', 'America on the World Stage'],
      ['4.5', 'Market Revolution: Industrialization'],
      ['4.6', 'Market Revolution: Society and Culture'],
      ['4.7', 'Expanding Democracy'],
      ['4.8', 'Jackson and Federal Power'],
      ['4.9', 'The Development of an American Culture'],
      ['4.10', 'The Second Great Awakening'],
      ['4.11', 'An Age of Reform'],
      ['4.12', 'African Americans in the Early Republic'],
      ['4.13', 'The Society of the South in the Early Republic'],
      ['4.14', 'Causation in Period 4'],
    ]),
  unit(5, 'Period 5: 1844–1877', '1844–1877', '10–17%',
    'APUSH_Unit_5__1844-1877.mp4', 'APUSH_HRG_Unit_5_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_5_MCQ_Answers.pdf', [
      ['5.1', 'Contextualizing Period 5'],
      ['5.2', 'Manifest Destiny'],
      ['5.3', 'The Mexican–American War'],
      ['5.4', 'The Compromise of 1850'],
      ['5.5', 'Sectional Conflict: Regional Differences'],
      ['5.6', 'Failure of Compromise'],
      ['5.7', 'Election of 1860 and Secession'],
      ['5.8', 'Military Conflict in the Civil War'],
      ['5.9', 'Government Policies During the Civil War'],
      ['5.10', 'Reconstruction'],
      ['5.11', 'Failure of Reconstruction'],
      ['5.12', 'Comparison in Period 5'],
    ]),
  unit(6, 'Period 6: 1865–1898', '1865–1898', '10–17%',
    'APUSH_Unit_6__1865-1898.mp4', 'APUSH_HRG_Unit_6_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_6_MCQ_Answers.pdf', [
      ['6.1', 'Contextualizing Period 6'],
      ['6.2', 'Westward Expansion: Economic Development'],
      ['6.3', 'Westward Expansion: Social and Cultural Development'],
      ['6.4', 'The "New South"'],
      ['6.5', 'Technological Innovation'],
      ['6.6', 'The Rise of Industrial Capitalism'],
      ['6.7', 'Labor in the Gilded Age'],
      ['6.8', 'Immigration and Migration in the Gilded Age'],
      ['6.9', 'Responses to Immigration in the Gilded Age'],
      ['6.10', 'Development of the Middle Class'],
      ['6.11', 'Reform in the Gilded Age'],
      ['6.12', 'Controversies over the Role of Government in the Gilded Age'],
      ['6.13', 'Politics in the Gilded Age'],
      ['6.14', 'Continuity and Change in Period 6'],
    ]),
  unit(7, 'Period 7: 1890–1945', '1890–1945', '10–17%',
    'APUSH_Unit_7__1890–1945.mp4', 'APUSH_HRG_Unit_7_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_7_MCQ_Answers.pdf', [
      ['7.1', 'Contextualizing Period 7'],
      ['7.2', 'Imperialism: Debates'],
      ['7.3', 'The Spanish–American War'],
      ['7.4', 'The Progressives'],
      ['7.5', 'World War I: Military and Diplomacy'],
      ['7.6', 'World War I: Home Front'],
      ['7.7', '1920s: Innovations in Communication and Technology'],
      ['7.8', '1920s: Cultural and Political Controversies'],
      ['7.9', 'The Great Depression'],
      ['7.10', 'The New Deal'],
      ['7.11', 'Interwar Foreign Policy'],
      ['7.12', 'World War II: Mobilization'],
      ['7.13', 'World War II: Military'],
      ['7.14', 'Postwar Diplomacy'],
      ['7.15', 'Comparison in Period 7'],
    ]),
  unit(8, 'Period 8: 1945–1980', '1945–1980', '10–17%',
    'APUSH_Unit_8__1945-1980.mp4', 'APUSH_HRG_Unit_8_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_8_MCQ_Answers.pdf', [
      ['8.1', 'Contextualizing Period 8'],
      ['8.2', 'The Cold War from 1945 to 1980'],
      ['8.3', 'The Red Scare'],
      ['8.4', 'Economy after 1945'],
      ['8.5', 'Culture after 1945'],
      ['8.6', 'Early Steps in the Civil Rights Movement (1940s and 1950s)'],
      ['8.7', 'America as a World Power'],
      ['8.8', 'The Vietnam War'],
      ['8.9', 'The Great Society'],
      ['8.10', 'The African American Civil Rights Movement (1960s)'],
      ['8.11', 'The Civil Rights Movement Expands'],
      ['8.12', 'Youth Culture of the 1960s'],
      ['8.13', 'The Environment and Natural Resources from 1968 to 1980'],
      ['8.14', 'Society in Transition'],
      ['8.15', 'Continuity and Change in Period 8'],
    ]),
  unit(9, 'Period 9: 1980–Present', '1980–Present', '4–6%',
    'APUSH_Unit_9__1980-Present.mp4', 'APUSH_HRG_Unit_9_Noteguide_Answers.pdf', 'AP_US_HRG_Unit_9_MCQ_Answers.pdf', [
      ['9.1', 'Contextualizing Period 9'],
      ['9.2', 'Reagan and Conservatism'],
      ['9.3', 'The End of the Cold War'],
      ['9.4', 'A Changing Economy'],
      ['9.5', 'Migration and Immigration in the 1990s and 2000s'],
      ['9.6', 'Challenges of the 21st Century'],
      ['9.7', 'Causation in Period 9'],
    ]),
];

const usHistoryCurriculum = {
  id: 'us-history',
  slug: 'us-history',
  title: 'AP U.S. History',
  subjectName: 'AP US History', // matches cedSearch SUBJECT_TO_PDF
  units,
};

/** Flat lookup: topicId -> { ...topic, unit } */
export function findTopic(topicId) {
  for (const u of units) {
    const t = u.topics.find((x) => x.id === topicId);
    if (t) return { ...t, unit: u.number };
  }
  return null;
}

/** unitNumber -> unit config */
export function getUnit(number) {
  return units.find((u) => u.number === Number(number)) || null;
}

export default usHistoryCurriculum;
