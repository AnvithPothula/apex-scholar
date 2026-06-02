/**
 * Curriculum registry for the Learn section of the Learn hub.
 *
 * Currently all entries are placeholders ('soon'). When real curriculum
 * content is ready for a subject:
 *   1. Create src/data/curriculums/<subject>.js with the lesson data
 *   2. Import it here and add a TIMELINES-style registry (similar shape)
 *   3. Flip the catalog entry's status from 'soon' to 'live' and set `to`
 *
 * Shape mirrors TIMELINE_CATALOG so LearnHub renders both with the same
 * card component.
 */

import usHistory from './usHistory';

// slug -> full curriculum config (only LIVE curriculums)
export const CURRICULUMS = {
  'us-history': usHistory,
};

export function getCurriculum(slug) {
  return CURRICULUMS[slug] || null;
}

export const CURRICULUM_CATALOG = [
  {
    kind: 'curriculum',
    slug: 'us-history',
    title: 'AP U.S. History',
    subtitle: 'Curriculum',
    blurb: 'Unit-by-unit lessons aligned to the College Board CED, with practice after each topic and a full review video per unit.',
    status: 'live',
    to: '/learn/curriculum/us-history',
  },
  {
    kind: 'curriculum',
    slug: 'world-history',
    title: 'AP World History',
    subtitle: 'Curriculum',
    blurb: 'Period-by-period coverage of the WHAP CED with key continuities, changes, and comparisons.',
    status: 'soon',
  },
  {
    kind: 'curriculum',
    slug: 'biology',
    title: 'AP Biology',
    subtitle: 'Curriculum',
    blurb: 'Unit lessons across cell, genetics, evolution, and ecology, with CED-aligned learning objectives.',
    status: 'soon',
  },
  {
    kind: 'curriculum',
    slug: 'chemistry',
    title: 'AP Chemistry',
    subtitle: 'Curriculum',
    blurb: 'Concept lessons for atomic structure, bonding, kinetics, equilibrium, thermochemistry, and more.',
    status: 'soon',
  },
  {
    kind: 'curriculum',
    slug: 'calculus',
    title: 'AP Calculus',
    subtitle: 'Curriculum',
    blurb: 'Topic-by-topic lessons for limits, derivatives, integrals, and series with worked examples.',
    status: 'soon',
  },
  {
    kind: 'curriculum',
    slug: 'statistics',
    title: 'AP Statistics',
    subtitle: 'Curriculum',
    blurb: 'Unit lessons covering data collection, probability, inference, and regression with AP-style problems.',
    status: 'soon',
  },
];
