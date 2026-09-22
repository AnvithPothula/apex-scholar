# Deep Research: what a deterministic sweep can honestly catch in LLM-generated MCQs

*2026-09-14. Scope: the 3,560 questions in Apex Scholar's `questionBank`, none of
which has ever been checked for correctness.*

## Executive Summary

The literature's most useful result for this problem is counterintuitive: on the
standard Item-Writing Flaws rubric, a **rule-based detector beats GPT-4**. Moore
et al. built both and scored them against human raters on 200 MCQs; the rules
matched 90.9% of human labels against GPT-4's 78.9%, with Hamming loss 0.09
against 0.21. GPT-4's failure was systematic — it conflated adjacent criteria and
tagged "gratuitous information", "unfocused stem" and "vague terms" together off
a single perceived flaw. Rules do not do that, because each criterion is coded
separately. So running rules first is not a compromise on the way to a model; for
this rubric it is the better instrument.

That result has a hard boundary. Per-flaw F1 for the rule-based method ranged
from ~1.00 down to **0.00 in all four domains** for `logical cues`, `word
repeats` and `vague terms`. Those are not weak detectors, they are non-detectors.
The honest deterministic set is the structural half of the rubric: what is
literally in the strings — length, duplication, ordering, and fixed phrases like
"all of the above". Everything about whether an item is *correct*, whether its
distractors are *plausible*, or whether its language is *ambiguous* stays with a
model or a human.

The luck of this particular problem is that the boundary falls in a useful place.
Schmucker & Moore regressed all 19 criteria against IRT parameters for 7,126 MCQs
answered by 448,000 students. The three flaws most damaging to both item
discrimination and difficulty were `more than one correct`, `longest option
correct` and `all of the above` — and two of those three are pure string checks.
Running the sweep on the full Apex Scholar bank found the second one in **1,001
of 3,560 items (28.1%)**: a student who simply picks the longest option beats
chance on more than a quarter of the bank.

## Key Findings

**1. Rules beat GPT-4 at applying the IWF rubric, and the headline accuracy is
inflated.** ([arXiv:2307.08161](https://arxiv.org/abs/2307.08161)) The 90.87%
figure is over a 19-label multilabel task where most labels are negative, so true
negatives carry it. The honest number is micro-averaged F1: **0.30 / 0.48 / 0.56 /
0.70** across their four domains for the rules, against 0.25 / 0.28 / 0.30 / 0.36
for GPT-4. Rules win everywhere, and both are mediocre in absolute terms.

**2. Three flaws do most of the measurable damage, and two are string checks.**
([arXiv:2503.10533](https://arxiv.org/abs/2503.10533)) Against IRT parameters from
448,000 students: `more than one correct` (γ=−0.317, β=−0.715), `longest option
correct` (γ=−0.216, β=−0.437), `all of the above` (γ=−0.101, β=−0.364). The first
needs a model. The second and third do not.

**3. Per-flaw, the deterministic ceiling is sharp.** From the same paper's
per-domain F1 table, rule-based:

| flaw | F1 across 4 domains | verdict |
|---|---|---|
| none of the above | 0.80 / 1.00 / 1.00 / 1.00 | deterministic |
| longest option correct | 0.80 / 1.00 / 1.00 / 0.95 | deterministic |
| fill-in-the-blank | 1.00 / 0.86 / — / 1.00 | deterministic |
| true/false options | 0.80 / 0.59 / 1.00 / 1.00 | deterministic |
| negative wording | — / 0.64 / 0.80 / 0.92 | deterministic |
| complex / K-type | 0.00 / 0.53 / 0.80 / 1.00 | unstable |
| grammatical cues | 0.00 / 0.65 / 0.44 / 0.76 | unstable |
| absolute terms | 0.00 / 0.40 / 0.00 / 0.71 | unstable |
| all of the above | 0.00 / 0.00 / 0.00 / 0.67 | keyword-brittle |
| **logical cues** | **0.00 / 0.00 / 0.00 / 0.00** | not detectable by rule |
| **word repeats** | **— / 0.00 / — / 0.00** | not detectable by rule |
| **vague terms** | **— / 0.00 / — / 0.00** | not detectable by rule |
| more than one correct | 0.00 / 0.00 / 0.00 / 0.43 | needs a model (they used GPT-4) |

**4. "Two or more flaws" is the field's standard threshold for unacceptable.**
Tarrant et al. (2006), used as the cut by both BenchMarker and the IRT paper. It
gives a defensible quarantine line that isn't invented.

**5. Automatically-generated MCQ sets are measurably worse than educator-written
ones.** ([arXiv:2602.06221](https://arxiv.org/abs/2602.06221)) BenchMarker audited
12 MCQA benchmarks: every HellaSwag item violates ~44% of the 19 rules, and 7 of
12 datasets have over 90% of items breaking 2+ rules. Items from student exams
score visibly better than crowdsourced or model-generated ones. Apex Scholar's
bank is model-generated, which is the bad half of that split — the finding below
that it is *not* in HellaSwag territory is therefore worth something.

**6. Asking an LLM to fix flawed items introduces new flaws in most cases.** Same
paper: prompting GPT-5.2, Claude Sonnet and Qwen-235B to repair TruthfulQA's
writing errors cut the 2+-error rate from 0.97 to ~0.65, but **56–68% of repaired
items acquired a new error**, and only ~26–32% came out flawless. Regeneration is
not a free fix.

**7. Results on the actual bank (all 3,560 items, 36 subjects):**

| flaw | count | rate | 95% CI | action |
|---|---|---|---|---|
| longest_option_correct | 1001 | 28.1% | 26.7–29.6% | revise |
| absolute_terms | 165 | 4.6% | 4.0–5.4% | advisory |
| duplicate_explanations | 117 | 3.3% | 2.7–3.9% | revise |
| unordered_numeric_options | 55 | 1.5% | 1.2–2.0% | revise |
| k_type | 18 | 0.5% | 0.3–0.8% | revise |
| all_of_the_above | 6 | 0.2% | 0.1–0.4% | revise |
| negative_stem | 5 | 0.1% | 0.1–0.3% | revise |
| duplicate_choices | 1 | 0.03% | 0.0–0.2% | quarantine |
| none_of_the_above | 1 | 0.03% | 0.0–0.2% | revise |

35.3% of items carry at least one flaw; **1.0% breach Tarrant's 2+ threshold**;
mean 0.38 flaws per item against the 1.48 Schmucker & Moore measured across 7,126
school MCQs. On the structural rubric the bank is in better shape than the
published baseline. The single dominant problem is the length cue.

## Detailed Analysis

### The length cue is the finding

1,001 items key the longest option, at a median 1.54× the mean distractor length
and up to 3.15×. These are not marginal:

> Which of the following is true regarding the Central Limit Theorem?
> A. (83 chars) It states that the population distribution becomes normal…
> **B. (114) It states that the sampling distribution of the sample mean becomes approximately normal…**
> C. (64) It requires the population to be normal…
> D. (38) It only applies to small sample sizes.

A student who has never studied statistics gets this right by counting
characters. The mechanism is not mysterious: an LLM asked for one correct answer
and three wrong ones writes the correct one carefully and fully qualified, then
writes the distractors as short negations. It will do this every time unless the
generation prompt constrains choice length, which is the actual fix — regenerating
1,001 items without changing the prompt reproduces the cue.

### What the explanations can and cannot tell you

Each banked item carries a per-choice explanation, which the IWF literature does
not have and which looked like a free deterministic proxy for `more than one
correct` — the single most damaging flaw. It is not. Measured on 200 items: a
regex for self-directed incorrectness markers fired on the keyed choice's own
explanation 8 times, and **all 8 were false positives**, because the subject
matter is about errors:

> "A Type II error occurs when the null hypothesis is false, but we do not have
> enough evidence to reject it." — a correct explanation containing "error" and
> "do not".

142 of 200 items had all four explanations free of any such marker. The
explanations are free-form prose that never labels itself, so there is no
template to exploit. This idea is dead; verifying the key needs a model.

What *does* survive is exact duplication: 117 items (3.3%) give two choices the
same rationale. Reading all 11 hits in the 200-item sample, ~7 are boilerplate
("Calculated incorrectly." three times, "Incorrect Z-score calculation." three
times) and ~4 are a legitimately shared reason that rules out two distractors at
once ("f'(x) > 0 means it cannot be decreasing"), which is correct pedagogy. So
~64% actionable, and what it really measures is *a student who picks this
distractor is told nothing*, not *this item is broken*. That is a real product
defect — wrong-answer feedback is the whole point of storing explanations — but it
is a rewrite, not a removal.

### Two normaliser bugs, both found by reading the hits

The first version of the detector reported **21 duplicate-choice items (10.5%)**
in the sample. Every one inspected was a false positive, from stripping
non-alphanumeric characters: `2` collapsed with `-2`, `(sqrt(6)+sqrt(2))/4` with
`(sqrt(6)−sqrt(2))/4`, `as x → ∞` with `as x → −∞`.

Fixing that left 4 hits on the full bank. Three were still false positives, from
lowercasing: `ii` vs `II` (minor vs major Roman numerals in Music Theory), `r` vs
`R` (distance vs wire radius in Physics C). One was real:

> String s = "computer"; … A. comter  B. comuter  C. comper  **D. comter**

Case and sign are semantic in a maths-and-science corpus. This is the same
failure Moore et al. reported when their rule-based method did worse on Chemistry
and Biochemistry than on Statistics — domain jargon defeats generic text
normalisation. A detector that is never eyeballed against its own hits will
report a confident 10.5% that is entirely artefact.

### Why `absolute_terms` is advisory and not a finding

Tarrant's rule is "no absolute terms *unless the statement is truly absolute*",
and in this bank the exception is the common case: "all real numbers", "always
increasing", "never negative" are correct answers. The published rule-based F1
(0.00 / 0.40 / 0.00 / 0.71) reflects exactly this. It is counted and reported, and
it is barred from contributing to the 2+ threshold, because letting a detector the
literature scores at 0.00 push items over an "unacceptable" line would launder
noise into something that reads like a result.

## Contrarian Views And Risks

- **The structural rubric measures the wrong thing for maths.** Schmucker & Moore
  found no significant IWF–discrimination correlation in Math at all, and in Math
  only `lost sequence` reached significance for difficulty. Their explanation:
  mathematical difficulty comes from conceptual and procedural complexity, which a
  rubric about textual structure is not designed to see. Half this bank is
  quantitative. A clean structural score there says very little.
- **IWF features predict low difficulty, not low discrimination.** Best F1 0.649
  for flagging low-difficulty items, but 0.25–0.44 for low-discrimination ones,
  and *no model beat the majority-class baseline* for high difficulty. The sweep
  is a filter for giveaway items, not a general quality score.
- **Zero fatal flaws is not a clean bill of health.** The sweep cannot see a wrong
  answer key, an implausible distractor, an ambiguous stem, or a factual error.
  "35.3% flagged, 1.0% unacceptable" is a statement about item *construction*
  only. The bank's correctness remains unmeasured.
- **"Choices-only solvable" overstates shortcut prevalence.** BenchMarker found
  that after checking *why* a model succeeds without the question, TruthfulQA's
  shortcut rate fell from 83% to 6%. If a partial-input probe is added later, it
  needs that second step or it will manufacture a crisis.
- **Regeneration may be worse than leaving items alone.** 56–68% of LLM-repaired
  items acquired a new error. Fixing the 1,001 length-cue items by re-prompting is
  likely to trade a known flaw for unknown ones unless the generator prompt is
  constrained and the output re-swept.

## Open Questions

1. How many of the 3,560 items have an outright **wrong answer key**? Nothing here
   touches it, and it is the question that actually matters. This is what the
   200-item human labelling set is for.
2. Does the length cue actually help *students*, or only correlate? The IRT
   evidence is from a different population; Apex Scholar has 1,432 responses from
   7 students, which cannot answer it.
3. Would constraining choice length in the seeder prompt remove the cue without
   degrading distractor quality? Testable cheaply on one subject.
4. `duplicate_explanations` at 3.3% is measured, but its precision (~64%) comes
   from 11 hand-read hits. A larger read would tighten that.
5. Do the flagged-item rates differ between the two generator models in the
   chain? Every sampled item came from `gemini-3.1-flash-lite`, so the comparison
   is not yet possible.

## Sources

- [arXiv:2307.08161](https://arxiv.org/abs/2307.08161) — Moore et al., *Assessing the Quality of MCQs Using GPT-4 and Rule-Based Methods*. The core result: rules beat GPT-4 on the IWF rubric; per-flaw F1 table; the 19 programmatically implemented criteria.
- [arXiv:2503.10533](https://arxiv.org/abs/2503.10533) — Schmucker & Moore, *The Impact of Item-Writing Flaws on Difficulty and Discrimination in IRT*. 7,126 MCQs, 448,000 students; per-flaw IRT coefficients; screening precision/recall.
- [arXiv:2602.06221](https://arxiv.org/abs/2602.06221) — *BenchMarker*. The Tarrant et al. 19-rule rubric in full with example violations; the 2+-rule "unacceptable" cut; evidence that LLM repair introduces new errors.
- [arXiv:2405.20529](https://arxiv.org/abs/2405.20529) — *SAQUET*, the IWF toolkit used to annotate the 7,126-item corpus above.
- Tarrant, Ware & Mohammed (2006) — origin of the 19-criterion rubric and the 2+-flaw threshold (via BenchMarker and Schmucker & Moore).
- Haladyna & Downing (1989) — the 31-item taxonomy the 19-rule rubric trims; BenchMarker notes it was trimmed to drop subjective rules such as "avoid trivial material".
- [PMID:20483716](https://pubmed.ncbi.nlm.nih.gov/20483716/) — a web application detecting five contraindicated MCQ practices, validated on ~800 CME items; reports automatic detection of 60% of formal didactic errors. A second, independent datapoint that rule-based detection plateaus well short of complete.
- [arXiv:2601.14280](https://arxiv.org/abs/2601.14280) — *Hallucination-Free Automatic Question & Answer Generation*; taxonomy of LLM MCQ hallucinations (reasoning inconsistencies, insolvability, factual errors, mathematical errors) and a rule-based + LLM detection-agent split.

## Rerun Inputs

```
workflow: firecrawl-deep-research
topic: deterministic vs model-based detection of item-writing flaws in LLM-generated MCQs
depth: thorough
output: markdown
```

Reproduce the measurements:

```bash
node scripts/sweep-item-flaws.mjs --firestore --out docs/research/bank
```
