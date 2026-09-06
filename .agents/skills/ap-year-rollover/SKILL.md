---
name: ap-year-rollover
description: Annual AP course rollover for Apex Scholar. Use when checking whether College Board has released updated Course and Exam Descriptions, when the user supplies new CED PDFs, or when rolling the app from one AP school year to the next. Also use when the AP exam calendar needs re-verifying against AP Central, or when apExamDates.test.js fails. Produces the list of CEDs to download, then updates curricula, score models, test configurations, the sitemap, and transcribes the new exam and late-testing dates from apcentral.collegeboard.org.
---

# AP Year Rollover

Apex Scholar mirrors College Board's AP courses. Every year some courses are
revised, and stale data is worse than missing data: a student revising units
that were deleted from their exam is being actively misled. This skill runs the
yearly refresh.

It has **two phases**. Phase 1 tells the user which CEDs to download. Phase 2
runs after they supply them.

Repo root is the directory containing `ap-prep-hub/`. All paths below are
relative to `ap-prep-hub/`.

---

## Phase 1 — Find what changed

### 1.1 Read College Board's change table

Fetch `https://apcentral.collegeboard.org/courses/how-ap-develops-courses-and-exams/course-changes-overview`
and extract the table. Columns that matter:

- **"Future CED Released"** — a full replacement CED exists. **Download these.**
- **"Future Status"** containing *"Clarifications and Corrections effective fall …"* —
  the base CED is unchanged but a supplement carries real exam changes
  (this is where the AP Physics 42-question change lived). **Download these too.**

Also check any linked revision pages, which state what actually changed:
- `…/courses/ap-world-languages-revisions`
- `…/courses/ap-history-exam-updates`
- `…/courses/ap-statistics/future-revisions`

### 1.2 Compare against what is on disk

```bash
ls -la ap-prep-hub/public/ced/*.pdf
```

Every file's date tells you when it was last refreshed. A course listed with a
newer CED than the local file's date needs replacing.

### 1.3 Exam dates change every year, CED or not

Course content can be stable for years; the exam calendar never is. Check it on
its own, independent of the CED table:

```
https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates
https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates/late-testing-dates
```

The page shows **one exam year at a time** and flips to the next year over the
summer. If it shows a year newer than `VERIFIED_EXAM_YEARS` in
`src/constants/apExamDates.js`, the app is serving invented dates right now —
see §2.6. Treat that as urgent regardless of what the CED table says.

### 1.4 Report to the user

Give three lists, and be explicit that the third is *not* to be deleted:

1. **Replace** — courses with a new full CED.
2. **Also download** — courses with a new Clarifications and Corrections doc.
3. **Leave alone** — courses College Board marks "no changes announced". Their
   existing CEDs are still correct.

Ask the user to drop the new PDFs into `ap-prep-hub/public/ced/new-ced/`, named
exactly like the existing ones (`ap-<slug>-course-and-exam-description.pdf`).

**Stop here.** Do not continue until the files exist.

---

## Phase 2 — Apply the update

### 2.1 Swap the files — never blind-delete

`new-ced/` will usually hold FEWER files than `public/ced/`. Deleting everything
and copying the new set would destroy the CEDs of every unchanged course.

Copy over, keep the rest, then remove the folder:

```bash
cd ap-prep-hub/public/ced
python3 - <<'PY'
import os, shutil, hashlib
h = lambda p: hashlib.md5(open(p,'rb').read()).hexdigest()[:8]
for f in sorted(x for x in os.listdir('new-ced') if x.endswith('.pdf')):
    before = h(f) if os.path.exists(f) else None
    shutil.copy2(os.path.join('new-ced', f), f)
    print(('ADDED   ' if before is None else
           'REPLACED' if before != h(f) else 'SAME    '), f)
PY
rm -rf new-ced
python3 -c "import os;print('non-PDF:',[f for f in os.listdir('.') if f.endswith('.pdf') and open(f,'rb').read(5)!=b'%PDF-'] or 'none')"
```

### 2.2 Extract the truth from each CED

`pdftotext` beats reading page images — faster and quotable. Requires
`poppler-utils` (`brew install poppler`).

Exam format lives in one sentence:

```bash
pdftotext -f 1 -l 400 public/ced/ap-<slug>-course-and-exam-description.pdf - \
  | grep -iE "exam is [0-9].*(hour|minutes).*includes|includes [0-9]+ multiple"
```

Units come from `scripts/ced_units.py`. It anchors on the fact that a real unit
header in "Course at a Glance" is `Unit N: Title` followed within two lines by an
exam-weighting percentage — topic numbering and running headers never are:

```bash
python3 .Codex/skills/ap-year-rollover/scripts/ced_units.py \
  ap-prep-hub/public/ced/ap-<slug>-course-and-exam-description.pdf
```

Run `scripts/audit_curriculum.py` from `ap-prep-hub/` to diff every CED against
the app in one pass.

### 2.3 Update, in this order

For each changed course:

1. **`src/constants/curriculum/<subject>.js`** — `examFormat.sections`, and
   `units[]` with the CED's published weighting ranges. Leave a comment naming
   what changed and why; future readers need to know a unit was deleted, not
   just that the list is different.
2. **`src/constants/testConfigurations.js`** — section question counts/timings
   and the unit list used by the practice-test filter. **A unit here that is no
   longer on the exam generates questions that cannot appear.**
3. **`src/constants/apScoreModels.js`** — `sections[]` raw maxima and weights,
   `note`, and `cutoffConfidence`.
4. **`src/constants/apExamDates.js`** — the new year's exam dates. See §2.6;
   this one is mandatory every year even when no CED changed.
5. **`public/sitemap.xml`** — only if slugs changed or subjects were added.

### 2.4 Adding a brand-new course

New AP courses appear most years. Touch every one of these or the subject will
half-exist:

| File | What to add |
|---|---|
| `src/constants/curriculum/<name>.js` | full curriculum object |
| `src/constants/curriculum/index.js` | dynamic import **and** `subjectNames` entry |
| `src/constants/subjects.js` | display name, description, icon |
| `src/constants/apScoreModels.js` | score model **and** any short-name aliases |
| `src/services/cedSearch.js` | subject → CED filename, so the tutor can quote it |
| `src/constants/testConfigurations.js` | sections + units |
| `public/sitemap.xml` | `/ap-score-calculator/<slug>` |

The `subjectAliases` test fails if a subject in `subjects.js` falls through to
the generic score model — that is the safety net for a half-wired subject.

### 2.5 Topics: review, do not automate

Unit **titles** diff reliably. Unit **topics** do not: the app's topics are
deliberately short paraphrases ("Analyzing categorical data"), while the CED
uses its own headings ("Introducing Statistics: …"). Automated overlap scoring
reports 0–45% even when the content is right, so **never mass-rewrite topics
from a similarity score.**

Use `scripts/ced_topics.py`, which reads the **topic pages**, not the
Course at a Glance table. Each topic has its own page with a full-width heading;
the glance table puts the same titles in narrow columns where `pdftotext` cuts
them mid-phrase ("Introduction to", "Resource Allocation and"). The topic-page
source yields complete titles with zero fragments.

```bash
python3 .Codex/skills/ap-year-rollover/scripts/ced_topics.py \
  ap-prep-hub/public/ced/ap-<slug>-course-and-exam-description.pdf
```

Two guards are mandatory when writing topics back:

1. **Refuse to write when the CED unit count != the app unit count.** Without
   this, a truncated extraction silently writes unit 6's topics into unit 1.
   Investigate the mismatch instead — it usually means the extraction stopped
   early, or the CED is shared by two courses (Calculus AB is units 1-8 of the
   AB/BC CED).
2. **Drop any title ending in a dangling conjunction.** A shorter accurate list
   beats one containing fragments.

Some CEDs (world languages, English, Spanish Literature, Studio Art) have no
numbered topic pages at all. Leave those alone.

### 2.6 Exam dates — transcribe, never infer

`src/constants/apExamDates.js` holds one hand-verified table per exam year plus
a *generated* fallback that guesses each subject's slot from the usual May
pattern. **The fallback is wrong for most subjects and fails silently** — a
student sees a confident countdown to a date the College Board never published.
It exists only so the app does not crash; reaching it in production is a bug.

Transcribe both pages, subject by subject:

| Source page | What it gives |
|---|---|
| `…/exam-administration-ordering-scores/exam-dates` | main administration: date + 8 a.m. / 12 p.m. session, portfolio and Capstone deadlines |
| `…/exam-administration-ordering-scores/exam-dates/late-testing-dates` | `lateDate` / `lateTime` for every subject |

Then:

1. Add `AP_EXAM_DATES_<year>` in College Board's own order (Week 1 Monday →
   Week 2 Friday), with a `// Monday, May N` comment per day so a reviewer can
   diff it against the page by eye.
2. Add the year to `VERIFIED_EXAM_YEARS` and to the `if` in
   `getCurrentYearExamDates()`.
3. **Delete the previous year's table.** `getTargetExamYear()` never returns a
   past year, so an old table is unreachable code that only invites drift.
4. Subject keys must match `SUBJECT_KEY_TO_EXAM_NAME`'s *values* exactly, not
   College Board's wording. AP Central writes "Comparative Government and
   Politics"; the app key is `"AP Government and Politics: Comparative"`. A
   mismatch means that subject silently has no countdown.
5. New courses on the schedule (pilots included) get an entry even if no
   curriculum key maps to them yet — note that in a comment.
6. Portfolio and Capstone entries carry `type: 'portfolio'` / `'presentation'`
   and no `lateDate`; they are deadlines, not sittings.

`src/constants/apExamDates.test.js` enforces the parts that can be checked
mechanically: every exam falls inside the two official weeks, every late date
inside the late-testing window, every sat exam has a late date, only the two
official start times appear, every mappable curriculum subject has an entry —
and, the reason the file exists, **`VERIFIED_EXAM_YEARS` covers the year
students are currently counting down to.** That last assertion turns red on its
own each June, which is what forces this section to get run.

It cannot check the dates themselves. Read them off the page.

---

## Verification (required before reporting done)

```bash
cd ap-prep-hub
CI=true npx react-scripts test --silent   # all suites must pass
CI=true npm run build                     # must compile
python3 .Codex/skills/ap-year-rollover/scripts/audit_curriculum.py
```

`apExamDates.test.js` failing on "has a hand-verified table for the year
students are counting down to" means §2.6 has not been done — nothing else in
this skill matters until it passes.

Then load the app and check, per changed subject:
- `/ap-score-calculator/<slug>` — one slider per section, correct maxima, all-max
  gives the composite max
- `/ai-tutors` — the subject appears and opens
- `/practice-tests` — the unit filter lists the new units

**Check `document.visibilityState` before trusting any browser measurement.** A
backgrounded tab gets no `requestAnimationFrame`, so animations never start and
elements sit at their initial state. This has repeatedly looked like a rendering
bug when nothing was wrong.

---

## Rules

- **Only encode what the CED or an AP Central page states.** Third-party
  calculator sites are routinely a year stale — one quoted the retired
  40-question Physics format long after it changed. If College Board does not
  publish a number (per-task FRQ maxima, per-unit weightings for the Career
  Kickstart courses), say so in a comment and mark `cutoffConfidence:
  'extrapolated'` rather than inventing it.
- **A wrong named model is worse than the generic fallback**, because the
  fallback tells the student it is a rough estimate.
- **Cutoffs are never published.** Section structure and weights come from the
  CED; cut points are always estimates and the UI must keep saying so.
- Do not commit. Report what changed and let the user deploy.

## Deploy reminder

Two independent deploys — Netlify does **not** update the Cloudflare worker:

```bash
cd ap-prep-hub/cloudflare/ai-router && wrangler deploy
```
