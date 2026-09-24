/**
 * Per-subject AP scoring models.
 *
 * Every AP exam converts raw section scores into a weighted composite, then maps
 * that composite onto 1–5. Section shapes differ a lot between exams (Biology is
 * 50/50, APUSH is 40/20/25/15 over four sections, CS A is 55/45), which is why
 * one universal curve was wrong for most subjects.
 *
 * SECTION STRUCTURE (question counts, point values, weights) comes from the
 * College Board: apcentral.collegeboard.org/courses/<course>/exam for counts
 * and weights, and the official 2026 scoring guidelines
 * (apcentral.collegeboard.org/media/pdf/ap26-sg-*.pdf) for FRQ point values —
 * checked September 2026 for the May 2027 exams. The one assumption left: the
 * project-based world-language tasks first appear in May 2027, so their raw
 * scales reuse each exam's current rubric (0–5 European, 0–6 Chinese/Japanese).
 * Raw scales only set slider ranges; weights are published either way.
 *
 * CUT POINTS are not published, so they are estimated — and the method matters,
 * because College Board moved to Evidence-Based Standard Setting in 2024–25 and
 * pass rates jumped (English Language 55% → 74%, Physics 1 47% → 66%), which
 * makes every older curve too harsh:
 *   'chart'   Released College Board conversion charts for this subject
 *             (2012–2022 practice exams) re-anchored to the 2026 score
 *             distribution: each cut keeps its percentile position in the
 *             chart year and moves to the share of students at or above that
 *             score in 2026 (interpolated on a normal-quantile scale).
 *   'blend'   Same, but the exam was redesigned since the chart, so it is
 *             averaged 50/50 with the cross-subject model below.
 *   'pooled'  No released chart: a model fitted across all released charts
 *             (composite % ≈ 50.8 + 17.9 · z, z = normal quantile of the share
 *             of students below the cut), applied to this exam's 2026 score
 *             distribution. Leave-one-subject-out error ≈ 8 composite points.
 *   'typical' Brand-new course with no score history: the pooled model at a
 *             typical AP distribution.
 * `cutoffConfidence` is 'estimated' for chart/blend and 'extrapolated' for
 * pooled/typical; the calculator says which. Research notes and sources:
 * docs/research/ap-score-curves.md.
 */

/**
 * @typedef {Object} ScoreModel
 * @property {string} label
 * @property {Array<{id:string,label:string,maxRaw:number,weight:number}>} sections
 *   `weight` = composite points this section contributes at a perfect raw score.
 * @property {number} compositeMax  sum of all section weights
 * @property {{5:number,4:number,3:number,2:number}} cutoffs  minimum composite for each score
 * @property {'estimated'|'extrapolated'} cutoffConfidence
 * @property {'chart'|'blend'|'pooled'|'typical'} cutoffBasis  how the cutoffs were derived (see above)
 * @property {string} [note]
 */

export const AP_SCORE_MODELS = {
  'AP Biology': {
    label: 'AP Biology',
    slug: 'ap-biology',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frq', label: 'Free response (2 x 9 + 4 x 4 points)', maxRaw: 34, weight: 60 },
    ],
    compositeMax: 120,
    cutoffs: { 5: 82, 4: 65, 3: 47, 2: 29 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'blend',
    note: "60 MCQ (50%) and 6 FRQ \u2014 two 9-point long and four 4-point short, 34 raw points (50%) \u2014 in a 120-point composite.",
  },

  'AP Calculus AB': {
    label: 'AP Calculus AB',
    slug: 'ap-calculus-ab',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 54 },
      { id: 'frq', label: 'Free response (6 x 9 points)', maxRaw: 54, weight: 54 },
    ],
    compositeMax: 108,
    cutoffs: { 5: 69, 4: 49, 3: 37, 2: 23 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'chart',
    note: "42 MCQ (50%) and six 9-point FRQs (50%), each section scaled to 54 for a 108-point composite.",
  },

  'AP Calculus BC': {
    label: 'AP Calculus BC',
    slug: 'ap-calculus-bc',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 54 },
      { id: 'frq', label: 'Free response (6 x 9 points)', maxRaw: 54, weight: 54 },
    ],
    compositeMax: 108,
    cutoffs: { 5: 68, 4: 55, 3: 45, 2: 26 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'chart',
    note: "Same structure as AB; historically a more forgiving curve.",
  },

  'AP US History': {
    label: 'AP US History',
    slug: 'ap-us-history',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 52 },
      { id: 'saq', label: 'Short answer (3 x 3 points)', maxRaw: 9, weight: 26 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 32.5 },
      { id: 'leq', label: 'Long essay', maxRaw: 6, weight: 19.5 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 91, 4: 65, 3: 51, 2: 33 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "Four separately weighted sections: 40% MCQ, 20% SAQ, 25% DBQ, 15% LEQ.",
  },

  'AP World History: Modern': {
    label: 'AP World History: Modern',
    slug: 'ap-world-history',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 52 },
      { id: 'saq', label: 'Short answer (3 x 3 points)', maxRaw: 9, weight: 26 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 32.5 },
      { id: 'leq', label: 'Long essay', maxRaw: 6, weight: 19.5 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 91, 4: 66, 3: 56, 2: 33 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "Four weighted sections: 40% MCQ, 20% SAQ, 25% DBQ, 15% LEQ.",
  },

  'AP Psychology': {
    label: 'AP Psychology',
    slug: 'ap-psychology',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 75, weight: 66.7 },
      { id: 'frq', label: 'Free response (AAQ 7 + EBQ 7)', maxRaw: 14, weight: 33.3 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 74, 4: 56, 3: 43, 2: 27 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'blend',
    note: "75 MCQ (66.7%) and two 7-point FRQs, the Article Analysis and Evidence-Based questions (33.3%).",
  },

  'AP Chemistry': {
    label: 'AP Chemistry',
    slug: 'ap-chemistry',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 50 },
      { id: 'frq', label: 'Free response (3 x 10 + 4 x 4 points)', maxRaw: 46, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 72, 4: 48, 3: 29, 2: 16 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'chart',
    note: "60 MCQ (50%) and 7 FRQ worth 46 raw points (50%), each scaled to 50.",
  },

  'AP Physics 1': {
    label: 'AP Physics 1',
    slug: 'ap-physics-1',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions, 40 points)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 58, 4: 45, 3: 34, 2: 29 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'blend',
    note: "42 MCQ (50%) and four FRQs (50%): mathematical routines 10, translation between representations 12, experimental design 10, qualitative/quantitative 8.",
  },

  'AP Statistics': {
    label: 'AP Statistics',
    slug: 'ap-statistics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 x 10 points)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 68, 4: 53, 3: 42, 2: 33 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'blend',
    note: "Revised for the May 2027 exam: 42 MCQ (50%) and four 10-point free-response questions (50%).",
  },

  'AP English Language and Composition': {
    label: 'AP English Language',
    slug: 'ap-english-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 45, weight: 45 },
      { id: 'frq', label: 'Essays (3 x 6 points)', maxRaw: 18, weight: 55 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 56, 3: 42, 2: 31 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'blend',
    note: "45 MCQ (45%) and three 6-point essays (55%) \u2014 the essays outweigh the MCQ.",
  },

  'AP Environmental Science': {
    label: 'AP Environmental Science',
    slug: 'ap-environmental-science',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 80, weight: 78 },
      { id: 'frq', label: 'Free response (3 x 10 points)', maxRaw: 30, weight: 52 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 92, 4: 71, 3: 54, 2: 43 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "80 MCQ (60%) and three 10-point FRQs (40%), composite out of 130.",
  },

  'AP Human Geography': {
    label: 'AP Human Geography',
    slug: 'ap-human-geography',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frq', label: 'Free response (3 x 7 points)', maxRaw: 21, weight: 60 },
    ],
    compositeMax: 120,
    cutoffs: { 5: 82, 4: 67, 3: 51, 2: 32 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'chart',
    note: "60 MCQ and three 7-point FRQs, weighted 50/50 into a 120-point composite.",
  },

  'AP Macroeconomics': {
    label: 'AP Macroeconomics',
    slug: 'ap-macroeconomics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frqLong', label: 'Long free response', maxRaw: 10, weight: 15 },
      { id: 'frqShort1', label: 'Short free response 1', maxRaw: 5, weight: 7.5 },
      { id: 'frqShort2', label: 'Short free response 2', maxRaw: 5, weight: 7.5 },
    ],
    compositeMax: 90,
    cutoffs: { 5: 70, 4: 58, 3: 44, 2: 29 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'chart',
    note: "60 MCQ (two thirds); free response is one long question (half of the section) and two short ones (a quarter each). Composite out of 90.",
  },

  'AP Microeconomics': {
    label: 'AP Microeconomics',
    slug: 'ap-microeconomics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frqLong', label: 'Long free response', maxRaw: 10, weight: 15 },
      { id: 'frqShort1', label: 'Short free response 1', maxRaw: 5, weight: 7.5 },
      { id: 'frqShort2', label: 'Short free response 2', maxRaw: 5, weight: 7.5 },
    ],
    compositeMax: 90,
    cutoffs: { 5: 72, 4: 57, 3: 44, 2: 28 },
    cutoffConfidence: 'estimated',
    cutoffBasis: 'chart',
    note: "Same structure as Macroeconomics: 60 MCQ, then one long and two short FRQs weighted 50/25/25. Composite out of 90.",
  },

  'AP English Literature and Composition': {
    label: 'AP English Literature',
    slug: 'ap-english-literature',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 45 },
      { id: 'frq', label: 'Essays (3 x 6 points)', maxRaw: 18, weight: 55 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 69, 4: 54, 3: 40, 2: 29 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (45%) and three 6-point essays (55%).",
  },

  'AP European History': {
    label: 'AP European History',
    slug: 'ap-european-history',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 52 },
      { id: 'saq', label: 'Short answer (3 x 3 points)', maxRaw: 9, weight: 26 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 32.5 },
      { id: 'leq', label: 'Long essay', maxRaw: 6, weight: 19.5 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 89, 4: 67, 3: 51, 2: 33 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "Four separately weighted sections: 40% MCQ, 20% SAQ, 25% DBQ, 15% LEQ.",
  },

  'AP United States Government and Politics': {
    label: 'AP US Government and Politics',
    slug: 'ap-gov',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 50 },
      { id: 'frqConcept', label: 'Concept application', maxRaw: 3, weight: 12.5 },
      { id: 'frqQuant', label: 'Quantitative analysis', maxRaw: 4, weight: 12.5 },
      { id: 'frqScotus', label: 'SCOTUS comparison', maxRaw: 4, weight: 12.5 },
      { id: 'frqArgument', label: 'Argument essay', maxRaw: 6, weight: 12.5 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 64, 4: 50, 3: 38, 2: 26 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%) and four FRQs worth 12.5% each \u2014 concept application (3 points), quantitative analysis (4), SCOTUS comparison (4), argument essay (6).",
  },

  'AP Comparative Government and Politics': {
    label: 'AP Comparative Government',
    slug: 'ap-comparative-government',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions, 19 points)', maxRaw: 19, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 69, 4: 57, 3: 41, 2: 30 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%) and four FRQs (50%): conceptual analysis 4 points, quantitative, comparative and argument essay 5 each.",
  },

  'AP Computer Science A': {
    label: 'AP Computer Science A',
    slug: 'ap-computer-science-a',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 55 },
      { id: 'frq', label: 'Free response (7 + 7 + 5 + 6 points)', maxRaw: 25, weight: 45 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 63, 4: 50, 3: 43, 2: 38 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "Revised exam: 42 MCQ (55%) and four FRQs (45%) \u2014 methods and control structures 7, class design 7, ArrayList 5, 2D array 6.",
  },

  'AP Computer Science Principles': {
    label: 'AP Computer Science Principles',
    slug: 'ap-computer-science-principles',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 70, weight: 70 },
      { id: 'cpt', label: 'Create task + written response', maxRaw: 6, weight: 30 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 74, 4: 59, 3: 45, 2: 33 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "70 MCQ (70%) and the Create performance task with its exam-day written response (30%).",
  },

  'AP Physics 2': {
    label: 'AP Physics 2',
    slug: 'ap-physics-2',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions, 40 points)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 66, 4: 51, 3: 40, 2: 24 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "42 MCQ (50%) and four FRQs (50%): mathematical routines, translation between representations, experimental design, qualitative/quantitative.",
  },

  'AP Physics C: Mechanics': {
    label: 'AP Physics C: Mechanics',
    slug: 'ap-physics-c-mechanics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions, 40 points)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 66, 4: 53, 3: 40, 2: 29 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "42 MCQ (50%) and four FRQs (50%), the same four question types as Physics 1 and 2.",
  },

  'AP Physics C: Electricity and Magnetism': {
    label: 'AP Physics C: E&M',
    slug: 'ap-physics-c-electricity-and-magnetism',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions, 40 points)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 63, 4: 52, 3: 39, 2: 26 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "42 MCQ (50%) and four FRQs (50%), the same four question types as Physics 1 and 2.",
  },

  'AP Precalculus': {
    label: 'AP Precalculus',
    slug: 'ap-precalculus',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 62.5 },
      { id: 'frq', label: 'Free response (4 x 6 points)', maxRaw: 24, weight: 37.5 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 61, 4: 47, 3: 34, 2: 24 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "42 MCQ (62.5%) and four 6-point FRQs (37.5%).",
  },

  'AP Art History': {
    label: 'AP Art History',
    slug: 'ap-art-history',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 80, weight: 50 },
      { id: 'frq', label: 'Free response (8 + 6 + 4 x 5 points)', maxRaw: 34, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 69, 4: 55, 3: 43, 2: 27 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "80 MCQ (50%) and six FRQs worth 34 raw points (50%): an 8-point comparison essay, a 6-point visual/contextual essay and four 5-point short essays.",
  },

  'AP Music Theory': {
    label: 'AP Music Theory',
    slug: 'ap-music-theory',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 75, weight: 45 },
      { id: 'frq', label: 'Free response (written, 7 questions)', maxRaw: 118, weight: 45 },
      { id: 'sight', label: 'Sight-singing (2 x 9 points)', maxRaw: 18, weight: 10 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 67, 4: 58, 3: 47, 2: 32 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "75 MCQ (45%), seven written free-response questions (45%) and two sight-singing melodies (10%).",
  },

  'AP Spanish Language and Culture': {
    label: 'AP Spanish Language',
    slug: 'ap-spanish-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 5, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 5, weight: 15 },
      { id: 'essay', label: 'Argumentative essay', maxRaw: 5, weight: 15 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 65, 4: 50, 3: 34, 2: 17 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).",
  },

  'AP French Language and Culture': {
    label: 'AP French Language',
    slug: 'ap-french-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 5, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 5, weight: 15 },
      { id: 'essay', label: 'Argumentative essay', maxRaw: 5, weight: 15 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 69, 4: 56, 3: 41, 2: 23 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).",
  },

  'AP German Language and Culture': {
    label: 'AP German Language',
    slug: 'ap-german-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 5, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 5, weight: 15 },
      { id: 'essay', label: 'Argumentative essay', maxRaw: 5, weight: 15 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 63, 4: 55, 3: 42, 2: 28 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).",
  },

  'AP Italian Language and Culture': {
    label: 'AP Italian Language',
    slug: 'ap-italian-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 5, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 5, weight: 15 },
      { id: 'essay', label: 'Argumentative essay', maxRaw: 5, weight: 15 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 66, 4: 55, 3: 42, 2: 29 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).",
  },

  'AP Chinese Language and Culture': {
    label: 'AP Chinese Language',
    slug: 'ap-chinese-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 6, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 6, weight: 15 },
      { id: 'narration', label: 'Story narration (written)', maxRaw: 6, weight: 7.5 },
      { id: 'email', label: 'Email response (written)', maxRaw: 6, weight: 7.5 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 52, 4: 43, 3: 32, 2: 27 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%), project presentation (20%), project Q&A (15%), story narration (7.5%), email response (7.5%).",
  },

  'AP Japanese Language and Culture': {
    label: 'AP Japanese Language',
    slug: 'ap-japanese-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 6, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 6, weight: 15 },
      { id: 'narration', label: 'Story narration (written)', maxRaw: 6, weight: 7.5 },
      { id: 'email', label: 'Email response (written)', maxRaw: 6, weight: 7.5 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 52, 4: 48, 3: 40, 2: 36 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "55 MCQ (50%), project presentation (20%), project Q&A (15%), story narration (7.5%), email response (7.5%).",
  },

  'AP Spanish Literature and Culture': {
    label: 'AP Spanish Literature',
    slug: 'ap-spanish-literature',
    sections: [
      { id: 'mcqAudio', label: 'Multiple choice (audio texts)', maxRaw: 15, weight: 10 },
      { id: 'mcqRead', label: 'Multiple choice (written texts)', maxRaw: 50, weight: 40 },
      { id: 'frq', label: 'Free response (6 + 6 + 10 + 10 points)', maxRaw: 32, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 66, 4: 54, 3: 41, 2: 27 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "15 audio MCQ (10%), 50 reading MCQ (40%), and four free-response questions (50%).",
  },

  'AP Latin': {
    label: 'AP Latin',
    slug: 'ap-latin',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 52, weight: 50 },
      { id: 'frq', label: 'Free response (8 + 15 + 8 + 11 + 11 points)', maxRaw: 53, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 66, 4: 51, 3: 40, 2: 28 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "52 MCQ (50%) and five free-response questions including translation (48%), plus course-project checkpoints (2%, counted with free response here).",
  },

  'AP African American Studies': {
    label: 'AP African American Studies',
    slug: 'ap-african-american-studies',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'saq', label: 'Short answer (4 + 3 + 3 points)', maxRaw: 10, weight: 18 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 12 },
      { id: 'project', label: 'Individual student project + exam-day validation', maxRaw: 10, weight: 10 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 66, 4: 51, 3: 38, 2: 23 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'pooled',
    note: "60 MCQ (60%), three short-answer questions (18%), a document-based question (12%), and the individual project with its exam-day validation question (10%).",
  },

  'AP Business with Personal Finance': {
    label: 'AP Business with Personal Finance',
    slug: 'ap-business-personal-finance',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'canvas', label: 'Business Canvas Project validation', maxRaw: 6, weight: 15 },
      { id: 'frq', label: 'Free response (3 questions)', maxRaw: 18, weight: 25 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 68, 4: 54, 3: 41, 2: 28 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'typical',
    note: "60 MCQ (60%), the Business Canvas Project exam-day validation question (15%), and three free-response questions (25%).",
  },

  'AP Cybersecurity': {
    label: 'AP Cybersecurity',
    slug: 'ap-cybersecurity',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 70 },
      { id: 'frq', label: 'Device Security Analysis', maxRaw: 10, weight: 30 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 68, 4: 54, 3: 41, 2: 28 },
    cutoffConfidence: 'extrapolated',
    cutoffBasis: 'typical',
    note: "60 MCQ (70%) and one free-response Device Security Analysis question (30%).",
  },
};

/**
 * Fallback for subjects without a researched model.
 *
 * Deliberately a plain 50/50 percentage curve, and the UI labels it as a rough
 * estimate — an honest generic beats a fabricated per-subject curve presented as
 * if it were researched.
 */
export const GENERIC_MODEL = {
  label: 'Generic AP model',
  sections: [
    { id: 'mcq', label: 'Multiple choice', maxRaw: 50, weight: 50 },
    { id: 'frq', label: 'Free response', maxRaw: 50, weight: 50 },
  ],
  compositeMax: 100,
  cutoffs: { 5: 75, 4: 60, 3: 45, 2: 30 },
  cutoffConfidence: 'extrapolated',
  note: 'No subject-specific model yet — this is a generic 50/50 curve and is less accurate.',
  generic: true,
};


/**
 * Alternate names the rest of the app uses for subjects that ARE modelled.
 *
 * `subjects.js` and the curriculum data do not use the same strings as the model
 * keys — "AP U.S. History" vs "AP US History", "AP Physics 1: Algebra-Based" vs
 * "AP Physics 1", "AP English Literature" vs "AP English Literature and
 * Composition". Because getScoreModel did an exact key lookup, every one of
 * those students silently got the GENERIC 50/50 fallback even though a
 * researched model existed. Nothing surfaced it: the calculator just quietly
 * became less accurate.
 *
 * The sitemap/subject drift test below keeps this list honest.
 */
export const SUBJECT_ALIASES = {
  'AP U.S. History': 'AP US History',
  'AP US History ': 'AP US History',
  'AP World History': 'AP World History: Modern',
  'AP English Language': 'AP English Language and Composition',
  'AP English Literature': 'AP English Literature and Composition',
  'AP Comparative Government': 'AP Comparative Government and Politics',
  'AP Government and Politics: Comparative': 'AP Comparative Government and Politics',
  'AP U.S. Government and Politics': 'AP United States Government and Politics',
  'AP US Government': 'AP United States Government and Politics',
  'AP Government and Politics: United States': 'AP United States Government and Politics',
  'AP Physics 1: Algebra-Based': 'AP Physics 1',
  'AP Physics 2: Algebra-Based': 'AP Physics 2',
  'AP CS Principles': 'AP Computer Science Principles',
  'AP CS A': 'AP Computer Science A',
  'AP Physics C: E&M': 'AP Physics C: Electricity and Magnetism',
  'AP Spanish Language': 'AP Spanish Language and Culture',
  'AP Spanish Literature': 'AP Spanish Literature and Culture',
  'AP French': 'AP French Language and Culture',
  'AP German': 'AP German Language and Culture',
  'AP Chinese': 'AP Chinese Language and Culture',
  'AP Italian': 'AP Italian Language and Culture',
  'AP Japanese': 'AP Japanese Language and Culture',
  'AP Business': 'AP Business with Personal Finance',
  'AP Personal Finance': 'AP Business with Personal Finance',
  'AP Cyber': 'AP Cybersecurity',
  'AP Cyber Security': 'AP Cybersecurity',
  'AP Computer Science': 'AP Computer Science A',
  'AP Environmental Science ': 'AP Environmental Science',
  'AP Human Geography ': 'AP Human Geography',
};

/** Resolve any known name (canonical or alias) to a model key. */
export function canonicalSubject(subject) {
  const name = String(subject || '').trim();
  if (AP_SCORE_MODELS[name]) return name;
  return SUBJECT_ALIASES[name] || name;
}

export function getScoreModel(subject) {
  const key = canonicalSubject(subject);
  return AP_SCORE_MODELS[key] || { ...GENERIC_MODEL, label: subject || GENERIC_MODEL.label };
}

export const MODELLED_SUBJECTS = Object.keys(AP_SCORE_MODELS);

/** slug -> subject name, for /ap-score-calculator/:slug deep links. */
export const SUBJECT_BY_SLUG = Object.fromEntries(
  Object.entries(AP_SCORE_MODELS)
    .filter(([, m]) => m.slug)
    .map(([name, m]) => [m.slug, name])
);

/** Subject name -> slug. Falls back to a derived slug for unmodelled subjects. */
export function slugFor(subject) {
  const model = AP_SCORE_MODELS[canonicalSubject(subject)];
  if (model && model.slug) return model.slug;
  return String(subject || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The curve as display rows — every competitor hides this, which is exactly why
 * showing it is the differentiator.
 *
 * Lives here rather than in apScore.js because scripts/prerender.mjs needs it and
 * can only load modules that have no imports of their own.
 */
export function curveRows(model) {
  const order = [5, 4, 3, 2, 1];
  return order.map((s) => {
    const min = s === 1 ? 0 : model.cutoffs[s];
    const max = s === 5 ? model.compositeMax : model.cutoffs[s + 1] - 1;
    return {
      score: s,
      min,
      max,
      percentMin: Math.round((min / model.compositeMax) * 100),
    };
  });
}

export default AP_SCORE_MODELS;
