# Deep Research: reading and grading handwritten FRQs, with the teacher deciding

*2026-09-19. **Separate project from Apex Scholar** — filed here because this is where
research lives; move it if it gets its own repo.*

## Executive Summary

The Google AI Overview answered the question you asked — which open models read
handwriting — and that is the wrong question for a grading tool. Model choice is
not the binding constraint. The binding constraint is that a VLM asked to
transcribe a student's work will quietly **fix it**, and you then grade the fix.

This is measured, not speculative. On FERMAT, a dataset of 2,244 authentic
handwritten student solutions containing deliberate student errors, over-correction
— the model silently repairing a mistake instead of transcribing it — occurs in
**42–66% of transcriptions across all 15 VLMs tested**. Worse, the effect scales
the wrong way: **stronger models over-correct more**. Qwen2.5-VL-32B sits at 62%,
Qwen2.5-VL-72B at 61%, while the weakest model tested (Llama-3.2-11B) over-corrects
least at 39–42%. Attention analysis shows why: when the model "corrects" a
student's `sin` to `tan`, attention on the handwritten region *drops*. Reasoning
overrides perception.

For an assessment tool this is the worst possible failure mode, because it is
**silently score-inflating and invisible to every standard metric**. BLEU, edit
distance and CER cannot see it — the transcription reads beautifully. The mistake
the student actually made is simply gone.

Two of the Overview's three pieces of "Strategic Implementation Advice" make this
worse rather than better, and its central recommendation (Qwen2.5-VL-7B/72B)
selects on exactly the axis that trades against faithfulness. Meanwhile the
questions that decide whether this ships — how the teacher reviews, what triggers
escalation, and whether you may legally send student work to a third party at all
— go unmentioned.

The good news: a real course-scale deployment exists. UC Irvine ran OCR+LLM
grading across 20 quizzes and ~800 students in handwritten single-variable
calculus, and reports **mean AI−TA gap of −0.40 points (SD 1.12), MAE 0.50–1.06,
and 68–86% of scores within 1 point**. That is a working system. Its design
choices differ from the Overview's advice at almost every point.

## Key Findings

**1. Over-correction is pervasive, systematic, and scales with model strength.**
([arXiv:2604.22774](https://arxiv.org/abs/2604.22774)) 42–66% of transcriptions
across 15 VLMs contain at least one instance of the model overwriting the
student's work. Over-corrections cluster in the *late* stages of a solution —
calculation accuracy and final-value verification — consistent with autoregressive
context accumulation progressively overriding visual evidence. Gemini 2.5 Flash
was the most faithful; GPT-4o was heavily penalised for aggressive over-correction.

**2. Prompting does not fix it.** Same paper, Appendix F. An explicit faithfulness
instruction reduced over-correction by **4 percentage points on average** — and
for the three strongest models it *lowered* overall transcription quality, because
conservative transcription also suppresses correct content. Net effect on their
faithfulness metric: **+0.01**. The authors conclude prompt-level intervention is
insufficient and the problem needs architecture- or training-level work.

> This is the direct refutation of the Overview's advice #1. Priming with
> `"You are an expert AP Biology grader… they are discussing cellular respiration"`
> pushes the model *toward* the behaviour you need to suppress. It raises the
> prior on fluent, topically-correct text, which is precisely what a confused
> student did not write.

**3. VLMs rewrite rather than read whenever text is imperfect.**
([arXiv:2607.21617](https://arxiv.org/abs/2607.21617), FaithC4 — 1,455 documents,
15 systems, three perturbation families) and
([arXiv:2605.27750](https://arxiv.org/abs/2605.27750)) VLM errors **stay fluent
when wrong**, producing plausible substitutions where traditional OCR engines
produce obvious local noise. Fluent errors are far more dangerous in grading: a
garbled token gets noticed, a plausible one gets graded. A related result finds
DeepSeek-OCR's performance "plummets" once linguistic support is removed
([arXiv:2601.03714](https://arxiv.org/abs/2601.03714)) — much of apparent OCR skill
is the language prior doing the work.

**4. A real deployment achieves strong TA alignment — with a pipeline that
contradicts the Overview.** ([arXiv:2603.00895](https://arxiv.org/abs/2603.00895),
UC Irvine, 3,945 handwritten free-response records)

| | result |
|---|---|
| AI − TA score gap | mean −0.40 pts, SD 1.12 |
| MAE per quiz | 0.50–1.06 pts |
| within 1 point | 68–86% |
| OCR acceptable | ~88% across thousands of submissions |
| OCR on a hard subset | GPT-4.1-mini 84% vs Mathpix 55% |
| students rating feedback accurate | **60–61%** |
| students preferring a TA | 52–53% |

Their design decisions, each of which is load-bearing:
- **Region-level OCR, never whole-page** — explicitly "to reduce cross-problem
  interference and hallucination." *The Overview advises the opposite.*
- **A standardised answer sheet** separating each problem's working area from its
  final-answer box. Controlling the input beats improving the model.
- **Dual rubrics — one flexible, one fixed — scored independently, take the max.**
  Lowest MAE of the three options they tried.
- **Three-run self-consistency as the escalation trigger:** if exactly one of three
  runs awards full credit and the other two do not, flag for human review.
- Deployed only on low-stakes quizzes (~10% of grade). They state plainly that
  midterms and finals "would require substantially more conservative
  human-in-the-loop controls."

**5. Bigger is not automatically better, and a 5M-parameter model is in the
conversation.** PP-OCRv5 ([arXiv:2603.24373](https://arxiv.org/abs/2603.24373))
reports performance competitive with billion-parameter VLMs at **5M parameters**,
and names VLMs' "propensity for textual hallucinations" as a reason to prefer a
specialised recogniser. FireRed-OCR ([arXiv:2603.01840](https://arxiv.org/abs/2603.01840))
exists specifically because general VLMs (including Qwen3-VL) suffer "structural
hallucination" on complex documents.

**6. A blended accuracy number hides the errors that matter.** RxScribe Bench
([arXiv:2609.13280](https://arxiv.org/abs/2609.13280)) makes the argument cleanly
for prescriptions: a model that *fabricates* a drug and one that *misreads* a
legible dose carry very different risk, and folding both into one figure is
malpractice. The same decomposition applies here — misreading a word costs a point;
inventing a correct claim the student never wrote costs the validity of the grade.

**7. Even the best current systems sit around 85% on messy real-world forms.**
([arXiv:2604.16504](https://arxiv.org/abs/2604.16504)) 17 frontier and open models
against a hard real medical form: the best Google and OpenAI models reach ~85%
accuracy, weighted F1 ≈ 0.90, and "none of the smaller or older models perform
well." Plan for a 10–15% error floor, not for solving it.

## Detailed Analysis

### What the Overview got right

- VLMs genuinely do beat line-level OCR (TrOCR, Mathpix) on hurried, deformed
  handwriting. UC Irvine measured 84% vs 55% on their hard subset. That part holds.
- Structured JSON output with a confidence field is the right output contract.
- Its throwaway suggestion of a `confidence_notes` field is, unintentionally, the
  most valuable line in the whole exchange — see the triage section below.
- TrOCR really is the wrong tool for full pages.

### Where it is wrong, specifically

| Overview says | Evidence says |
|---|---|
| Prime the model with subject context so it "corrects handwriting ambiguities automatically" | That *is* the failure mode. Faithfulness prompting moved over-correction only 4 points and cost accuracy. |
| Pass the full page to preserve semantic context | UC Irvine does region-level precisely to suppress cross-problem hallucination. |
| Qwen2.5-VL-7B/72B is the top pick | Qwen2.5-VL-32B/72B are among the *worst* over-correctors (61–62%). Fine for note-taking; wrong default for assessment. |
| GGUF quants for laptop deployment | Vision support in llama.cpp-family runtimes has lagged badly behind text. Verify end-to-end on *your* images before committing — do not assume a GGUF repo existing means the vision tower works. |
| "Use the free HF Inference API" | Student work is an education record. See the legal section. |

### The code sample will not run

Checked against the official model card. Four problems:

1. It passes a **PIL `Image` object** inside the message dict. The documented
   interface takes a path, URL, or `data:image;base64,…` string, and requires
   `from qwen_vl_utils import process_vision_info` (`pip install qwen-vl-utils`)
   to turn messages into `image_inputs` before calling the processor.
2. `torch.float16` — the card ships BF16 and recommends `torch_dtype="auto"`.
3. No output trimming. `batch_decode(generated_ids)` echoes the entire prompt back
   with the answer appended; the card slices `out_ids[len(in_ids):]` first.
4. It omits the transformers-from-source install, without which you get
   `KeyError: 'qwen2_5_vl'`.

Small stuff, but it tells you the snippet was assembled rather than run.

### What I would actually build

**Control the paper before you touch the model.** UC Irvine's biggest lever was a
standardised answer sheet with per-problem regions. Fiducial markers at the page
corners, one box per rubric-bearing part. This converts "parse a chaotic page"
into "OCR a known rectangle," and it is the cheapest accuracy gain available.

**Two passes, deliberately adversarial to each other.**
1. *Transcribe* with a model given **no subject context and no reference answer** —
   its only job is to report ink. Starve it of the priors that drive over-correction.
2. *Grade* with a separate call that sees the transcription, the rubric, and the
   reference answer, and never sees the image.

Keeping the reference answer out of pass 1 is the whole point. A transcriber that
knows the right answer will drift toward it.

**Detect over-correction the way the paper does.** Score the transcription against
the rubric, and independently score it again after asking a second model to
transcribe. Where the *grade implied by the transcription is higher than it should
be*, you have an over-correction candidate. The PINK metric formalises this:
penalise any rubric component where the model's score exceeds the score of the
true transcription. You do not need their exact metric, you need the principle —
**flag score inflation, not text difference**.

**Make the teacher's review targeted, or you have saved nothing.** This is the part
that decides whether the product is worth using. If a teacher must read every FRQ
to check the AI, you have added work. The escalation triggers that earn their keep:
- Disagreement between two independent transcription runs on any rubric-bearing span.
- The UC Irvine rule: 3 grading runs, exactly one awarding full credit → review.
- Low self-reported confidence on a specific region (not the page).
- Any item where the grade sits within one rubric point of a boundary.
- Any page where the transcription is *shorter* than expected — silent omission is
  their documented failure mode, and BLEU scores omissions generously.

A geometric-perturbation abstention layer ([arXiv:2603.19790](https://arxiv.org/abs/2603.19790))
is the principled version: probe the same region under controlled transformations
and release only transcriptions with stable output.

**Show the teacher the crop, not the transcript.** The review UI should put the
original ink next to the rubric decision, so verification is a glance rather than a
read. If the teacher is reading your transcription instead of the student's
handwriting, every over-correction passes straight through.

**Measure the right thing.** Not CER. Track (a) rubric-point agreement with the
teacher's final decision, (b) the **inflation rate** — how often the AI grade
exceeds the teacher's — separately from the deflation rate, and (c) the fraction of
items escalated. A tool that is 95% accurate and escalates 60% of papers is useless;
one that is 88% accurate and escalates 12% is valuable. The Overview's framing
optimises (a) alone.

### FERPA is not a footnote

Handwritten student work is an education record. FERPA (34 CFR § 99.31(a)(1))
regulates the *school*, not the vendor, and the mechanism that lets a school share
records with a tool is the **school official exception**, which requires the vendor
to perform a service the school would otherwise do itself, the school to retain
**direct control** over use and maintenance, use limited to the authorised purpose,
and a data processing agreement covering deletion and prohibiting re-disclosure and
secondary use — explicitly including **model training**. For under-13 students,
COPPA's updated rule carries an April 22, 2026 compliance deadline.

This reframes the case for open weights. The Overview sold them on price. The real
argument is that **self-hosting means no disclosure occurs at all** — no DPA
negotiation with a model vendor, no sub-processor list, no "is our data in their
training set" question. That is worth far more to a school district than a free
API, and it is the strongest reason to use an open model here. Correspondingly,
"just use the free Hugging Face Inference API" is the one recommendation in the
Overview I would not act on without a signed agreement.

Not legal advice — run it past whoever handles your district's DPAs.

## Contrarian Views And Risks

- **A faithful transcriber may be a worse product.** The prompt-mitigation result
  cuts both ways: forcing faithfulness cost transcription quality on strong models.
  You may end up choosing between a transcript that is accurate and one that is
  complete. Measure both; do not assume faithfulness is free.
- **The teacher-in-the-loop may not catch anything.** Automation bias is well
  documented, and a teacher shown a fluent, plausible transcription alongside a
  confident grade will mostly click approve. "The teacher has the final say" is a
  design claim that has to be *tested*, not asserted — measure how often teachers
  actually override, and be alarmed if the rate is near zero.
- **60% of students called the feedback accurate.** That is the UC Irvine number
  from 301 respondents, in a deployment the authors consider a success. Set
  expectations accordingly.
- **AP FRQs are harder than calculus quizzes in one specific way.** Calculus has a
  right answer; AP History and Biology rubrics award points for *claims and
  evidence*, where the boundary between "the student said this" and "the model
  inferred this" is much blurrier. The over-correction risk is higher in prose, not
  lower, and there is less published evidence there.
- **College Board's own rules.** Before building around released AP FRQs or secure
  materials, check what their terms permit for uploading student responses and
  reproducing prompts. I did not research this; it is a real gate.
- **A specialised recogniser may beat a VLM on your data.** PP-OCRv5 at 5M
  parameters is competitive on OCR benchmarks and structurally cannot over-correct
  the way a reasoning model does — it has no reasoning to override perception with.
  A hybrid (specialist recogniser for ink, LLM for grading the text) is worth
  benchmarking against the VLM before you assume a VLM is the answer.

## Open Questions

1. What is the over-correction rate on **prose** FRQs rather than math? All the
   quantitative evidence is mathematical. This is the gap your project sits in.
2. Does the transcribe-blind / grade-separately split actually reduce inflation?
   Cheap to test: 50 papers, both pipelines, measure grade inflation against your
   own marking.
3. Can a small specialist recogniser plus an LLM grader match a VLM at lower
   inflation? Untested for handwriting-to-rubric as far as I found.
4. What escalation rate do teachers tolerate before abandoning the tool? Product
   question, no literature, answerable only with teachers.
5. Do teachers actually override? Instrument it from day one.

## Sources

- [arXiv:2604.22774](https://arxiv.org/abs/2604.22774) — *When VLMs 'Fix' Students*. The central finding: 42–66% over-correction across 15 VLMs, stronger models worse, prompting insufficient, attention evidence.
- [arXiv:2603.00895](https://arxiv.org/abs/2603.00895) — UC Irvine, course-scale AI grading of handwritten calculus, ~800 students. The deployment numbers and pipeline design.
- [arXiv:2607.21617](https://arxiv.org/abs/2607.21617) — *Do VLMs Read or Rewrite?* FaithC4 faithfulness benchmark, 15 systems.
- [arXiv:2501.07244](https://arxiv.org/abs/2501.07244) — FERMAT, 2,244 handwritten solutions with deliberate student errors; the dataset the over-correction study runs on.
- [arXiv:2605.27750](https://arxiv.org/abs/2605.27750) — VLM OCR errors remain fluent when wrong; token-level grounding measures.
- [arXiv:2601.03714](https://arxiv.org/abs/2601.03714) — DeepSeek-OCR relies heavily on language priors; performance collapses without them.
- [arXiv:2603.24373](https://arxiv.org/abs/2603.24373) — PP-OCRv5, 5M params competitive with billion-parameter VLMs.
- [arXiv:2603.01840](https://arxiv.org/abs/2603.01840) — FireRed-OCR, specialising Qwen3-VL away from structural hallucination.
- [arXiv:2603.19790](https://arxiv.org/abs/2603.19790) — Geometric Risk Control: abstention layer for VLM OCR via perturbation probes.
- [arXiv:2609.13280](https://arxiv.org/abs/2609.13280) — RxScribe Bench: decompose accuracy by error severity rather than blending.
- [arXiv:2604.16504](https://arxiv.org/abs/2604.16504) — 17 models on hard real-world handwritten forms; ~85% ceiling.
- [arXiv:2506.04822](https://arxiv.org/abs/2506.04822) — 14K handwritten grade-4 answers, Indonesian classrooms; VLM/LLM assessment in the wild.
- [arXiv:2602.00095](https://arxiv.org/abs/2602.00095) — EDU-CIRCUIT-HW: why downstream-task accuracy hides transcription failure.
- [arXiv:2506.20168](https://arxiv.org/abs/2506.20168) — mitigating OCR hallucination under visual degradation.
- [Qwen2.5-VL-7B-Instruct model card](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct) — official usage, used to check the Overview's snippet.
- 34 CFR § 99.31(a)(1) and [studentprivacy.ed.gov](https://studentprivacy.ed.gov/ferpa) — FERPA school official exception, direct control, DPA requirements; COPPA update deadline April 22, 2026.

## Rerun Inputs

```
workflow: firecrawl-deep-research
topic: faithfulness and human-in-the-loop design for VLM transcription and rubric grading of handwritten student FRQs
depth: thorough
output: markdown
```

---

# Addendum, 2026-09-20 — the concrete stack

Advice only; nothing built. Two things to fix first: **the Overview's model list is
a generation stale** (Qwen2.5-VL, Llama-3.2-Vision, InternVL2.5 are 2024–25
models), and **OCR leaderboard rank is the wrong selection criterion here**.
OmniDocBench and the olmOCR benchmark measure parsing of *clean* documents. They
say nothing about whether a model rewrites a student's error, and the
over-correction evidence says the reasoning-heaviest models — the ones that top
those boards — are the riskiest for grading.

So select on three axes the leaderboards don't show: **handwriting support**,
**grounding** (bounding boxes, so the teacher review UI can show the ink instead of
the transcript), and **how little reasoning the model has to override perception
with**.

## Transcription — pick two and A/B them on your own papers

| HF id | size | licence | why it's on the list |
|---|---|---|---|
| `PaddlePaddle/PaddleOCR-VL` | 0.9B | Apache-2.0 | **Default pick.** Explicitly handwriting-capable, 109 languages, ~92.6 OmniDocBench — competitive with models 100× larger. At 0.9B there is barely any language model to override the pixels with, which is exactly the property you want. Runs on almost anything. |
| `rednote-hilab/dots.ocr` | 3B | MIT | **Grounding.** Returns element locations, which is what lets you crop the original ink next to each rubric decision. MIT is the cleanest licence here. Handwriting-capable, 79.1 olmOCR. |
| `nanonets/Nanonets-OCR2-3B` | 3B | — | Explicitly handles **handwriting + checkboxes + flowcharts + LaTeX**, which is the actual shape of a Physics or Bio FRQ page with a sketched diagram. |
| `allenai/olmOCR-2-7B-1025` | 8B | Apache-2.0 | 82.3 on its own benchmark, English-only (fine for AP), built for batch throughput. Emits LaTeX. |
| `datalab-to/chandra` | 9B | Apache-2.0 | Highest olmOCR score of the open set (83.1) with grounding. Use as the "strong" arm of the A/B. |

**Skip:** `ibm-granite/granite-docling-258M` and GOT-OCR 2.0 — both explicitly not
designed for handwriting. `microsoft/trocr-base-handwritten` — line-level only, no
maths coverage, wrong shape for a page. Qwen3-VL-235B / InternVL3-78B — top of
OCRBench, and the exact profile the over-correction study penalises.

**For maths-heavy subjects** (Calc, Physics C, Chem) you need LaTeX out, not
Markdown: Chandra, olmOCR-2 and Nanonets-OCR2 all emit it.

## Grading — a separate model that never sees the image

Any strong open text model. The point is not which one; the point is that it takes
the transcription and the rubric as text and has no pixels to reinterpret. This is
the split that keeps the transcriber from being told the right answer.

## The order I would actually do this in

1. **Build the eval set before touching a model.** 50 real FRQ pages you have
   already marked, transcribed by hand. Without this every model comparison is
   vibes, and the public benchmarks will not transfer — IAM (what the handwriting
   leaderboards use) is clean, single-line, and nothing like a rushed AP page.
2. **Fix the paper.** Fiducial markers at the corners, one box per rubric-bearing
   part. Region-level input was the single biggest lever in the UC Irvine
   deployment, and it costs a print template rather than a GPU.
3. **Measure two numbers per model, not one**: ordinary transcription accuracy,
   and separately the **inflation rate** — how often the rubric score computed from
   the transcription exceeds the score you gave the real page. The second is the
   one that decides this, and no leaderboard reports it.
4. **Then** pick the model, on your own numbers.
5. Wire the teacher review UI around the crops, with the escalation triggers from
   the main report.

Step 3 is the whole thing. If you do nothing else from this document, measure
inflation separately from accuracy.

## One benchmark worth watching

CodeSOTA keeps a handwriting-specific page measuring CER on IAM across frontier
and open models. Useful for a sanity ordering, useless as a decision input for this
project — IAM is neat cursive prose, not a student who has eleven minutes left.
