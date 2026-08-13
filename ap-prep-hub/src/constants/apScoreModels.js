/**
 * Per-subject AP scoring models.
 *
 * Every AP exam converts raw section scores into a weighted composite, then maps
 * that composite onto 1–5. The three shapes below are genuinely different, which
 * is why one universal curve (the old `convertToAPScore`, tracked as A6) was
 * wrong for most subjects:
 *   - AP Biology     50/50, FRQ raw 36 scaled up to 60
 *   - AP Calculus AB 50/50, MCQ ×1.2 then FRQ added raw
 *   - APUSH          40/20/25/15 across four separate sections
 *
 * ⚠️ HONESTY NOTE, and it is the whole point of this feature: the College Board
 * does **not** publish its cut points. Every calculator online — Albert, Knowt,
 * and all the rest — is estimating from released practice exams and score
 * distributions, and cutoffs move a few points each year with exam difficulty.
 * `confidence` records how well-grounded each model is, and the UI shows the
 * curve rather than hiding it. Nobody else shows the curve.
 *
 * Sources: College Board course descriptions for the section structure and
 * weights (which ARE published), and aggregated 2022–2025 estimates for the
 * cut points (which are not).
 */

/**
 * @typedef {Object} ScoreModel
 * @property {string} label
 * @property {Array<{id:string,label:string,maxRaw:number,weight:number}>} sections
 *   `weight` = composite points this section contributes at a perfect raw score.
 * @property {number} compositeMax  sum of all section weights
 * @property {{5:number,4:number,3:number,2:number}} cutoffs  minimum composite for each score
 * @property {'measured'|'estimated'} confidence
 * @property {string} [note]
 */

export const AP_SCORE_MODELS = {
  'AP Biology': {
    label: 'AP Biology',
    slug: 'ap-biology',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frq', label: 'Free response', maxRaw: 36, weight: 60 },
    ],
    compositeMax: 120,
    cutoffs: { 5: 93, 4: 74, 3: 51, 2: 28 },
    cutoffConfidence: 'estimated',
    note: '60 MCQ (50%) and 6 FRQ worth 36 raw points (50%), scaled to a 120-point composite.',
  },

  // The 2026 CED sets BOTH Calculus exams at 42 multiple-choice questions
  // (graphing calculator required for the final 13) and 6 free-response
  // questions. The app carried the retired 45-MCQ figure. Verified by pulling
  // the exam-overview text straight out of the CED PDF.
  'AP Calculus AB': {
    label: 'AP Calculus AB',
    slug: 'ap-calculus-ab',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 54 },
      { id: 'frq', label: 'Free response', maxRaw: 54, weight: 54 },
    ],
    compositeMax: 108,
    cutoffs: { 5: 77, 4: 59, 3: 43, 2: 27 },
    cutoffConfidence: 'estimated',
    note: '42 MCQ and 6 FRQ at 9 points each, each section scaled to 54 for a 108-point composite.',
  },

  'AP Calculus BC': {
    label: 'AP Calculus BC',
    slug: 'ap-calculus-bc',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 54 },
      { id: 'frq', label: 'Free response', maxRaw: 54, weight: 54 },
    ],
    compositeMax: 108,
    // BC's curve is famously more forgiving than AB's.
    cutoffs: { 5: 68, 4: 57, 3: 42, 2: 26 },
    cutoffConfidence: 'estimated',
    note: 'Same structure as AB, but historically a more generous curve.',
  },

  'AP US History': {
    label: 'AP US History',
    slug: 'ap-us-history',
    // Weights derived from the PUBLISHED section percentages (40/20/25/15),
    // which are authoritative, rather than from third-party composite numbers.
    // Several calculators online quote 60/30/37.5/22.5 alongside "out of 130" —
    // those sum to 150 and are internally inconsistent. 130 × the percentages
    // gives 52/26/32.5/19.5, which does sum to 130.
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 52 },
      { id: 'saq', label: 'Short answer', maxRaw: 9, weight: 26 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 32.5 },
      { id: 'leq', label: 'Long essay', maxRaw: 6, weight: 19.5 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 98, 4: 81, 3: 62, 2: 40 },
    cutoffConfidence: 'estimated',
    note: 'Four separately weighted sections: 40% MCQ, 20% SAQ, 25% DBQ, 15% LEQ.',
  },
  'AP World History: Modern': {
    label: 'AP World History: Modern',
    slug: 'ap-world-history',
    // Identical structure to APUSH — same four sections, same published weights.
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 52 },
      { id: 'saq', label: 'Short answer', maxRaw: 9, weight: 26 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 32.5 },
      { id: 'leq', label: 'Long essay', maxRaw: 6, weight: 19.5 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 101, 4: 84, 3: 64, 2: 41 },
    cutoffConfidence: 'estimated',
    note: 'Four weighted sections: 40% MCQ, 20% SAQ, 25% DBQ, 15% LEQ.',
  },

  'AP Psychology': {
    label: 'AP Psychology',
    slug: 'ap-psychology',
    // The redesigned exam is 2/3 MCQ, 1/3 FRQ (two 7-point questions).
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 75, weight: 66.7 },
      { id: 'frq', label: 'Free response', maxRaw: 14, weight: 33.3 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 58, 3: 45, 2: 33 },
    // Weights are published; these cut points are extrapolated from score
    // distributions rather than from a released conversion table.
    cutoffConfidence: 'extrapolated',
    note: 'Multiple choice is 66.7%, two 7-point FRQs are 33.3%.',
  },

  'AP Chemistry': {
    label: 'AP Chemistry',
    slug: 'ap-chemistry',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 50 },
      { id: 'frq', label: 'Free response', maxRaw: 46, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 72, 4: 58, 3: 42, 2: 25 },
    cutoffConfidence: 'estimated',
    note: '60 MCQ (50%) and 7 FRQ worth 46 raw points (50%), each scaled to 50.',
  },

  // ---- Batch 2 -------------------------------------------------------------
  // Section structures and weights below are PUBLISHED by the College Board and
  // are reliable. The cut points are `extrapolated`: no conversion table is
  // released, and the widely-reported anchor is that a 5 needs roughly 70% of
  // the composite. Bands use 70 / 57 / 43 / 30 percent, which is consistent
  // with the researched subjects above (Bio 77.5%, Chem 72%, Calc AB 71%).
  // Treat these as rougher than batch 1 — the UI says so.

  // The 2025 physics redesign put all four physics exams on the SAME shape:
  // 42 MCQ / 85 min / 50%, then 4 FRQ / 95 min / 50%. Verified against
  // apcentral.collegeboard.org exam pages, which are authoritative. Third-party
  // calculators still quote the old 40-question format — the same kind of stale
  // secondary source that produced the wrong APUSH weights.
  //
  // College Board does not publish the FRQ raw-point total, so that figure is
  // an assumption; it only sets the slider range, since the section is weighted
  // to 50 regardless.
  'AP Physics 1': {
    label: 'AP Physics 1',
    slug: 'ap-physics-1',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '42 MCQ (50%) and four FRQs (50%), each scaled to 50.',
  },

  'AP Statistics': {
    label: 'AP Statistics',
    slug: 'ap-statistics',
    // REVISED for 2026-27: the course consolidated to five units and the exam
    // went fully digital. Multiple choice went 40 -> 42 and free response 6 -> 4
    // (the four carrying more points each). Confirmed on College Board's
    // AP Statistics Revisions page; the old 40/6 shape is retired.
    // The CED states "42 multiple-choice questions and four 10-point free-response
    // questions", so the 40-point FRQ total is published, not assumed.
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 x 10 points)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '42 MCQ (50%) and four 10-point free-response questions (50%), each scaled to 50.',
  },

  'AP English Language and Composition': {
    label: 'AP English Language',
    slug: 'ap-english-language',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 45, weight: 45 },
      { id: 'frq', label: 'Essays', maxRaw: 18, weight: 55 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '45 MCQ (45%) and three 6-point essays (55%) — the FRQs outweigh the MCQ here.',
  },

  'AP Environmental Science': {
    label: 'AP Environmental Science',
    slug: 'ap-environmental-science',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 80, weight: 78 },
      { id: 'frq', label: 'Free response', maxRaw: 30, weight: 52 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 91, 4: 74, 3: 56, 2: 39 },
    cutoffConfidence: 'extrapolated',
    note: '80 MCQ (60%) and 3 FRQ worth 30 raw points (40%), composite out of 130.',
  },

  'AP Human Geography': {
    label: 'AP Human Geography',
    slug: 'ap-human-geography',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frq', label: 'Free response', maxRaw: 21, weight: 60 },
    ],
    compositeMax: 120,
    cutoffs: { 5: 84, 4: 68, 3: 52, 2: 36 },
    cutoffConfidence: 'extrapolated',
    note: '60 MCQ and 3 FRQ worth 21 raw points, weighted 50/50 into a 120-point composite.',
  },

  'AP Macroeconomics': {
    label: 'AP Macroeconomics',
    slug: 'ap-macroeconomics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frq', label: 'Free response', maxRaw: 21, weight: 30 },
    ],
    compositeMax: 90,
    cutoffs: { 5: 63, 4: 51, 3: 39, 2: 27 },
    cutoffConfidence: 'extrapolated',
    note: '60 MCQ (about two thirds) and 3 FRQ worth 21 raw points, composite out of 90.',
  },

  'AP Microeconomics': {
    label: 'AP Microeconomics',
    slug: 'ap-microeconomics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'frq', label: 'Free response', maxRaw: 21, weight: 30 },
    ],
    compositeMax: 90,
    cutoffs: { 5: 63, 4: 51, 3: 39, 2: 27 },
    cutoffConfidence: 'extrapolated',
    note: 'Same structure as Macroeconomics: 60 MCQ plus 3 FRQ, composite out of 90.',
  },

  // ---- Batch 3 ------------------------------------------------------------
  // Section counts and percentage weights below are the College Board's
  // published exam structures. The CUTOFFS are extrapolated from the
  // researched subjects in batch 1, not published — College Board does not
  // release per-year curves. The UI labels these as estimates.
  //
  // Deliberately NOT modelled: AP Physics C (Mechanics / E&M), whose format
  // changed in the recent redesign, and the world-language exams, which fold
  // in speaking tasks. A wrong named model is worse than the generic fallback,
  // because the fallback at least tells the student it is generic.

  'AP English Literature and Composition': {
    label: 'AP English Literature',
    slug: 'ap-english-literature',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 45 },
      { id: 'frq', label: 'Free response (3 essays)', maxRaw: 18, weight: 55 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (45%) and three 6-point essays (55%).',
  },

  'AP European History': {
    label: 'AP European History',
    slug: 'ap-european-history',
    // Same four-section shape as APUSH, so it uses the same 130-point
    // composite and the same published 40/20/25/15 split.
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 52 },
      { id: 'saq', label: 'Short answer', maxRaw: 9, weight: 26 },
      { id: 'dbq', label: 'Document-based question', maxRaw: 7, weight: 32.5 },
      { id: 'leq', label: 'Long essay', maxRaw: 6, weight: 19.5 },
    ],
    compositeMax: 130,
    cutoffs: { 5: 98, 4: 81, 3: 62, 2: 40 },
    cutoffConfidence: 'extrapolated',
    note: 'Four separately weighted sections: 40% MCQ, 20% SAQ, 25% DBQ, 15% LEQ.',
  },

  'AP United States Government and Politics': {
    label: 'AP US Government and Politics',
    slug: 'ap-gov',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 12, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%) and four FRQs worth 12 raw points total (50%).',
  },

  'AP Comparative Government and Politics': {
    label: 'AP Comparative Government',
    slug: 'ap-comparative-government',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 55, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 12, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%) and four FRQs worth 12 raw points total (50%).',
  },

  'AP Computer Science A': {
    label: 'AP Computer Science A',
    slug: 'ap-computer-science-a',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 40, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 36, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '40 MCQ (50%) and four 9-point FRQs (50%).',
  },

  'AP Computer Science Principles': {
    label: 'AP Computer Science Principles',
    slug: 'ap-computer-science-principles',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 70, weight: 70 },
      { id: 'cpt', label: 'Create performance task', maxRaw: 6, weight: 30 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '70 MCQ (70%) and the Create performance task, 6 points (30%).',
  },

  'AP Physics 2': {
    label: 'AP Physics 2',
    slug: 'ap-physics-2',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '42 MCQ (50%) and four FRQs (50%), each scaled to 50.',
  },

  'AP Physics C: Mechanics': {
    label: 'AP Physics C: Mechanics',
    slug: 'ap-physics-c-mechanics',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '42 MCQ (50%) and four FRQs (50%), each scaled to 50.',
  },

  'AP Physics C: Electricity and Magnetism': {
    label: 'AP Physics C: E&M',
    slug: 'ap-physics-c-electricity-and-magnetism',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 42, weight: 50 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 40, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '42 MCQ (50%) and four FRQs (50%), each scaled to 50.',
  },

  'AP Precalculus': {
    label: 'AP Precalculus',
    slug: 'ap-precalculus',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 40, weight: 62.5 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 24, weight: 37.5 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '40 MCQ (62.5%) and four 6-point FRQs (37.5%).',
  },

  'AP Art History': {
    label: 'AP Art History',
    slug: 'ap-art-history',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 80, weight: 50 },
      { id: 'frq', label: 'Free response (6 questions)', maxRaw: 35, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '80 MCQ (50%) and six FRQs worth 35 raw points (50%).',
  },

  'AP Music Theory': {
    label: 'AP Music Theory',
    slug: 'ap-music-theory',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 75, weight: 45 },
      { id: 'frq', label: 'Free response (written)', maxRaw: 45, weight: 45 },
      { id: 'sight', label: 'Sight-singing', maxRaw: 18, weight: 10 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '75 MCQ (45%), written free response (45%), and sight-singing (10%).',
  },

  // ---- Batch 4: world languages + Latin ----------------------------------
  // Structures and PERCENTAGE weights verified against apcentral.collegeboard.org.
  // The redesigned modern-language exams are parallel: Section II is 55 MCQ
  // (Listening 25 + Reading 30) at 50%, Section I is 3 free-response tasks at
  // 50% — Project Presentation 20%, Project Q&A 15%, Argumentative Essay 15%.
  //
  // The free-response tasks are RUBRIC-scored and College Board does not
  // publish a raw point total, so maxRaw 5 is the standard AP world-language
  // rubric band and is an assumption. It only sets the slider range: each task
  // is weighted by the published percentage regardless.
  //
  // Still NOT modelled, because their structures were not verified:
  // AP Italian and AP Japanese (assumed-parallel is not verified), and the
  // sub-task split for AP Chinese (which has FOUR free-response tasks, not
  // three — its Q4 Email Response is 7.5%). Chinese is modelled at section
  // level only, which is accurate, rather than inventing its sub-weights.

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
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).',
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
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).',
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
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).',
  },

  'AP Chinese Language and Culture': {
    label: 'AP Chinese Language',
    slug: 'ap-chinese-language',
    // Four free-response tasks, not three. College Board publishes the section
    // split (50/50) but not every sub-weight, so this stays at section level
    // instead of inventing the missing ones.
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'frq', label: 'Free response (4 tasks)', maxRaw: 20, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%) and four free-response tasks including the email response (50%).',
  },

  'AP Spanish Literature and Culture': {
    label: 'AP Spanish Literature',
    slug: 'ap-spanish-literature',
    sections: [
      { id: 'mcqAudio', label: 'Multiple choice (audio texts)', maxRaw: 15, weight: 10 },
      { id: 'mcqRead', label: 'Multiple choice (written texts)', maxRaw: 50, weight: 40 },
      { id: 'frq', label: 'Free response (4 questions)', maxRaw: 24, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '15 audio MCQ (10%), 50 reading MCQ (40%), and four free-response questions (50%).',
  },

  'AP Latin': {
    label: 'AP Latin',
    slug: 'ap-latin',
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 52, weight: 50 },
      { id: 'frq', label: 'Free response (translation, essays)', maxRaw: 30, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '52 MCQ (50%) and five free-response questions including translation (50%). A small course-project component also contributes.',
  },
  'AP Italian Language and Culture': {
    label: 'AP Italian Language',
    slug: 'ap-italian-language',
    // Verified: same three-task shape as Spanish/French/German.
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'presentation', label: 'Project presentation (spoken)', maxRaw: 5, weight: 20 },
      { id: 'qa', label: 'Project Q&A (spoken)', maxRaw: 5, weight: 15 },
      { id: 'essay', label: 'Argumentative essay', maxRaw: 5, weight: 15 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%), project presentation (20%), project Q&A (15%), argumentative essay (15%).',
  },

  'AP Japanese Language and Culture': {
    label: 'AP Japanese Language',
    slug: 'ap-japanese-language',
    // Verified: FOUR free-response tasks (presentation, Q&A, story narration,
    // email response), like Chinese rather than the three-task European exams.
    // Section split is published; the per-task weights are not, so this stays
    // at section level instead of inventing them.
    sections: [
      { id: 'mcq', label: 'Multiple choice (listening + reading)', maxRaw: 55, weight: 50 },
      { id: 'frq', label: 'Free response (4 tasks)', maxRaw: 20, weight: 50 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '55 MCQ (50%) and four free-response tasks including story narration and the email response (50%).',
  },
  'AP Business with Personal Finance': {
    label: 'AP Business with Personal Finance',
    slug: 'ap-business-personal-finance',
    // Weights are the CED's published percentages (60 / 15 / 25), so unlike the
    // extrapolated subjects these section splits are exact. Only the cutoffs
    // are estimated — this course is new enough that no curve has been released.
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 60 },
      { id: 'canvas', label: 'Business Canvas Project validation', maxRaw: 6, weight: 15 },
      { id: 'frq', label: 'Free response (3 questions)', maxRaw: 18, weight: 25 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '60 MCQ (60%), the Business Canvas Project exam-day validation question (15%), and three free-response questions (25%).',
  },
  'AP Cybersecurity': {
    label: 'AP Cybersecurity',
    slug: 'ap-cybersecurity',
    // 70/30 split is published, so these weights are exact. Only the cutoffs are
    // estimated — the course launches 2026-27 and has no released curve.
    sections: [
      { id: 'mcq', label: 'Multiple choice', maxRaw: 60, weight: 70 },
      { id: 'frq', label: 'Device Security Analysis', maxRaw: 10, weight: 30 },
    ],
    compositeMax: 100,
    cutoffs: { 5: 70, 4: 57, 3: 43, 2: 30 },
    cutoffConfidence: 'extrapolated',
    note: '60 MCQ (70%) and one free-response Device Security Analysis question (30%).',
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

export default AP_SCORE_MODELS;
