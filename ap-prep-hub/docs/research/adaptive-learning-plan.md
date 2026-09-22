# Making Apex Scholar adaptive

*2026-09-19. Written after measuring what production actually holds, which
changed the answer.*

## The blocker is not the algorithm

Aggregate counts from production, today:

| collection | docs |
|---|---|
| users | 92 |
| conversations | 307 |
| practiceTests | 47 |
| flashcardDecks | 35 |
| solverHistory | 29 |
| studySessions | 16 |
| diagnosticResults | **3** |
| testProgress | 2 |
| reviews | 1 |
| **per-question response records** | **0** |

`collectionGroup('responses')` returns nothing. The only subcollection under any
sampled user is `integrations`. The ~1,432 responses cited in Round 56 are item
arrays nested *inside* the 47 practice-test documents — not queryable per-item
records with a student, an item id, a correctness bit and a timestamp.

Every adaptive algorithm — Elo, BKT, IRT, DKT, all of them — consumes exactly that
tuple stream. **It is not being written.** No amount of model sophistication
substitutes for it, and every week it stays unwritten is a week of data you cannot
get back.

Second thing the table says: `diagnosticResults` = 3, across 92 users. The most
obviously adaptive surface in the app has run three times. That is the Round 55
activation problem again, not a modelling problem.

## Step 0 — the response log (do this first, it is small)

One append-only collection. Write on every graded interaction: practice test item,
diagnostic item, flashcard grade, review-queue item.

```
responses/{autoId}
  userId         string     // NOT `uid` — firestore.rules ownsIncoming() reads userId
  itemId         string     // questionBank id, or deck:card id
  subject        string
  unit           string     // CED unit, see idea 4
  source         'practiceTest' | 'diagnostic' | 'flashcard' | 'review'
  chosen         number     // WHICH distractor, not just right/wrong — see idea 3
  correct        boolean
  msToAnswer     number     // fast+wrong = misconception, slow+wrong = gap
  changedAnswer  boolean
  at             timestamp
```

`chosen` and `msToAnswer` are the two fields people forget and cannot backfill.
Storing `correct` alone throws away three quarters of the signal in a 4-option item.

Write it now even with nothing consuming it. At ~1,000 responses/week you have
enough for Elo in about a month; with nothing logged you are always a month away.

## What works at zero student data (ship while the log fills)

### 1. Difficulty priors from the flaw sweep — already computed
Schmucker & Moore predicted *low-difficulty* items from IWF features alone at
AUC 0.825 / F1 0.649 (no student data, 7,126 items validated against 448k
students' IRT parameters). `src/utils/itemFlaws.js` already labels all 3,560.
Items keying the longest option are measurably easier (β=−0.437), and 28.1% of the
bank has that cue. That is a free difficulty ordering good enough to sequence a
practice set easy→hard on day one, replaced by real estimates later.

### 2. Cue-reliance as a student signal — free, and unique to this bank
The 1,001 longest-option-correct items are a defect *and* an instrument. A student
who scores far higher on cued items than on matched uncued ones is test-wise
guessing, not knowing. This is a **within-student contrast**, so it needs no
calibration and no population — it works on one student's first twenty questions.
Nothing else in the cold-start toolkit gives you that.

Surfacing it is also genuinely useful to a student: *"you're getting these right by
elimination, not by knowing the content"* is the single most actionable thing you
can tell someone three months out from an exam.

### 3. Distractor → misconception tagging — highest leverage, do it before the log fills
Every banked item has four per-choice explanations. One offline pass (LLM-drafted,
human-spot-checked against the 200 labels) maps each distractor to a misconception
tag. Then a wrong answer says *which* misconception, not just "wrong."

That is roughly 4× the information per response, and it directly attacks the
data-scarcity wall: a misconception-tagged bank reaches useful diagnosis in
hundreds of responses where an untagged one needs tens of thousands. Doing it
*before* logging starts means the log is rich from its first row.

### 4. A prerequisite graph from the CEDs — 37 PDFs already in `public/ced/`
Unit and topic structure with explicit dependencies, straight from College Board.
Build the DAG once, and you can say *"you're failing Unit 5 because Unit 3 never
landed"* with zero response data. No other feature on this list changes what a
student does next as much, and none is less dependent on ML.

### 5. Exam-date-weighted allocation
`AP_EXAM_DATES_2027` is in the codebase and College Board publishes per-unit exam
weights. Allocate practice by `(mastery gap) × (exam weight) × f(days remaining)`.
Adaptive scheduling, no model at all.

### 6. Stop lying about mastery
"73% on Unit 4" off six questions is noise presented as measurement. Beta-Binomial
posterior, show the credible interval, and keep asking until it is narrow enough to
act on. This is what makes an adaptive tool feel trustworthy rather than arbitrary,
and it is about fifteen lines.

## What unlocks once the log has ~5,000 responses

- **Elo for items and students.** Converges far faster than 2PL IRT, updates online
  from response #1, and is the right cold-start substitute. Upgrade path to IRT
  later is clean.
- **Select for ~80% predicted success** rather than next-due. Desirable difficulty:
  pick the item whose predicted correctness sits near 0.8, not the oldest card.
  SM-2 already decides *when*; this decides *what*, which is where the adaptivity is.
- **Fast-and-wrong vs slow-and-wrong** routing. Fast+wrong is a confident
  misconception (re-teach); slow+wrong is an unknown (introduce). Needs only
  `msToAnswer`, which is why it is in the schema above.

## What stays blocked — do not pretend otherwise

Deep knowledge tracing, neural/deep IRT, misconception clustering from response
patterns, and anything evaluated "on live Apex Scholar logs" remain blocked for the
same reason Round 56 rejected six of Gemini's ten proposals. They need thousands of
students, not ninety, and they need the log to have existed for months. Building
them now produces a demo that overfits seven people.

## Order

1. Response log (step 0) — nothing else matters until this exists.
2. CED prerequisite graph (4) — biggest behaviour change, no ML.
3. Distractor→misconception tagging (3) — multiplies every future data point.
4. Difficulty priors (1) + cue-reliance (2) — already computed, just surface them.
5. Honest mastery intervals (6), exam-weighted allocation (5).
6. Elo and 80%-success selection, once the log is fat enough.

And fix the funnel in parallel: three diagnostic results across 92 users means the
adaptive engine, however good, currently has almost nobody to be adaptive at.
