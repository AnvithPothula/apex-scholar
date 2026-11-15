# AI model capability for AP exam tutoring and grading (snapshot: 7 November 2026)

Evidence labels used throughout: **[IND]** independent evaluator; **[VENDOR]** lab or commercial party with an interest in the result; **[WEAK]** blog or aggregator of unclear method. Arena and LiveBench values were pulled by a page-extraction query, so check them on the live pages before quoting exact ranks.

## Which model versions are current as of November 2026, and how do they rank overall?

### Takeaway
The field has moved well past the versions named in older comparisons: GPT-6 Luna and Claude Haiku 5.5 are now the cheap proprietary tier ($0.10/$0.50 per 1M tokens), and Gemini 3.8 Flash is the strongest cheap-tier all-rounder on task-relevant scores. Apex's cheapest tiers (Flash-Lite, Gemma) are the weak link, and Flash-Lite now costs more per token than models that outscore it.

### Cited Findings
Newest versions per family, confirmed against the Artificial Analysis (AA) table of 282 models, index v5.0.1, read 7 Nov 2026:

| Family | Newest found | Released | List $/1M in/out | Licence | Source |
|---|---|---|---|---|---|
| Gemini Flash | Gemini 3.8 Flash | 2026-09-02 | 0.75 / 3.75 | proprietary | [AA](https://artificialanalysis.ai/models/gemini-3-8-flash) |
| Gemini Flash-Lite | Gemini 3.5 Flash-Lite | 2026-07-21 | 0.30 / 2.50 | proprietary | [AA](https://artificialanalysis.ai/models/gemini-3-5-flash-lite) |
| Gemma | Gemma 4 31B, 26B A4B, 12B, E4B, E2B | 2026-04-02 | 0 first-party (31B) | Apache 2.0 | [AA](https://artificialanalysis.ai/models/gemma-4-31b) |
| GPT mini tier | GPT-6 Luna | 2026-09-22 | 0.10 / 0.50 | proprietary | [AA](https://artificialanalysis.ai/models/gpt-6-luna) |
| GPT mid tier | GPT-6.1 Terra | 2026-10-26 | 1 / 5 | proprietary | [AA](https://artificialanalysis.ai/models/gpt-6-1-terra-high) |
| Claude Haiku | Claude Haiku 5.5 | 2026-10-07 | 0.10 / 0.50 | proprietary | [AA](https://artificialanalysis.ai/models/claude-haiku-5-5) |
| Qwen | Qwen3.8 27B; Flash-Next; Max (0902); 2.4T-A95B | 2026-08-14 (27B), 08-26 (Flash-Next) | 0.50/3; 0.15/0.47; 2/6 | Apache 2.0 (27B); community (Flash-Next) | [27B](https://artificialanalysis.ai/models/qwen3-8-27b), [Flash-Next](https://artificialanalysis.ai/models/qwen3-8-flash-next) |
| DeepSeek | V4.1 Flash 1017; V4 Pro 0813 | 2026-10-17 | 0.30 / 1.20 per AA | MIT | [AA](https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017) |
| GLM | GLM-5.3; GLM-5.3-Flash | 2026-08-26 (Flash) | 1.40/4.40; 0.15/0.50 | custom; MIT (Flash) | [AA](https://artificialanalysis.ai/models/glm-5-3-flash) |
| Kimi | Kimi K3.1 Pro | 2026-10-23 | 2 / 10 | custom | [AA](https://artificialanalysis.ai/models/kimi-k3-1-pro) |
| MiniMax | MiniMax-M3.1-Flash | 2026-10-19 | 0.15 / 0.60 | community | [AA](https://artificialanalysis.ai/models/minimax-m3-1-flash) |
| Mistral | Large 4; Small 4 | 2026-03-16 (Small 4) | 0.70/2.10; 0.15/0.60 | Apache 2.0 (Small 4) | [Small 4](https://artificialanalysis.ai/models/mistral-small-4) |
| Llama / Meta open | Llama 4 Maverick is the newest Llama listed; Meta's newer open line is Muse Spark Open | 2025-04-05; 2026-10-15 | 0.25/0.92; 1.25/4.25 | community; Muse licence | [Maverick](https://artificialanalysis.ai/models/llama-4-maverick), [Muse](https://artificialanalysis.ai/models/muse-spark-open) |
| Phi | Phi-4 family is the newest listed | 2025-02-26 | 0.08 / 0.32 (multimodal) | MIT | [AA](https://artificialanalysis.ai/models/phi-4-multimodal) |
| gpt-oss | gpt-oss-120b, 20b (no vision) | 2025-08-05 | 0.15 / 0.60 (120b) | Apache 2.0 | [AA](https://artificialanalysis.ai/models/gpt-oss-120b) |

- Off-brief candidate worth noting: Xiaomi MiMo-V2.6-Flash (MIT) scores 26.7 on the index at $0.14/$0.28, and MiMo-V2.6-Pro 29.9 at $0.435/$0.87 — [AA leaderboard](https://artificialanalysis.ai/leaderboards/models).
- Kimi K3.1 Pro weights were published on 2 Nov 2026 per a [Fello AI roundup](https://felloai.com/best-chinese-ai-models/) [WEAK]; AA lists a Hugging Face weights link. An October [Plotly post](https://plotly.com/blog/open-models-vs-closed-models-2026/) said the K3.1 and M3.1 Flash weights were not yet out, which AA's weight links now contradict for both.
- DeepSeek V4.1 Pro is announced but unreleased, per [Yotta Labs](https://www.yottalabs.ai/post/best-chinese-llm-models-2026-deepseek-qwen-glm-kimi-compared) [WEAK].
- DeepSeek pricing conflicts: AA lists $0.30/$1.20, while [Yotta Labs](https://www.yottalabs.ai/post/best-chinese-llm-models-2026-deepseek-qwen-glm-kimi-compared) reports $0.15/$0.60 off-peak and double at peak, which would reconcile them.
- The AA index was rebased to v5 on 27 Oct 2026, so GLM-5.3 moved from 44.8 on v4.3.2 to 32 on v5, per [GEO Toolbox](https://geotoolbox.ai/blog/best-open-source-llms) [WEAK]. Do not mix numbers across versions.
- AA v5's components are agent- and work-heavy: Briefcase, AutomationBench, TerminalBench 4.0, FrontierCode 2.0, Omniscience, GDP-PDF, HLE Diamond, CritPt v2 hard, Terminal-Bench Science, as listed in [the Gemini 3.8 Flash record](https://artificialanalysis.ai/models/gemini-3-8-flash).
- Effort level moves scores a lot on cheap models: GPT-6 Luna scores 9 (low), 18 (medium), 21 (high), 23 (xhigh), 27.9 (max) and Claude Haiku 5.5 scores 18, 24, 29, 34, 36.5 for the same steps — [AA leaderboard](https://artificialanalysis.ai/leaderboards/models).
- Apex's repo references `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-3.5/3.6/3.7/3.8-flash`, `gemma-4-31b-it` and `gemma-4-26b-a4b-it`, among others (local `git grep`, 7 Nov 2026; active routing was not traced).

### Inferences
- **Overall fitness ranking for Apex** (my judgement from all sections below, not a published ranking):
  1. **Gemini 3.8 Flash (high)**: best combined science, vision, maths-preference and schema evidence. Weakness: a 55% Omniscience hallucination rate, and 7.5x Luna's input price.
  2. **GPT-6.1 Terra (high)**: strongest factual reliability among affordable models, good vision. Pricier, GPQA unreported.
  3. **Claude Haiku 5.5 (high to max)**: cheapest model with low hallucination, and the strongest family evidence on grading and child safety. Vision is unproven.
  4. **GPT-6 Luna (max)**: cheapest proven vision. Poor factual calibration, so use it for reading work, not history.
  5. **GLM-5.3-Flash**: best cheap open-weight on maths. PRC censorship disqualifies it for government and history.
  6. **Qwen3.8-Flash-Next**: high GPQA and decent vision. Same PRC issue, and one first-party host on AA.
  7. **DeepSeek V4.1 Flash**: strong reasoning. No first-party schema enforcement, documented censorship.
  8. **Muse Spark Open**: the only strong US-origin open-weight, low hallucination, but $1.25/$4.25.
  9. **Kimi K3.1 Pro**: strong, but $2/$10 and PRC-origin, so Terra dominates it for this use.
  10. **Gemini 3.5 Flash-Lite**: fine for low-stakes flashcards only.
  11. **Gemma 4 31B**: free floor, not safe for factual claims without grounding.
  12. **Below the bar**: MiniMax M3.1 Flash (94% hallucination), gpt-oss-120b (no vision, 2024 cutoff), Mistral Small 4, Gemma 4 26B, Llama 4 Maverick, Phi-4.
- The headline AA index is a poor proxy for AP work because it rewards long agentic runs; use its component scores instead.
- "Cheap" tiers only reach their scores at high effort, so a Luna or Haiku call at default or low effort should not be assumed to match the table below.

### Gaps
- Successor rumours (Qwen 4, DeepSeek V4.1 Pro) rest on weak secondary sources.
- I did not verify the free-tier quotas of any provider; only AA's $0 first-party list price for Gemma 4 31B was seen.

## How do the candidates score on independent benchmarks relevant to AP maths and science?

### Takeaway
Competition-maths solving is largely saturated even in cheap tiers, so raw maths ability no longer separates candidates; science reasoning, hard-problem scores and factual calibration do. Flash-Lite and Gemma fall clearly behind on those.

### Cited Findings
AA component scores [IND], read 7 Nov 2026 via each model's page. A blank means AA has not reported it. Rows are at the effort level AA's record returned.

| Model (effort) | GPQA | HLE | CritPt | MMMU-Pro (vision) | Omniscience score | accuracy | hallucination rate | AA index v5 |
|---|---|---|---|---|---|---|---|---|
| [Gemini 3.8 Flash (high)](https://artificialanalysis.ai/models/gemini-3-8-flash) | .953 | .478 | .183 | .856 | 23.3 | .505 | .551 | 30.8 |
| [GPT-6.1 Terra (high)](https://artificialanalysis.ai/models/gpt-6-1-terra-high) | | .433 | .257 | .838 | 27.8 | .473 | .370 | 42.4 |
| [Kimi K3.1 Pro (max)](https://artificialanalysis.ai/models/kimi-k3-1-pro) | | .525 | .246 | .839 | 29.9 | .489 | .373 | 46.5 |
| [Claude Haiku 5.5 (max)](https://artificialanalysis.ai/models/claude-haiku-5-5) | | .444 | .189 | | 12.3 | .347 | .342 | 36.5 |
| [DeepSeek V4.1 Flash 1017 (max)](https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017) | | .433 | .240 | .806 | 0.9 | .396 | .641 | 32.6 |
| [MiniMax-M3.1-Flash (max)](https://artificialanalysis.ai/models/minimax-m3-1-flash) | | .480 | .223 | .791 | -6.4 | .451 | .937 | 29.1 |
| [GPT-6 Luna (max)](https://artificialanalysis.ai/models/gpt-6-luna) | | .385 | .194 | .797 | -8.3 | .396 | .793 | 27.9 |
| [GLM-5.3-Flash (max)](https://artificialanalysis.ai/models/glm-5-3-flash) | .912 | .399 | .154 | | 0.7 | .282 | .383 | 27.8 |
| [Qwen3.8-Flash-Next](https://artificialanalysis.ai/models/qwen3-8-flash-next) | .923 | .380 | .111 | .798 | -12.2 | .235 | .468 | |
| [Qwen3.8 27B (xhigh)](https://artificialanalysis.ai/models/qwen3-8-27b) | .905 | .339 | .054 | .763 | -6.4 | .173 | .286 | 20.1 |
| [Muse Spark Open (xhigh)](https://artificialanalysis.ai/models/muse-spark-open) | .890 | .439 | .149 | .809 | 25.8 | .420 | .280 | 24.9 |
| **[Gemini 3.5 Flash-Lite (high)](https://artificialanalysis.ai/models/gemini-3-5-flash-lite)** | .838 | .188 | 0 | .790 | 6.9 | .265 | .267 | 11.7 |
| **[Gemma 4 31B](https://artificialanalysis.ai/models/gemma-4-31b)** | .857 | .236 | .014 | .734 | -48.5 | .199 | .855 | 4.4 |
| [Gemma 4 26B A4B](https://artificialanalysis.ai/models/gemma-4-26b-a4b) | .792 | .193 | 0 | .692 | | | | |
| [gpt-oss-120b (high)](https://artificialanalysis.ai/models/gpt-oss-120b) | .782 | .196 | .011 | no vision | | | | |
| [Mistral Small 4](https://artificialanalysis.ai/models/mistral-small-4) | .769 | .099 | .003 | .568 | -31.0 | .214 | .666 | 4.3 |
| [Llama 4 Maverick](https://artificialanalysis.ai/models/llama-4-maverick) | .671 | .049 | 0 | .621 | | | | |
| [Phi-4 Multimodal](https://artificialanalysis.ai/models/phi-4-multimodal) | .315 | .050 | | .145 | | | | |

- AIME: AA reports AIME 2025 for older models only, for example gpt-oss-120b at .934 and Llama 4 Maverick at .193 ([gpt-oss](https://artificialanalysis.ai/models/gpt-oss-120b), [Maverick](https://artificialanalysis.ai/models/llama-4-maverick)); it is null for all the 2026 models read here.
- CAISI's April 2026 evaluation [IND] gives direct maths and science scores for a mini-tier model: OTIS-AIME-2025 GPT-5.4 mini 90%, DeepSeek V4 Pro 97%, GPT-5.5 100%; PUMaC 2024 93/96/96%; SMT 2025 92/96/99%; GPQA-Diamond 87/90/96%; FrontierScience 74/74/79% — [NIST CAISI](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro).
- CAISI found DeepSeek V4 matched GPT-5.4 on DeepSeek's own reported benchmarks but only GPT-5 on CAISI's suite, including held-out tests such as ARC-AGI-2 and PortBench, putting it about 8 months behind the frontier — [NIST CAISI](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro).
- Arena Math leaderboard [IND, human preference votes], updated 6 Nov 2026: Gemini 4 Argon 1535; Gemini 3.8 Flash high 1517±12 (rank 5, preliminary); Qwen3.8-Max 1505±14 (9); GLM-5.3-Flash 1504±12 (11); Gemini 3.6 Flash high 1503 (13); Kimi K3 max 1502 (17); Gemini 3.5 Flash high 1497 (20); DeepSeek V4.1 Flash 20260910 max 1497±21 (21) — [Arena Math](https://arena.ai/leaderboard/chat/text/math). Luna, Haiku and Flash-Lite are not in its top 25.
- LiveBench 2.0 [IND] is now a long-horizon real-work benchmark; its reasoning scores read: Gemini 3.8 Flash 89.3, DeepSeek V4.1 Flash 1017 89.1, Qwen3.8 Max 88.2, MiniMax M3.1 Flash 82.9, Claude Haiku 5.5 82.4, Qwen3.8 27B 80.0, GLM-5.3 Flash 77.6, Gemma 4 31B 68.3 — [LiveBench](https://livebench.ai/).

### Inferences
- GPQA separates Gemini 3.8 Flash (.953) from Flash-Lite (.838) and Gemma (.857). That is a large gap in graduate-level science, relevant to AP Chemistry, Physics and Biology item keys.
- Flash-Lite's CritPt of 0 and Gemma's .014 suggest they fail hard multi-step physics reasoning, even though GPQA makes them look adequate.
- Low hallucination with low accuracy means abstaining, not knowing: Flash-Lite's .267 rate comes with .265 accuracy. The composite Omniscience score is the better read. I did not read AA's exact definition of the hallucination-rate field, so treat its interpretation as provisional.
- The Omniscience scores matter for history and government tutoring: Gemma 4 31B at -48.5 is the worst in this table, and it is Apex's overflow tier.

### Gaps
- No independent HiddenMath or MATH-level (Hendrycks) scores were found for November 2026 models; these benchmarks have largely dropped off public leaderboards. Vendor model cards were not read for them, as they would only give vendor claims.
- GPQA is unreported for Luna, Terra, Haiku 5.5, DeepSeek V4.1 Flash, Kimi K3.1 and MiniMax M3.1 Flash.
- Vals AI and Epoch AI were not checked in this pass.

## Which models are good at reading handwritten maths and science work from a phone photo?

### Takeaway
No public benchmark tests current cheap models on student handwriting, so this is the thinnest evidence area. The best direct study shows cheap vision models reaching 89 to 99% rubric-item accuracy, with transcription (not grading logic) causing most errors, and a pricier model doing worse.

### Cited Findings
- Levine 2026 [IND, preprint]: 600 photographed submissions from two university STEM courses, 5 problems. Rubric-item accuracy per question: GPT-5-mini 95/98/97/89/92%; GPT-5.1 87/95/94/88/88%; Gemini-3-flash 96/99/99/89/93% — [arXiv 2605.19043](https://arxiv.org/html/2605.19043v1).
- In the same study, most errors were transcription failures (87% in the best model), caused by blur, low resolution, rotated text and missing work; suggested mitigations are a pre-submit image check and showing the student a preview transcription — [arXiv 2605.19043](https://arxiv.org/html/2605.19043v1).
- MMMU-Pro [IND, printed diagrams and images, not handwriting]: Gemini 3.8 Flash .856, Kimi K3.1 .839, GPT-6.1 Terra .838, Muse Spark Open .809, DeepSeek V4.1 Flash .806, Qwen3.8-Flash-Next .798, GPT-6 Luna .797, MiniMax M3.1 Flash .791, Gemini 3.5 Flash-Lite .790, Qwen3.8 27B .763, Gemma 4 31B .734, Llama 4 Maverick .621, Mistral Small 4 .568, Phi-4 Multimodal .145; null for Haiku 5.5 and GLM-5.3-Flash — AA pages linked in the previous section.
- Vision Arena [IND, human votes on image tasks, not handwriting], updated 6 Nov 2026: Qwen3.8-Max rank 2, Gemini 3.7 Flash high 7, Gemini 3.8 Flash high 11. Best-placed entry per family: GLM 36, Flash-Lite 38, Gemma 39, Kimi 40, DeepSeek 41, Luna 49, Haiku 128 — [Vision Arena](https://arena.ai/leaderboard/chat/vision). Which Haiku version holds rank 128 was not established.
- VEHME, EMNLP 2025 [IND, older models]: error detection on the FERMAT handwritten-maths benchmark: Gemini-2.5-Flash-Preview 80.1%, GPT-4o-mini 81.8%, Gemini-2.0-Flash 75.2%, GPT-4o 66.6%, Qwen2.5-VL-7B 44.8%; error localisation 63.4%, 47.2%, 64.2%, 55.0%, 24.3%. Llama-3.2-11B-Vision scored about 19% on the appendix's AIHub level breakdown — [arXiv 2510.22798](https://arxiv.org/html/2510.22798v1). The authors report that OCR of handwriting remained a failure source across models.
- Stanford SCALE-listed study [IND]: 18 LLMs on 639 handwritten student responses diagnosing cognitive skills all scored F1 below 0.5, and models tended to hallucinate evidence from vague work — [SCALE](https://scale.stanford.edu/ai/repository/benchmarking-large-language-models-diagnosing-students-cognitive-skills-handwritten).
- Crosilla et al. 2025 [IND, older models]: on modern handwriting LLMs beat Transkribus at under 5% CER (GPT-4o-mini 1.71% on IAM). Accuracy falls off sharply beyond English and modern hands, and open-source models got worse rather than better when asked to self-correct — [Journal of Documentation](https://www.sciencedirect.com/org/science/article/pii/S0022041825000323).
- AIMultiple cursive benchmark [semi-independent, 100 samples, data dated Nov 2025]: Gemini 3 Pro Preview 100%, DeepSeek OCR 79%; GPT-5 and olmOCR-2 also in the top group. Text, not maths — [AIMultiple](https://aimultiple.com/handwriting-recognition).
- Businessware form benchmark [VENDOR, 2025]: GPT-5 Mini best, with Gemini 2.5 Flash-Lite nearly identical at $0.368 per 1,000 forms. Forms, not maths — [Businessware](https://www.businesswaretech.com/blog/handwritten-form-recognition-benchmark-accuracy-cost-and-performance-comparison-of-leading-ai-models).
- A Tools Competition grant funds Teaching Lab to build an open benchmark of handwritten student maths for LLMs — [Tools Competition](https://tools-competition.org/winner/handwritten-math-benchmark/). I found no published scores from it.

### Inferences
- Luna and Gemini Flash are the sensible vision candidates: their direct predecessors tied on the only real-handwriting study, and both post about .80 or above on MMMU-Pro. Flash 3.8's Pro-tier cost is not needed for reading alone if Luna holds up in testing.
- The pricier GPT-5.1 did worse than GPT-5-mini in Levine 2026, so spending more does not reliably buy better handwriting grading.
- Because transcription dominates errors, Apex's largest gain probably comes from a pipeline change, not a model change: image-quality check, transcribe, let the student confirm, then grade the confirmed text. That also makes grading independently testable.
- Open-weight vision is unproven on handwriting: the only direct maths data is for Qwen2.5 and Llama 3.2 era models, which were far behind. Qwen3.8 and DeepSeek V4.1 may have closed the gap, but no study shows it.
- Haiku 5.5 should not take photo work until tested: AA has no MMMU-Pro for it and the family's Vision Arena placing is poor.

### Gaps
- **Evidence is thin**: I found no results for Gemini 3.8, GPT-6, Haiku 5.5, Qwen3.8, GLM-5.3 or DeepSeek V4.1 on MathWriting, HME100K, FERMAT or real handwritten AP-style work.
- olmOCR-bench and MathVista scores for these models were not found. A January 2023 to July 2026 [SSRN systematic map of 125 handwritten-maths recognition studies](https://papers.ssrn.com/sol3/Delivery.cfm/39387d1e-cc9c-44f5-b7f6-a09d24329225-MECA.pdf?abstractid=7533237&mirid=1) exists but was not read in full.
- Non-English handwriting (AP Chinese, Japanese) has no current data.
- All direct studies use college students or young children, not teens on phones at home.

## What does published evidence say about AI grading of free responses against a rubric?

### Takeaway
The best recent models reach near-human agreement on rubric-scored short answers, but agreement varies widely by model and generation. Nothing found tests AP free responses specifically or any model from the cheap tiers of November 2026.

### Cited Findings
- JMIR Medical Education, Nov 2026 [IND]: 902 responses, 12 short-answer questions, rubric supplied. Human-human QWK 0.90-0.92; Claude Sonnet 4 0.88-0.90 (repeat-run consistency 0.93); "GPT-4o3" 0.82-0.89 (0.85); GPT-5 0.77-0.79 (0.85); Mistral Pro 0.56-0.63 (0.36); GPT-4.5 0.54; GPT-4o 0.29-0.31 — [JMIR](https://mededu.jmir.org/2026/1/e89445). The model name "GPT-4o3" is as printed in the paper.
- That study also found agreement tracked how consistently humans agreed on a given question, and that it did not correlate with prompt design choices; it recommends LLMs augment rather than replace graders — [JMIR](https://mededu.jmir.org/2026/1/e89445).
- Chen and Wan 2025, Phys. Rev. Phys. Educ. Res. [IND]: typed explanations from intro mechanics exams (77 to 96 responses per question). GPT-4o self-consistency reached QWK 0.877-0.905 against human-human 0.825-0.908, with roughly 70 to 80% exact match for both — [APS](https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.21.010126).
- In that study, running repeats and sending high-disagreement answers to review worked: reviewing 10 to 31% of responses caught about 38 to 69% of likely grading errors — [APS](https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.21.010126).
- Failure modes reported there: hunting for specific terms even when mathematically implied; confusion when students used a different but valid algebraic form or reference point; generic feedback on low-scoring answers; simple chain-of-thought prompts fluctuating more between runs — [APS](https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.21.010126).
- NEJM AI study: GPT reached QWK 0.443 for factual accuracy and 0.429 for completeness against multiple graders on medical short answers (search excerpt only) — [NEJM AI via Ovid](https://www.ovid.com/journals/neai/fulltext/10.1056/aics2500239~assessment-of-short-answer-questions-by-chatgpt-in-a-medical).
- Levine 2026: with handwriting, rubric-application errors were the minority at 0 to 30% of errors for the best two cheap models on most questions, against 76% on one question for GPT-5.1 — [arXiv 2605.19043](https://arxiv.org/html/2605.19043v1).
- A 2026 study compares GPT-4o, Gemini 2.0 Flash, DeepSeek V3 and Llama 3.3 on short-answer grading in sustainability education; only its abstract line was seen — [Wiley JCAL](https://onlinelibrary.wiley.com/doi/10.1002/jcal.70160?af=R).
- AP Central publishes FRQs, scoring guidelines, scored sample responses, Chief Reader reports and scoring statistics per exam; AP free responses are handwritten in paper booklets — [AP Biology questions](https://apcentral.collegeboard.org/courses/ap-biology/exam/past-exam-questions), [AP Biology exam](https://apcentral.collegeboard.org/courses/ap-biology/exam).

### Inferences
- A sensible grading bar is QWK of at least about 0.80 against human scores and repeat-run consistency of at least 0.85, based on the human baselines above. These thresholds are mine, not published.
- Generation jumps are large and non-monotonic (GPT-5 scored below GPT-4o3 in JMIR), so a cheaper or newer model must be tested, never assumed.
- Apex has a free, realistic validation set in AP Central's scored samples: run candidates against them and compare with the published reader scores. Check College Board's reuse terms first.
- Run grading twice and show lower confidence (or a "check this" note) when runs disagree. It costs double but has direct evidence behind it.
- Since Apex grades practice work, not real scores, the stakes favour fast feedback with honest uncertainty over an unexplained single number.

### Gaps
- **No study found on AP-specific free-response grading** by LLMs, and none on humanities DBQ or LEQ essay rubrics with current models.
- No study found of grading agreement for Luna, Haiku 5.5, Gemini 3.8 Flash, Qwen3.8 or GLM-5.3.
- Bias across student groups (English learners, handwriting style) and prompt-injection in student answers were not investigated in this pass.

## What is the evidence on LLM-generated multiple-choice item quality and answer-key errors?

### Takeaway
Reviews consistently find usable psychometrics but real accuracy problems, needing a verification step. Apex's audit findings match the published pattern, and I found no recent study of pure model-to-model key accuracy in maths at AP level.

### Cited Findings
- PLOS One systematic review and network meta-analysis, Jan 2026 (15 health-professions studies, older models): pooled accuracy of LLM items 0.73 (95% CI 0.57-0.87, very low certainty); GPT-4 distractors similar to humans, Llama 2 worse (MD -1.50); no significant difficulty or discrimination difference for ChatGPT 3.5 — [PLOS One via PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12758716/).
- Advances in Physiology Education (older): LLM items had "a large number of item writing and factual errors" and needed human oversight and rewriting — [APS Journals](https://journals.physiology.org/doi/10.1152/advan.00106.2024).
- Frontiers in Education, June 2026: 14 expert-validated ChatGPT 4.0 items vs 21 human items in a computing course; no statistically significant psychometric difference, but both had low discrimination (0.09-0.10), and items were expert-validated first — [Frontiers](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1837523/full).
- MDPI 2026 maths problem generation tool for the STACK system reports answer correctness of 0.65 and lists algebraic inconsistency producing an incorrect answer key (search excerpt; generating model not established) — [MDPI](https://www.mdpi.com/2227-7390/14/14/2481).
- A 2026 preprint says LLMs solve problems well yet "struggle to produce valid" hard problems, and proposes a verifier-backed generator — [arXiv 2605.06660](https://arxiv.org/html/2605.06660v1) (abstract excerpt only).
- Item-writing flaws reported: implausible or brief distractors, absolutes, overlapping stem wording, over-explained correct options — [NUS TAPS](https://medicine.nus.edu.sg/taps/issues/hidden-pitfalls-in-ai-generated-mcqs-a-call-for-caution/).
- Models often produce item-writing flaws even with explicit rubrics and examples — [QuestionWell paper](https://questionwell.org/hubfs/Papers/mcq-paper-llncs-main.pdf?hsLang=en) [VENDOR].
- A supervised fine-tuned LLM produced MCQs with psychometric properties comparable to human items in one 2026 study — [JMIR Formative](https://formative.jmir.org/2026/1/e84904) (excerpt only).

### Inferences
- The solving-vs-generating gap explains Apex's audit: a model scoring 90%+ on AIME can still emit a question whose key is wrong, because the generator is not forced to solve its own question. Better models help, but they do not remove this.
- Minimum pipeline for maths and science: generate with a strong model; have a **separate model from a different vendor** solve the question blind, without seeing the key; keep it only if the solver independently lands on the key, exactly one choice is correct, and each distractor is demonstrably wrong; for numeric items, also recompute with code. This is my design, informed by the verifier-backed approach above, and Apex should measure its discard rate.
- Generation is offline work and items are reused, so spending on Gemini 3.8 Flash or Terra at high effort is cheap per student served.

### Gaps
- Almost all direct studies are medicine or computing with 2023 to 2024 models.
- I found no measured key-error rates for Gemini 3.x, GPT-6, Haiku 5.5 or Chinese open-weight models, and no AP-specific item study.
- Evidence for how much cross-model verification lowers key errors was not found; Apex's audit data could establish this.

## Which models support schema-constrained JSON output reliably?

### Takeaway
All cheap proprietary APIs enforce schemas natively, while open-weight reliability depends on the host and DeepSeek's own API offers JSON mode only. Schema enforcement guarantees shape, not correctness, so it does nothing for wrong answer keys.

### Cited Findings
- Requesty test, May 2026 (244 models, 23 providers, 2,400+ tests, simple schema) [VENDOR]: OpenAI strict when `strict: true`; Anthropic and Google always strict; first-party DeepSeek (`deepseek-v4-flash`, `deepseek-v4-pro` and others) returned an error for `json_schema` and supports JSON mode only; Novita failed on 24 of 35 models; DeepInfra's smaller Qwen and distilled DeepSeek models returned non-conforming output; overall pass rates were 75 to 91% — [Requesty](https://www.requesty.ai/blog/structured-outputs-across-llm-providers-the-compatibility-mess).
- A 2026 user report on Reddit makes the same point about DeepSeek's main API, which guarantees only valid JSON syntax — [Reddit](https://www.reddit.com/r/DeepSeek/comments/1v62fxu/deer_deepseek_please_true_structured_output_like/) [WEAK].
- Gemini's structured output supports a subset of JSON Schema — [Gemini API docs](https://aistudio.google.com/docs/structured-output). A 2025 forum thread reports the schema not being respected consistently through its OpenAI-compatible layer — [Google AI forum](https://discuss.ai.google.dev/t/structured-output-not-working-via-the-openai-compatible-layer/108341) [WEAK].
- Empirical study [IND, preprint, 2026]: strict enforcement virtually eliminates syntax errors, but structural and logical errors persist — [arXiv 2606.09395](https://arxiv.org/html/2606.09395v1).

### Inferences
- If Apex adds providers, it should call each through its native schema API, validate on receipt against its own schema, and retry once. Host choice has to be tested per model for open weights.
- DeepSeek is the extra-work option for question generation and grading, which both need strict JSON.

### Gaps
- Whether Gemma 4 on the Gemini API supports `responseSchema` (Apex's overflow path) was not established here; check Apex's code and docs before relying on it.
- Requesty's test predates Luna, Haiku 5.5, DeepSeek V4.1 Flash and GLM-5.3-Flash, and used a trivial schema. Nested question and rubric schemas were not tested.

## How good are they at non-English output for AP language courses and Latin?

### Takeaway
Gemini has the best current evidence for Spanish, French and Japanese, with Claude close and marginally ahead on German; DeepSeek leads on Simplified Chinese in one vendor dataset. Latin has no real benchmark.

### Cited Findings
- Alconost, 5,632 translation evaluations on client projects, 2025 and 2026 [localisation vendor, not a model lab]: overall AQI Gemini 77.7, Claude 75.6, Mistral 71.9, DeepSeek 71.5; linguist score 67.8, 58.9, 51.2, 51.4 — [Alconost](https://alconost.com/en/blog/best-llm-for-translation-2026).
- Same data by language: French Gemini 80.0 vs Claude 79.3; Spanish Gemini 80.1 vs Claude 79.9; German Claude 78.2 vs Gemini 77.0; Japanese Gemini 72.5 vs Claude 71.2; DeepSeek leads Simplified Chinese; small samples per cell (n about 15 to 30) — [Alconost](https://alconost.com/en/blog/best-llm-for-translation-2026).
- WMT 2025: Gemini 2.5 Pro among the top systems in 14 of 15 language pairs, though a secondary source cautions those results cannot rank GPT-6.1 Sol, Sonnet 5.5, Gemini 3.8 Flash or DeepSeek V4.1 Flash — [Gate.AI](https://gate.ai/blog/best-llms-for-translation-in-2026-gpt-vs-claude-vs.-gemini-vs-deepseek).
- TAUS 2026 panel: many "multilingual" leaderboards actually measure reasoning, since a model may reason in English and translate back, and no single model is best — [CSA Research](https://csa-research.com/l/blog/article/the-best-llm-doesnt-exist-how-to-benchmark-multilingual-ai-taus-vancouver-2026).
- An unreliable aggregator claims Qwen3 is the strongest local multilingual family, with Mistral competitive for European languages — [PromptQuorum](https://www.promptquorum.com/local-llms/multilingual-local-llms) [WEAK].
- Latin (older, 2023): a NYU researcher estimated GPT-3 saw a very large amount of Latin, which helps explain its good-but-imperfect grammar correction and tagging — [ISAW NYU](https://isaw.nyu.edu/library/blog/research-recap-how-much-latin-does-chatgpt-know).
- Latin (2026): a shared-task paper found commercial LLMs can identify Latin named entities with careful prompting — [LT4HALA 2026](https://aclanthology.org/2026.lt4hala-1.22.pdf). One blogger's informal test preferred Gemini over ChatGPT — [Liza Long](https://lizalong.substack.com/p/lingua-latina-the-llm-version) [WEAK].

### Inferences
- Translation scores approximate only part of what AP language tutors need: grading a student's writing, explaining grammar, and judging register are different skills, and none was found measured directly.
- Gemini Flash is a safe language default on available evidence. For AP Chinese, DeepSeek's translation lead should not outweigh the censorship findings in the next section; use Gemini or test directly.
- Latin needs a small test using real AP Latin passages from Caesar and Vergil before anything is trusted.

### Gaps
- No current benchmark found for AP-style non-English grading or tutoring, none naming Luna, Haiku 5.5, Gemini 3.8 Flash or Qwen3.8 by language, and no Latin benchmark across models.
- Alconost aggregates engine versions, so its results may not apply to any specific current model.

## Do any carry safety concerns for a teen audience: weak guardrails, censorship or factual distortion?

### Takeaway
Yes. PRC-origin models have documented model-level distortion on China-related and even wider political topics, which matters directly for AP Comparative Government and World History, and hosting them in the US does not remove it. Open-weight models also trail closed ones on child safety, though child-appropriate system prompts help every model substantially.

### Cited Findings
**Censorship and distortion**
- CAISI, Sept 2025 [IND, US government]: DeepSeek models echoed four times as many inaccurate and misleading CCP narratives as US reference models — [NIST](https://www.nist.gov/news-events/news/2025/09/caisi-evaluation-deepseek-ai-models-finds-shortcomings-and-risks). Alignment with CCP talking points, English/Chinese: V3.1 5.2%/11.4%, R1-0528 15.9%/25.8%, R1 0.9%/9.3%, including weights downloaded from Hugging Face rather than via DeepSeek's API — [CAISI report](https://www.nist.gov/system/files/documents/2025/09/30/CAISI_Evaluation_of_DeepSeek_AI_Models.pdf).
- CAISI, Dec 2025: Kimi K2 Thinking aligned with about 26% of CCP talking points in Chinese and 7% in English, minimal in Spanish and Arabic — [NIST](https://www.nist.gov/news-events/news/2025/12/caisi-evaluation-kimi-k2-thinking).
- Pan and Xu 2026, PNAS Nexus [IND, peer reviewed, older models including BaiChuan, ChatGLM, Ernie Bot, DeepSeek vs Llama 2 and GPT]: Chinese models were far more likely to refuse 145 Chinese-politics questions and answered less accurately, including fabrication such as calling Liu Xiaobo a Japanese scientist — [Phys.org](https://phys.org/news/2026-02-state-censorship-chinese-chatbots-sensitive.html). A secondary source gives refusal rates of 30 to 60% vs 0 to 3% — [CEIAS](https://ceias.eu/chinese-llms-and-the-spillover-effects-of-political-alignment/); another cites 10 to 60% — [arXiv 2603.18280](https://arxiv.org/html/2603.18280). These conflict, so check the [paper](https://academic.oup.com/pnasnexus/article/5/2/pgag013/8487339) before quoting.
- CEIAS, April 2026 test [think tank, one author, single judging method]: 1,480 questions about other countries via OpenRouter. Poor answers on each country's Taiwan policy: Qwen 3.5 86%, DeepSeek V3.2 81%, Kimi K2.5 75%, GLM-5 42%; Kimi repeated official CCP statements in about 1 in 3 sensitive answers, DeepSeek in about 1 in 4 — [CEIAS](https://ceias.eu/chinese-llms-and-the-spillover-effects-of-political-alignment/).
- Chinese regulation requires a 2,000-question test set and a keyword library of at least 10,000 entries for public deployment, per CEIAS citing CSET's translation — [CEIAS](https://ceias.eu/chinese-llms-and-the-spillover-effects-of-political-alignment/).
- R1dacted study: censorship is at the model level on locally run DeepSeek-R1 weights, per [CEIAS's summary](https://ceias.eu/chinese-llms-and-the-spillover-effects-of-political-alignment/).

**Guardrails**
- CAISI 2025: DeepSeek R1-0528 complied with 94% of overtly malicious requests under a common jailbreak, vs 8% for US reference models — [NIST](https://www.nist.gov/news-events/news/2025/09/caisi-evaluation-deepseek-ai-models-finds-shortcomings-and-risks).
- CAISI July 2026: GLM-5.2 safeguards are mixed, with moderate robustness to public jailbreaks, and it answers sensitive biology queries at a lower rate than other PRC models but much more than US models; open-weight models can have refusals removed altogether — [CAISI report](https://www.nist.gov/system/files/documents/2026/07/17/CAISI%20-%20Assessment%20of%20Z.ai%27s%20GLM-5.2.pdf). CAISI's July and September pieces on Kimi K3 and GLM-5.3 focus on cyber — [Kimi K3](https://www.nist.gov/news-events/news/2026/07/uk-aisi-caisi-preliminary-assessment-kimi-k3s-cyber-capabilities), [GLM-5.3](https://www.nist.gov/news-events/news/2026/09/caisis-assessment-zais-glm-53-cyber-capabilities).
- KORA child-safety benchmark [IND, open source, early 2026, older versions]: closed models average 49.1% vs open models 24.5%, failure rates 41.5% vs 61.7%; Claude Haiku 4.5 led at 75.6% with ChatGPT 5.2 at 75%; Kimi 2.5 49% and DeepSeek 42% are on par with Gemini, ahead of xAI and Meta — [KORA](https://korabench.ai/blog/2026-02-03/introducing-kora).
- KORA also found all 24 models improved with child-appropriate system prompts, by +26 points on average, and educational integrity was the weakest area, at a 70.7% failure rate, including 76% inadequate responses on academic dishonesty — [KORA](https://korabench.ai/blog/2026-02-03/introducing-kora).
- Common Sense Media ratings are of consumer **products**, not APIs: ChatGPT for Teens Unacceptable (7 Oct 2026), Claude Moderate (25 Mar 2026), Grok Unacceptable (22 Jan 2026), Gemini K-12 High (9 Jan 2026), Gemini with Teen Protections High (5 Sep 2025), Meta AI Unacceptable (15 Aug 2025); DeepSeek, Kimi and Qwen are not listed — [Youth AI Safety Institute](https://institute.commonsensemedia.org/risk-assessments).
- Those ratings cover products unlike Apex in scope, such as mental-health and companionship uses — [Common Sense press release](https://www.commonsensemedia.org/press-releases/common-sense-media-finds-major-ai-chatbots-unsafe-for-teen-mental-health-support).

### Inferences
- Route AP Comparative Government, World History, US Government (and AP Chinese culture content) only to non-PRC models. AP Comparative Government includes China as a core case country (background knowledge, not re-verified in this pass), so this is a direct content risk, not a theoretical one.
- A "use PRC models for maths only" split is defensible and cheap to implement via subject routing, since the published distortion evidence concerns politics, not physics. Keep the system prompt and output filters identical across models, because open weights have weaker built-in safeguards.
- Apex's own system prompt is a high-value safety control: KORA's +26 point gain is available at no cost, and Apex's overflow model (Gemma, open-weight) likely benefits most. KORA also suggests explicit "don't complete graded work for the student" instructions matter for an exam-prep tutor.
- Common Sense product ratings should not be read as API ratings, but the Gemini and ChatGPT findings are a reason to add Apex's own crisis-handling behaviour instead of relying on model defaults.

### Gaps
- No independent censorship evaluation was found for DeepSeek V4.1 Flash, GLM-5.3-Flash, Qwen3.8, Kimi K3.1 or MiniMax M3.1 specifically; the latest coverage stops at V3.2, K2.5, Qwen 3.5 and GLM-5. A page-extraction query of the V4 Pro summary and GLM-5.2 report found no censorship results, which is not proof that the full reports omit them.
- KORA's current leaderboard could not be read (scores load client-side), so Haiku 5.5, Luna, Gemini 3.8 Flash and Qwen3.8 standings are unknown.
- Age rules and data-handling terms for under-18s per provider were not covered here and need checking separately.
- No study found on US-history bias (for example, Western-model distortion on AP US History topics), so the evidence here is asymmetric.

## Which is the cheapest or free model that clears the bar for each task, and would a mix be better?

### Takeaway
A mix is clearly better than one model, because the tasks reward different strengths: Haiku 5.5 or Flash-Lite for chat and flashcards, Gemini 3.8 Flash or Terra for offline question generation, and Luna or Flash for reading photos. Strictly free options clear the bar only for low-stakes grounded work, and every "clears the bar" call for grading and photos remains provisional until Apex runs its own evaluation.

### Cited Findings
Price and scores come from the AA tables above. Rough cost per call of 3,000 input and 1,500 output tokens (my arithmetic from [AA list prices](https://artificialanalysis.ai/leaderboards/models), before caching and excluding reasoning tokens, which bill as output and can multiply cost at high effort):

| Model | ~Cost per call |
|---|---|
| Gemma 4 31B (first-party list price) | $0 |
| Claude Haiku 5.5, GPT-6 Luna | $0.0011 |
| Qwen3.8-Flash-Next | $0.0012 |
| GLM-5.3-Flash | $0.0012 |
| MiniMax-M3.1-Flash | $0.0014 |
| DeepSeek V4.1 Flash | $0.0027 (AA list) |
| Gemini 3.5 Flash-Lite | $0.0047 |
| Gemini 3.8 Flash | $0.0079 |
| GPT-6.1 Terra | $0.0105 |
| Kimi K3.1 Pro | $0.021 |

- AA's cost-per-task figures are agent runs dominated by cache writes and are not applicable to Apex: Gemini 3.8 Flash high $7.76, Haiku 5.5 max $0.41, Luna max $0.15, Flash-Lite $0.69 — [AA leaderboard](https://artificialanalysis.ai/leaderboards/models).
- Closed models remain the most accurate and cheapest at a given accuracy in one 2026 analytics benchmark [VENDOR, data analytics, not education]: GPT-6 Luna matched the best open models' 38 of 43 for $0.13 a run — [Plotly](https://plotly.com/blog/open-models-vs-closed-models-2026/).

### Inferences
**Proposed minimum capability bar** (my judgement; thresholds are not published standards):

| Task | Bar | Basis |
|---|---|---|
| Tutor chat, maths and science | GPQA ≥ .85 or equivalent; reasoning on | Gemma and Flash-Lite are borderline here |
| Tutor chat, history and government | Omniscience score ≥ 0, or answers grounded in Apex content; non-PRC | Calibration and censorship evidence |
| MCQ generation, maths and science | GPQA ≥ .90 or HLE ≥ .38 and CritPt ≥ .15; strict schema; cross-model solver check | Key errors are the known failure |
| Free-response grading (text) | Measured QWK ≥ .80 and repeat consistency ≥ .85 on AP samples | Human baselines of .82 to .92 |
| Handwritten photo reading | MMMU-Pro ≥ about .79 and measured rubric-item accuracy ≥ 90% | Levine 2026 |
| Step-by-step photo solver | Photo bar plus the MCQ bar | Reads then reasons; wrong steps mislead |
| Flashcards | Strict schema; grounded in Apex content | Low stakes, and easy to check |
| Language courses | Measured on real AP tasks | No direct benchmark exists |

**Cheapest candidate per task, with evidence strength:**

| Task | Cheapest likely to clear | Stronger fallback | Free option | Confidence |
|---|---|---|---|---|
| Chat (science, maths) | Haiku 5.5 high; GLM-5.3-Flash if PRC acceptable for STEM | Gemini 3.8 Flash | Gemma 4 31B, only as a labelled fallback | Medium |
| Chat (history, gov) | Haiku 5.5 high | Terra or Flash, grounded | Gemma grounded in study content, otherwise a graceful refusal | Medium |
| MCQ generation | GLM-5.3-Flash or Qwen3.8-Flash-Next generating STEM, verified by a US model; or Haiku 5.5 max | Gemini 3.8 Flash high plus Terra as solver | None clear | Medium; run offline in batches |
| Text grading | Haiku 5.5 high or max (Claude family has the best grading data) | Terra | None clear | Low until tested |
| Photo grading | GPT-6 Luna (transcribe) then Haiku 5.5 (grade) | Gemini 3.8 Flash for both | None clear; Gemma's MMMU-Pro of .734 is below the bar | Low until tested |
| Photo solver | Luna (read) then a high-effort solver | Gemini 3.8 Flash high | None clear | Low until tested |
| Flashcards | Haiku 5.5 low or Luna medium; Flash-Lite as incumbent | | Gemma 4 grounded on source text | Medium |
| Languages | Gemini 3.8 Flash; Haiku 5.5 for German comparison | Terra | None tested | Low |

**Why a mix beats a single model:** No candidate wins everything. Flash is strongest for vision and science but poorly calibrated on facts; Haiku is best-calibrated and cheapest but unproven on images; Luna reads well but overstates facts; PRC models are excellent value for maths but unusable for government.

**Why not simply replace Gemini:** Apex already integrates Gemini, and Gemini 3.8 Flash is the top cheap-tier model on the most task-relevant scores. The highest-value changes in order are: (1) reduce reliance on Flash-Lite and Gemma for question generation and grading; (2) add transcription confirmation for photos; (3) add a blind solver check using a second vendor; (4) evaluate Haiku 5.5 and Luna, which cost roughly a quarter of Flash-Lite per call and outscore it on HLE, CritPt and the index.

**Before committing:** Run a small Apex-owned evaluation, since no published study answers this question directly: about 200 scored AP sample responses across calculus, physics, chemistry, biology, history and a language, plus 200 photo cases and 200 generated items per candidate, at the actual effort level to be used, recording QWK, repeat consistency, key-error rate, discard rate, cost and latency. Pick a free tier only after checking quotas, since Gemma and free tiers may be withdrawn or throttled.

### Gaps
- Actual free-tier limits, rate limits and under-18 terms were not researched here.
- High-effort token overhead per AP task is unmeasured; real costs could be several times the table above.
- Latency for chat at high effort was not measured: AA's per-endpoint speed fields returned empty in this pass.
- No evidence directly compares a model mix with a single model in tutoring or grading outcomes; the recommendation is inferred from the separate task evidence.
