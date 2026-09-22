# Item-quality dataset for AI-generated AP questions

## Why this exists

`scripts/seed-question-bank.mjs` wrote 3,560 questions into Firestore. Every one
of them passed `isUsableQuestion`, which checks **shape only**: four choices,
four explanations, an answer index between 0 and 3. Nothing has ever checked
whether the marked answer is correct.

`verifyMcqs()` exists in `src/services/ai/mcqGenerator.js` and the seeder never
calls it. It also fails open by design, so even on the paths that do call it a
failed check ships the question anyway.

Two measurements from earlier rounds say this matters:

- A question in production had the wrong key — AP Art History, B stored as
  correct, A actually correct. (That one came from the tutor path, not the bank,
  but the same model and the same prompt shape produced both.)
- Gemma-4-31b produced unusable output 1/3 of the time on JSON and 0/3 on prose
  when measured against this app's own prompts.

So: how many of the 3,560 are wrong, and can that be detected automatically?

## The dataset

`sample.jsonl` — **200 items across 9 subjects**, 22–23 each, drawn stratified by
`scripts/export-label-sample.mjs` (seeded, so the draw is reproducible):

> AP Calculus AB · AP Calculus BC · AP Chemistry · AP Computer Science A ·
> AP Computer Science Principles · AP Precalculus · AP Statistics ·
> AP U.S. History · AP World History: Modern

Deliberately not all 36. The sample is scoped to subjects one annotator can
actually adjudicate — see **Subject coverage** below. Restratify if that changes.

Each row carries the question, choices, stored answer index, the per-choice
explanations, the generating model, and its bundle provenance.

The exported labels add `human_answer`, `confidence` (`sure`/`unsure`),
`key_agrees`, `needs_adjudication`, `skipped`, and `flags`. Note that
`key_agrees: true` with `confidence: 'unsure'` still sets
`needs_adjudication: true` — agreeing by luck is not evidence.

## Why raw disagreement is not the label

If you answer an item wrong, you record a disagreement with a key that was
actually right. That is a false positive, and it does not average out — it
inflates the measured error rate.

Let the true key-error rate be 5%, and your accuracy on a subject be *a*. The
disagreement rate you would observe is:

```
P(disagree) = 0.05·a  +  0.95·(1 − a)
```

| your accuracy | measured disagreement | true rate |
|---|---|---|
| 100% | 5% | 5% |
| 95% | 9.5% | 5% |
| 80% | 23% | 5% |
| 50% (guessing) | 50% | 5% |

At 95% accuracy you would publish nearly double the truth. On a subject you are
guessing at, the number is pure noise that looks exactly like a finding.

**So disagreement is a screening signal, not a label.** It tells you which items
to look at. The label is made afterwards, by checking.

## Doing it, step by step

**1. Open the tool.** Double-click `ap-prep-hub/docs/research/labeler.html`, or:

```bash
open ap-prep-hub/docs/research/labeler.html
```

It runs entirely in the browser. Nothing is uploaded anywhere.

**2. Use a normal window, not a private one.** Autosave writes to browser
storage, and private windows block it. The tool says `AUTOSAVE FAILED` in that
case rather than letting you work for an hour believing it is being kept — check
that line under the counter says `autosaved <time>` before you settle in.

**3. Load the sample.** First file box → `docs/research/sample.jsonl`. You should
see `1 / 200` and an AP Statistics question. Leave the second box alone on a
first run; it is for resuming.

**4. Answer, blind.** The stored key is hidden. Press `A`–`D` for your answer, or
`S` if you cannot judge this one.

> Use `S` freely. A skipped item is excluded from the base rate; a guessed one
> corrupts it. See the arithmetic under **Why raw disagreement is not the label**
> — at 95% accuracy you publish nearly double the true error rate.

**5. The key is revealed.** Now you see the stored answer, whether it matches
yours, and all four explanations. Two things to do here:

- Press `1`–`9` for any flaws you see (table below). Optional but valuable.
- Press `U` if you were **not sure** — including when you agreed. Getting one
  right by luck is not evidence about the item.

**6. Press `Enter` for the next item.** `←` Back re-opens a previous one; your
label is still there and can be changed.

**7. Stop whenever you want.** Click **Save progress** → `apex-label-progress.json`
lands in Downloads. Do this before closing the tab, and any time you would be
annoyed to redo the last stretch.

**8. Resume later.** Reopen `labeler.html`, then:

- Second file box → the `apex-label-progress.json` you saved.
- First file box → `sample.jsonl`.

Either order works. It reopens at the first item you have not labelled and the
counter shows your earlier totals. If browser storage survived, it resumes on its
own when you load the sample — the file is the belt-and-braces copy for a cleared
browser, a different machine, or a different browser.

**9. When all 200 are done**, click **Export labels** → `labeled.jsonl`. Put it in
`docs/research/`, then see **After labelling**.

### Reference

| key | does |
|---|---|
| `A` `B` `C` `D` | your answer (before the key is shown) |
| `S` | can't judge this one — skip |
| `1`–`9` | flaw codes, after the reveal, toggle on/off |
| `U` | you weren't sure |
| `Enter` | next item |

Roughly 2–4 hours for 200 items. It does not have to be one sitting, and the
counter line (`handled · scorable · to adjudicate · unsure · skipped`) tells you
where you are at a glance.

## Labelling protocol

Open `labeler.html` in a browser and load your sample.

**Pass 1 — blind screen.** Answer each item yourself before the stored key is
shown. Seeing the key first makes agreement meaningless; you will talk yourself
into whatever is marked. The tool enforces the order.

Three keys matter:

- `A`–`D` — your answer.
- `S` — **you cannot judge this one.** Use it freely. A skipped item is excluded
  from the base rate; a guessed one corrupts it.
- `U` — after the reveal, **you were not sure.** An item you got right by luck
  is not evidence about the item.

**Pass 2 — adjudication.** Everything you disagreed on, plus everything you
marked unsure, needs a verdict from a source rather than from memory:

1. The CED for that subject — they are already in `public/ced/`.
2. A College Board released exam and its published scoring guidelines.
3. A textbook.

Do **not** adjudicate by asking an LLM. The items were generated by one; asking
another to confirm them is circular, and the failure modes correlate.

Record the verdict and the source. Those verdicts are the dataset's ground
truth; the pass-1 answers are only how you found the candidates.

## Saving and resuming

It is a few hours of work; nothing here assumes you do it in one sitting.

- **Autosave** writes to browser storage after every keystroke. The line under
  the counter shows the last write, and says so loudly if the write *failed*
  (private windows and blocked site data both do this) rather than letting you
  label for three hours believing it is being kept.
- **Save progress** downloads `apex-label-progress.json`. Use it before closing,
  and any time you would be upset to redo the last stretch. Browser storage
  disappears if you clear site data or switch browsers; the file does not.
- **Resuming**: load `apex-label-progress.json` in the second file box, then
  your sample. Either order works. It reopens at the first unlabelled item.
- A progress file saved against a **different sample** is caught and warned
  about rather than silently merged by matching ids.

## Subject coverage

Label only what you can adjudicate. A 150-item dataset across 12 subjects you
know beats 300 across 36 where a third are coin flips — and the narrow one is
publishable, because its limitation is stated rather than hidden.

Restratify with:

```bash
node scripts/export-label-sample.mjs --n 180 \
  --subjects "AP Biology,AP Calculus BC,AP U.S. History,AP English Language and Composition"
```

Unknown subject names fail loudly with the full list rather than silently
producing a smaller sample.

Report coverage in the release: which subjects, how many per subject, and the
skip rate. A reader needs to know the dataset covers the subjects one annotator
could actually judge. That is a normal limitation, honestly stated; a hidden
one is what makes a dataset worthless.

## Flaw codes

Press `1`–`9` after the reveal. Multiple codes per item are fine; press again to
toggle off. The vocabulary is the Item-Writing Flaws taxonomy from the published
literature, so the released dataset lines up against prior work.

| key | code | means |
|---|---|---|
| 1 | `ok` | the item is fine |
| 2 | `key_wrong` | the stored answer is not correct |
| 3 | `multiple_correct` | more than one choice can be argued |
| 4 | `none_correct` | no choice is right |
| 5 | `implausible_distractors` | wrong options are obviously wrong |
| 6 | `unclear_stem` | ambiguous or unanswerable as written |
| 7 | `giveaway` | length or grammar reveals the answer |
| 8 | `off_syllabus` | not AP-level content for this subject |
| 9 | `explanation_wrong` | rationale contradicts the key or is false |

`7 giveaway` is the one the deterministic sweep already measures at 28.1% of the
bank (`docs/research/iwf-deterministic-sweep.md`), so your labels on it are what
tell us whether that detector's precision is real.

## After labelling

Export from the tool (`labeled.jsonl`), then:

1. **Report the base rate**, computed over *adjudicated* items only, with the
   skip rate alongside it. What fraction of banked questions have a wrong key,
   and what fraction have any flaw. That number alone is the finding, and it is
   publishable whether it is 2% or 30% — as long as the denominator is honest.
2. **Build the detector** and measure precision/recall against these labels.
3. **Ablate** against an LLM-judge baseline. The literature says that baseline
   is weak — a dental-education study found GPT-4's ability to detect defective
   items "proved limited, excelling only in identifying duplicates" — so beating
   it is a result rather than a reimplementation.
4. **Gate the bank** on the detector, and re-run the sample to show the base
   rate moved.

## Publishing

```bash
node scripts/build-dataset-release.mjs
```

Reads `labeled.jsonl` and writes `docs/research/release/`:

| file | for |
|---|---|
| `README.md` | Hugging Face dataset card, YAML frontmatter included |
| `ap-item-quality.jsonl` | Hugging Face + GitHub canonical |
| `ap-item-quality.csv` | Kaggle (arrays flattened to `choice_a..d`, flags pipe-joined) |
| `dataset-metadata.json` | Kaggle CLI |
| `kaggle-description.md` | Kaggle description body |

**Every number in the cards is computed from the data**, including the base
rate, the per-subject breakdown and the flaw distribution. A card with a
hand-typed rate is a card that will eventually disagree with its own file. It
also refuses to fold unadjudicated items into the rate and reports them
separately.

All three venues cross-link, with GitHub as canonical because it carries the
labelling tool and the sampler alongside the data.

The questions are model-generated, so there is no copyright issue and **no
student data of any kind** — this dataset is about the items, not about anyone
who answered them. That is exactly why it can ship now while the
student-behaviour dataset cannot.
