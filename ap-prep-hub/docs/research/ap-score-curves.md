# Deep Research: AP exam scoring models and cut points (May 2027 exams)

_Research run 2026-09-24 · depth: exhaustive · feeds `src/constants/apScoreModels.js`, used by the score calculator, the tutor's score widget and practice-test AP scores._

## Executive Summary

The section structure of every AP exam is published and has been re-verified against College Board's AP Central exam pages. Six models had wrong structure: Biology (FRQ is 34 raw points, not 36), CS A (redesigned to 42 MCQ at 55% / 25 FRQ points at 45%), Precalculus (42 MCQ, not 40), US Government (FRQs are 3/4/4/6 points, each 12.5%), Comparative Government (19 FRQ points), and Art History (34 FRQ points). Economics, US Government, Chinese and Japanese now use their published per-question weights. AP African American Studies had no model and now has one.

The College Board does not publish cut points. The app's old cut points were either copied from pre-2023 estimates or were one generic 70/57/43/30 curve for 27 subjects. Both are now wrong in the same direction. In 2024–25 College Board moved to **Evidence-Based Standard Setting**, and pass rates jumped on the exams it reset. For example, English Language went from 55% to 74% scoring 3+, Physics 1 from 47% to 66%, and Environmental Science from 54% to 69% ([College Board, 2025](https://allaccess.collegeboard.org/2025-ap-exams-scoring-standards-and-security-new-digital-era)). Any curve older than that is too harsh.

New cut points come from the only primary evidence available: College Board's released practice-exam conversion charts (2012–2022). Each chart is re-anchored to the 2026 score distribution. For subjects with no released chart, a model is fitted across all the charts. On average the new cut points are **lower** than the old ones, most of all for 4s and 5s, which matches the rise in 4s and 5s.

## Key Findings

1. **Structure is authoritative; cut points are not.** AP Central publishes question counts and section weights for every exam, and point values for most. It never publishes cut points; only its scoring worksheets do, and only for released practice exams.
2. **Standards changed in 2024–25.** Share of 5s in 2026 compared with the chart years: Biology 15% vs 6% (2017), Chemistry 15% vs 9% (2017), Psychology 50% scoring 4+ vs 47% (2012), Physics 1 19% vs 4% (2015). Old curves overstate the score needed.
3. **Released charts exist for 11 subjects:** Biology (2015–17), Calculus AB (2012–18), Calculus BC (2019), Chemistry (2017), Statistics (2013, 2019), Macroeconomics (2013–2019), Microeconomics (2017), English Language (2012, 2016), Human Geography (2022), Psychology (2012) and Physics 1 (2015–16). Sources: CB practice-exam scoring worksheets as reproduced on Course Hero, CliffsNotes, Studocu, Studylib and pdfcoffee. See the table below.
4. **Third-party calculators are unreliable.**
   - Test Ninjas gives AP Statistics a 90/100 cut for a 5, but 17% of students earn one. It uses the same table for Latin, Spanish Language and Chinese, still describes the retired 40-question Statistics format, and its Biology numbers match the app's old values exactly.
   - GradGPT says it derives its tables from 2025 distributions, but its structure is also stale.
   - Neither was used as a source.
5. **Several exams changed for 2026–27:**
   - **Statistics:** 42 MCQ and four 10-point FRQs, starting May 2027 ([Math Medic](https://mathmedic.com/blog/whats-changing-in-ap-statistics-for-the-26-27-school-year/)).
   - **CS A:** 42 MCQ; FRQs of 7, 7, 5 and 6 points.
   - **World languages:** now built around a January project (presentation 20%, Q&A 15%, writing 15%).
   - **Latin:** adds 2% for course-project checkpoints; standard setting is scheduled for June 2026.

## Method

For a subject with a released chart from year *Y*:
- `cut% = chart cut / chart composite max`.
- The share of students at or above each score in year *Y* and in 2026 comes from College Board distributions ([Total Registration](https://www.totalregistration.net/AP-Exam-Registration-Service/AP-Exam-Score-Distributions.php) compiles the official figures).
- Each cut keeps its percentile position. Its composite % in 2026 is interpolated on a normal-quantile scale through that year's four (share, cut%) points.
- The student population is assumed stable across years, and the change is attributed to standard setting.
- Where the 2026 share falls more than 0.25 z outside the chart year's observed range, the extrapolation is averaged with the pooled model below.
- Several charts per subject are averaged.
- **Redesigned since the chart** (Biology's 2020 FRQ change, English Language's 2019–20 rubric, Psychology and Physics 1 in 2025, Statistics in 2027): averaged 50/50 with the pooled model.
- **No released chart:** a pooled fit over all 92 released (share, cut%) points: `cut% = 50.8 + 17.9·z`. Leave-one-subject-out mean absolute error is **8.0 composite points**, mostly because some exams are harder than others. Physics 1 was off by 19.
- **New courses** (Business with Personal Finance, Cybersecurity): the pooled model at a typical AP distribution.

Reproduce with `python3 docs/research/ap-score-curves/final.py`. The inputs are `sheets.json` (released charts) and `dists.json` (2011–2026 distributions). After July 2027, add the 2027 distributions and change the anchor year.

## Old vs new (cutoffs for 5/4/3/2)

| Subject | Old | New | Basis | Structure change |
|---|---|---|---|---|
| AP Biology | 93/74/51/28 of 120 | 82/65/47/29 of 120 | blend | mcq 60, frq 36 → mcq 60, frq 34 |
| AP Calculus AB | 77/59/43/27 of 108 | 69/49/37/23 of 108 | chart |  |
| AP Calculus BC | 68/57/42/26 of 108 | 68/55/45/26 of 108 | chart |  |
| AP US History | 98/81/62/40 of 130 | 91/65/51/33 of 130 | pooled |  |
| AP World History: Modern | 101/84/64/41 of 130 | 91/66/56/33 of 130 | pooled |  |
| AP Psychology | 70/58/45/33 of 100 | 74/56/43/27 of 100 | blend |  |
| AP Chemistry | 72/58/42/25 of 100 | 72/48/29/16 of 100 | chart |  |
| AP Physics 1 | 70/57/43/30 of 100 | 58/45/34/29 of 100 | blend |  |
| AP Statistics | 70/57/43/30 of 100 | 68/53/42/33 of 100 | blend |  |
| AP English Language and Composition | 70/57/43/30 of 100 | 70/56/42/31 of 100 | blend |  |
| AP Environmental Science | 91/74/56/39 of 130 | 92/71/54/43 of 130 | pooled |  |
| AP Human Geography | 84/68/52/36 of 120 | 82/67/51/32 of 120 | chart |  |
| AP Macroeconomics | 63/51/39/27 of 90 | 70/58/44/29 of 90 | chart | mcq 60, frq 21 → mcq 60, frqLong 10, frqShort1 5, frqShort2 5 |
| AP Microeconomics | 63/51/39/27 of 90 | 72/57/44/28 of 90 | chart | mcq 60, frq 21 → mcq 60, frqLong 10, frqShort1 5, frqShort2 5 |
| AP English Literature and Composition | 70/57/43/30 of 100 | 69/54/40/29 of 100 | pooled |  |
| AP European History | 98/81/62/40 of 130 | 89/67/51/33 of 130 | pooled |  |
| AP United States Government and Politics | 70/57/43/30 of 100 | 64/50/38/26 of 100 | pooled | mcq 55, frq 12 → mcq 55, frqConcept 3, frqQuant 4, frqScotus 4, frqArgument 6 |
| AP Comparative Government and Politics | 70/57/43/30 of 100 | 69/57/41/30 of 100 | pooled | mcq 55, frq 12 → mcq 55, frq 19 |
| AP Computer Science A | 70/57/43/30 of 100 | 63/50/43/38 of 100 | pooled | mcq 40, frq 36 → mcq 42, frq 25 |
| AP Computer Science Principles | 70/57/43/30 of 100 | 74/59/45/33 of 100 | pooled |  |
| AP Physics 2 | 70/57/43/30 of 100 | 66/51/40/24 of 100 | pooled |  |
| AP Physics C: Mechanics | 70/57/43/30 of 100 | 66/53/40/29 of 100 | pooled |  |
| AP Physics C: Electricity and Magnetism | 70/57/43/30 of 100 | 63/52/39/26 of 100 | pooled |  |
| AP Precalculus | 70/57/43/30 of 100 | 61/47/34/24 of 100 | pooled | mcq 40, frq 24 → mcq 42, frq 24 |
| AP Art History | 70/57/43/30 of 100 | 69/55/43/27 of 100 | pooled | mcq 80, frq 35 → mcq 80, frq 34 |
| AP Music Theory | 70/57/43/30 of 100 | 67/58/47/32 of 100 | pooled |  |
| AP Spanish Language and Culture | 70/57/43/30 of 100 | 65/50/34/17 of 100 | pooled |  |
| AP French Language and Culture | 70/57/43/30 of 100 | 69/56/41/23 of 100 | pooled |  |
| AP German Language and Culture | 70/57/43/30 of 100 | 63/55/42/28 of 100 | pooled |  |
| AP Italian Language and Culture | 70/57/43/30 of 100 | 66/55/42/29 of 100 | pooled |  |
| AP Chinese Language and Culture | 70/57/43/30 of 100 | 52/43/32/27 of 100 | pooled | mcq 55, frq 20 → mcq 55, presentation 5, qa 5, narration 5, email 5 |
| AP Japanese Language and Culture | 70/57/43/30 of 100 | 52/48/40/36 of 100 | pooled | mcq 55, frq 20 → mcq 55, presentation 5, qa 5, narration 5, email 5 |
| AP Spanish Literature and Culture | 70/57/43/30 of 100 | 66/54/41/27 of 100 | pooled |  |
| AP Latin | 70/57/43/30 of 100 | 66/51/40/28 of 100 | pooled |  |
| AP African American Studies | — | 66/51/38/23 of 100 | pooled |  |
| AP Business with Personal Finance | 70/57/43/30 of 100 | 68/54/41/28 of 100 | typical |  |
| AP Cybersecurity | 70/57/43/30 of 100 | 68/54/41/28 of 100 | typical |  |
`chart` = this subject's released chart, re-anchored to 2026 · `blend` = chart averaged 50/50 with the pooled model (exam redesigned since the chart) · `pooled` = cross-subject model on this exam's 2026 distribution · `typical` = pooled model at a typical distribution.

## Contrarian Views and Risks

- **The re-anchoring assumes stable cohorts.** If the 2026 rise in scores is partly stronger students, cuts moved less than estimated, so these are slightly generous.
- **Practice-exam charts versus the main exam.** Released practice exams are usually a real international or alternate form, and that form's difficulty differs from the main May exam.
- **Pooled subjects carry about ±8 composite points of uncertainty.** That's enough to move a borderline student by one score. The calculator labels these "extrapolated from other AP exams".
- **Redesigned exams have no data on the new format.** This applies to Physics 1/2/C (2025), Psychology (2025), Statistics and CS A (2026–27), world languages (2026) and Latin (2027). Their first real curves arrive with the 2026–27 score releases.
- **World-language task scales are not published.** They are modelled as 0–5 rubrics; only slider granularity depends on that, because the weights are published.

## Open Questions

Resolved 2026-09-24 from the official 2026 scoring guidelines (`apcentral.collegeboard.org/media/pdf/ap26-sg-*.pdf`): Comparative Government FRQs are 4/5/5/5; Physics C (both) 10/12/10/8; US Gov 3/4/4/6; Latin 8/15/8/11/11 = 53 (app had 30); Spanish Literature 6/6/10/10 = 32 (had 24); Music Theory written 9/9/24/24/25/18/9 = 118 (had 45), sight-singing 2 × 9; African American Studies SAQ 4/3/3, DBQ 7, validation 2; Chinese and Japanese tasks are 6-point rubrics.

Still open: the raw scales of the new project tasks (presentation, Q&A) on the world-language exams, which first run in May 2027 — the 2026 guidelines still show the old tasks. Only slider granularity depends on it.

## Sources

- AP Central exam pages, `apcentral.collegeboard.org/courses/<course>/exam` (all 36 courses, fetched 2026-09-24): structure and weights.
- [College Board — 2025 AP Exams: Scoring, Standards, and Security](https://allaccess.collegeboard.org/2025-ap-exams-scoring-standards-and-security-new-digital-era): Evidence-Based Standard Setting and the 2024 vs 2025 rise in 3+ rates.
- [AP Art History 2025 Scoring Guidelines](https://apcentral.collegeboard.org/media/pdf/ap25-sg-art-history.pdf): Q1 is 8 points.
- [Total Registration — AP score distributions 2011–2026](https://www.totalregistration.net/AP-Exam-Registration-Service/AP-Exam-Score-Distributions.php): official distributions compiled per year (the 2025 Micro "241%" typo was corrected to 24.1%).
- CB released practice-exam scoring worksheets (via the reposting sites above): Stats 2013 (68/52/39/28 of 100), 2019 (73/59/44/32); Macro 2013 (72/59/52/42 of 90), 2014 (72/59/50/39), 2017 (73/60/50/39), 2018 (74/62/53/40), 2019 (67/54/45/35); Micro 2017 (70/55/44/36); English Language 2012 (115/100/82/58 of 150), 2016 (108/94/76/52); HuG 2022 (85/74/63/49 of 120); Psych 2012 (112/94/79/65 of 150); Physics 1 2015 (51/39/29/20 of 80), 2016 (57/43/31/20); Bio 2015 (93/74/51/28 of 120), 2016 (86/68/49/30), 2017 (93/75/51/29); Calc AB 2012 (67/54/41/33 of 108), 2016 (67/55/42/35), 2017 (71/59/44/26), 2018 (66/54/41/26); Calc BC 2019 (70/59/45/28); Chem 2017 (79/64/44/28 of 100).
- [Math Medic — AP Statistics changes for 2026–27](https://mathmedic.com/blog/whats-changing-in-ap-statistics-for-the-26-27-school-year/): four 10-point FRQs.
- [APCSExamPrep — CS A exam format](https://www.apcsexamprep.com/pages/ap-csa-exam-format): FRQ points 7/7/5/6.
- [PrepScholar — AP Comparative Government](https://blog.prepscholar.com/ap-comparative-government-and-politics-exam): FRQ points 4/5/5/5.
- [physicslab.app, quoting the AP Physics 1 CED](https://physicslab.app/courses/559004/lectures/52642914): FRQ points 10/12/10/8.
- Rejected as sources, and why: Test Ninjas (identical tables across unrelated subjects, stale formats) and GradGPT (stale structure). They were used only to show how far third-party estimates disagree.

## Rerun Inputs
workflow: firecrawl-deep-research
topic: AP per-exam composite structure and cut points for the May 2027 exams
depth: exhaustive
output: markdown
