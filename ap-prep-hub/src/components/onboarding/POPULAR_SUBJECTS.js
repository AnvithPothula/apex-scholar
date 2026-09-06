/**
 * The highest-enrolment AP courses, as one-tap chips.
 *
 * The Settings picker is a searchable dropdown, which is right for editing 40
 * options later and wrong for the first thirty seconds of an account: it makes
 * a student type before they can answer. Most students take courses from a
 * short head of this distribution, so showing that head as tappable chips turns
 * the question into two taps. The full searchable list stays underneath for
 * everyone else.
 *
 * Keys are curriculum keys, the same ones Settings writes to users/{uid}.subjects.
 */
const POPULAR_SUBJECTS = [
  'usHistory',
  'englishLanguageAndComposition',
  'psychology',
  'calculusAB',
  'biology',
  'worldHistory',
  'englishLiteratureAndComposition',
  'usGovernmentPolitics',
  'chemistry',
  'statistics',
  'humanGeography',
  'environmentalScience',
];

export default POPULAR_SUBJECTS;
