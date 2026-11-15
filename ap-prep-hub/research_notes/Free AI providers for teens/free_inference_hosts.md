# Free AI inference hosts for open models, and whether a teen-facing site may use them (checked 2026-11-07)

All pages were read on 2026-11-07 unless noted. Clause wording is paraphrased closely, with section and URL, rather than quoted at length, because of a limit on reproducing source text. Check the linked page before relying on exact words. This is a reading of published terms, not legal advice.

## Does each provider's terms address under-18 end users? (account holder vs end user)

### Takeaway
No provider with a usable recurring free tier clearly permits under-18 end users. Workers AI comes closest: it has free capacity, no production restriction and no age bar in the contract. But Cloudflare's privacy policy says its services are not intended for under-18s, so it is a judgement call, not a clean yes.

### Cited Findings
| Provider | Account holder age | Under-18 end users of an app | Rating | Terms date |
|---|---|---|---|---|
| Cloudflare Workers AI | No age clause found in the Self-Serve agreement | The service terms make the customer solely responsible for the acts of its End Users and set no age bar. The privacy policy says Cloudflare's Websites and Services are not intended for, or designed to attract, under-18s. The same policy says it does not apply to customers' own sites and apps | Unclear, leaning allowed | Self-Serve Sept 12 2025; service terms Sept 28 2026 |
| Groq | §2 "Age Requirement": you must be 18 or older to access or use the Cloud Services | §3.1 lets the customer make the services available to End Users through its app. End Users are defined as Authorized Users, and the preamble says the services are not for consumer use. §2 is addressed to "you" (the Customer), so whether it reaches end users is ambiguous | Unclear, leaning prohibited | Last modified June 22 2026 |
| Cerebras | Must be at least 13, or the local age of digital consent, to register | Silent on end users of an app | Unclear, no bar found | Effective Aug 27 2024 |
| OpenRouter | §2 Eligibility: must be at least 18 to use the Service. The privacy policy offers the Site to over-18s only | §5.1 covers "your customers" when you build OpenRouter into your product, and requires you to make them comply with each model's Model Terms. There is no separate age rule for them | Unclear for OpenRouter itself; prohibited in effect on Google-routed free models (see below) | Aug 31 2026 |
| GitHub Models | n/a | Fully retired July 30 2026 | n/a | Retired |
| NVIDIA build.nvidia.com / NIM trial | Only an adult of legal majority may accept the terms | §1.2 and §1.4 bar production use without a paid subscription, which rules out a live site whatever the age | Prohibited | PDF undated |
| Hugging Face | Must be at least 13 to create an account | Silent on app end users; the privacy policy only covers under-13s | Unclear, no bar found | Terms header Sept 15 2022; content policy Apr 10 2025 |
| Together AI | At least 13 and the local age of digital consent; a parent must agree for a user who cannot consent | Silent on app end users; bars content harmful to minors | Allowed with conditions | Updated May 19 2026 |
| Fireworks | §1.1: any use by a minor (under 18 in most places) is prohibited unless supervised by a parent who accepts the terms | §3.3 also has you warrant that Input contains no personal information of under-13s | Prohibited without parental supervision | Last updated July 10 2026 |
| DeepInfra | No age clause in the terms | §10 makes the customer solely responsible for its end-user relationships. The privacy policy says the website is not for under-18s | Unclear | Last modified Oct 15 2026 |
| SambaNova | No age clause found in the SambaCloud Terms of Service | Silent. The privacy policy says it does not knowingly collect data from under-16s without parental consent | Unclear | EULA undated; privacy undated |
| Puter | Must be at least 13, or older where local law requires that age for use without parental consent | The student holds their own Puter account, so this floor applies to the student directly | Allowed with conditions | Terms dated 2023-02-02; privacy effective 2022-07-18 |
| Scaleway | Unconfirmed (terms pages return 403) | Unconfirmed | Unconfirmed | General Terms v.09/06/26 listed, not read |

Sources: [Cloudflare Self-Serve](https://www.cloudflare.com/terms/), [Cloudflare service terms](https://www.cloudflare.com/service-specific-terms-developer-platform/), [Cloudflare privacy](https://www.cloudflare.com/privacypolicy/); [Groq Services Agreement](https://console.groq.com/docs/legal/services-agreement); [Cerebras terms](https://www.cerebras.ai/terms-of-service); [OpenRouter terms](https://openrouter.ai/terms), [OpenRouter privacy](https://openrouter.ai/privacy); [GitHub Models](https://docs.github.com/en/billing/concepts/product-billing/github-models); [NVIDIA API Trial Terms](https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf); [HF terms](https://huggingface.co/terms-of-service), [HF privacy](https://huggingface.co/privacy); [Together terms](https://www.together.ai/terms-of-service); [Fireworks terms (PDF)](https://fireworks.ai/terms-of-service); [DeepInfra terms](https://deepinfra.com/terms), [DeepInfra privacy](https://deepinfra.com/privacy); [SambaCloud terms](https://sambanova.ai/cloud-end-user-license-agreement), [SambaNova privacy](https://sambanova.ai/privacy-policy); [Puter terms](https://puter.com/terms), [Puter privacy](https://puter.com/privacy); [Scaleway contracts](https://www.scaleway.com/en/contracts/).

- Google's Gemini API Additional Terms (effective March 23 2026) require users to be 18 or older and forbid using the APIs in a service directed at, or "likely to be accessed by individuals under the age of 18" — [Gemini API terms](https://ai.google.dev/gemini-api/terms).
- OpenRouter serves its free Gemma 4 variants through Google AI Studio — [OpenRouter endpoints API](https://openrouter.ai/api/v1/models/google/gemma-4-26b-a4b-it:free/endpoints).

### Inferences
- OpenRouter §5.1 makes you comply with each model's terms, and its free Gemma 4 routes are served by Google AI Studio. Google's under-18 bar therefore very likely applies to those routes.
- The same Gemini clause applies to Apex Scholar's current direct Gemini setup. It is outside this brief, but it is probably the bigger problem.
- The account holder's age matters separately from the end users'. If the developer is under 18, Groq, OpenRouter, NVIDIA and Google are closed to him personally, however their end-user clauses are read.
- Under Puter's user-pays model, each student is Puter's own customer, which moves the age question from the developer to Puter. Puter's Gemini-family models (it lists `gemini-3.1-flash-lite` and others — [Puter chat docs](https://docs.puter.com/AI/chat/)) still pass Google's terms through to Puter, and Puter's terms say nothing about that.

### Gaps
- No provider was asked directly. Written answers from Cloudflare and Groq would settle the two most useful unclear ratings.
- Scaleway's General Terms and AI Specific Conditions could not be loaded (403).

## Free limits, models, and production use

### Takeaway
Only Workers AI, Groq, OpenRouter and SambaNova still give recurring free inference. Cerebras and Scaleway offer one-time credit only; Hugging Face, Together, Fireworks and DeepInfra have no free allowance; GitHub Models is gone. NVIDIA's free credits are for trial use only.

### Cited Findings
**Recurring free**
- Workers AI: 10,000 Neurons a day on both Free and Paid plans, resetting at 00:00 UTC; beyond that, $0.011 per 1,000 Neurons on Workers Paid. Several newer models need a paid billing method (Kimi K2.6/K2.7, GLM 5.x, DeepSeek V4 family) — [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). Text generation is limited to 300 requests per minute — [limits](https://developers.cloudflare.com/workers-ai/platform/limits/). The docs do not call the free allocation prototype-only.
- Groq free plan, per model: `openai/gpt-oss-120b`, `openai/gpt-oss-20b` and `qwen/qwen3.8-27b` each get 30 RPM, 1K RPD, 8K TPM and 200K TPD. The page calls the table a summary and says exact limits are on the account's limits page — [rate limits](https://console.groq.com/docs/rate-limits). The Developer plan gets 250K TPM and 1K RPM on the same models, which confirms the 8K table is the free one — [models](https://console.groq.com/docs/models).
- Groq lists `qwen/qwen3.8-27b` as a preview model, which Groq says is for evaluation only and should not be used in production. The gpt-oss models are production models. Llama 3.1 8B and 3.3 70B now show Contact Sales — [models](https://console.groq.com/docs/models). §5.1 allows fee-free services within usage limits — [agreement](https://console.groq.com/docs/legal/services-agreement). The AUP bars going beyond published limits, including by registering multiple accounts — [AUP](https://console.groq.com/docs/legal/ai-policy).
- OpenRouter `:free` variants: 20 RPM. 50 requests a day if under $10 of credits have ever been bought, 1,000 a day at $10 or more — [limits](https://openrouter.ai/docs/api-reference/limits) (the numbers are rendered from constants in the page source). The terms forbid multiple accounts used to get around limits — [terms](https://openrouter.ai/terms). The models API listed 16 zero-priced entries on Nov 7 — [models API](https://openrouter.ai/api/v1/models).
- SambaNova Free Tier (no payment method): 20 RPM, 20 RPD and 200K TPD per model, covering DeepSeek-V3.1, Meta-Llama-3.3-70B-Instruct and gpt-oss-120b. Preview models such as gemma-4-31B-it get the same limits but are for evaluation, not production — [rate limits](https://docs.sambanova.ai/docs/en/models/rate-limits). A SambaNova community post says the free tier was being moved into the Developer tier, which conflicts with the current docs; the post is undated in what I saw — [community](https://community.sambanova.ai/t/is-free-tier-going-away/847).

**One-time or trial only**
- Cerebras: no permanent free tier. New accounts get $5 in credit after adding a verified payment method; it expires after 30 days. Trial limits are 5 RPM, 30K uncached TPM and 1M TPD on `gpt-oss-120b` and `qwen-3.8-27b` — [rate limits](https://inference-docs.cerebras.ai/support/rate-limits). The pricing page footnote says the tier is for development and evaluation, not production — [pricing](https://www.cerebras.ai/pricing).
- NVIDIA: the trial terms allow trial use only, with no production use of the API or its output without a subscription (§1.2, §1.4). NIM endpoints are free to Developer Program members for prototyping — [trial terms](https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf), [NIM docs](https://docs.api.nvidia.com/nim/docs/product). Developers describe a default of 40 RPM and 1,000 credits; these come from forum posts, not official docs — [NVIDIA forum](https://forums.developer.nvidia.com/t/credit-rate-limit-increase-request-1-000-to-5-000-credits-40-to-200-rpm/376049).
- Scaleway: new customers get their first 1,000,000 tokens free, then pay from token 1,000,001 — [Generative APIs](https://www.scaleway.com/en/generative-apis/).

**No free tier**
- Hugging Face: free users get no monthly credits for Inference Providers and must buy credits; PRO gets $2 a month — [pricing](https://huggingface.co/docs/inference-providers/pricing).
- Together: no free trials, a $15 minimum credit purchase, fully prepaid — [credits docs](https://docs.together.ai/docs/billing).
- Fireworks: no free allowance appears on the pricing page; serverless usage draws on prepaid credits — [pricing](https://fireworks.ai/pricing). Accounts with no payment method or no credits are capped at 10 RPM — [limits](https://docs.fireworks.ai/guides/quotas_usage/rate-limits).
- DeepInfra: no free tier found on the pricing page; the default limit is 200 concurrent requests per model — [rate limits](https://deepinfra.com/docs/advanced/rate-limits).
- GitHub Models: fully retired on July 30 2026. The playground, catalogue, inference API and BYOK are no longer available to anyone — [GitHub docs](https://docs.github.com/en/billing/concepts/product-billing/github-models).

**User-pays**
- Puter: users sign in with their own Puter account, which pays for their AI use, so the developer's cost stays at $0. Every user starts with a free monthly allowance and is prompted to upgrade when it runs out — [user-pays](https://docs.puter.com/user-pays-model/). Free accounts get 30 AI requests per 10 seconds and 3 concurrent requests. The allowance resets monthly and is shown only in the dashboard — [limits](https://docs.puter.com/rate-limits-and-quotas/). Paid plans start at $10 a month — [Puter pricing](https://puter.com/pricing).

### Inferences
- Groq's and Workers AI's docs do not limit their free tiers to prototyping, though Groq's only vision model is preview-grade. NVIDIA, Cerebras and SambaNova's preview models are explicitly not for production.
- One Groq organisation is the ceiling: limits apply per organisation and extra accounts breach the AUP.

### Gaps
- Puter's free allowance in dollars is not published in any doc I read. A search found no official figure.
- Whether Fireworks' 10 RPM no-credit state can run any inference is unconfirmed.
- I did not open NVIDIA's model catalogue, so which NVIDIA-hosted models accept images is unconfirmed (moot given the production ban).

## Which free models accept images?

### Takeaway
Free vision is available on Workers AI, Groq (preview only), OpenRouter and SambaNova (preview only). For this site the most usable is Workers AI's Gemma 4 26B.

### Cited Findings
- Workers AI (neurons per million input/output tokens): `@cf/google/gemma-4-26b-a4b-it` 9,091 / 27,273; `@cf/meta/llama-3.2-11b-vision-instruct` 4,410 / 61,493; `@cf/meta/llama-4-scout-17b-16e-instruct` 24,545 / 77,273; `@cf/google/gemma-3-12b-it` 31,371 / 50,560; `@cf/qwen/qwen3.8-27b` 40,909 / 290,909 — [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). The model pages describe Scout as natively multimodal and Qwen 3.8 as designed for vision — [Scout](https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/), [Qwen](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/).
- Groq: `qwen/qwen3.8-27b` is the only vision model listed; image URLs are limited to 20 MB per request — [vision docs](https://console.groq.com/docs/vision).
- OpenRouter free variants that accept images: `google/gemma-4-26b-a4b-it:free`, `google/gemma-4-31b-it:free` (both via Google AI Studio), `nvidia/nemotron-3.5-super-vl:free`, `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` (both via NVIDIA), `dots-studio/dots-3-note-preview:free` (via AtlasCloud, expires 2026-12-31) and the `openrouter/free` router — [models API](https://openrouter.ai/api/v1/models), [endpoints API](https://openrouter.ai/api/v1/models/nvidia/nemotron-3.5-super-vl:free/endpoints).
- SambaNova: `gemma-4-31B-it` takes text, images and video, but it is a preview model limited to 20 requests a day on the free tier — [models](https://docs.sambanova.ai/docs/en/models/sambacloud-models), [rate limits](https://docs.sambanova.ai/docs/en/models/rate-limits).
- Cerebras: `qwen-3.8-27b` takes up to 2 images per request on the trial — [rate limits](https://inference-docs.cerebras.ai/support/rate-limits).

### Inferences
- Every free vision route on OpenRouter goes to a provider whose terms either bar this audience (Google) or bar production use (NVIDIA).

### Gaps
- None of these models was tested on handwritten work.
- How each host counts image input in tokens or neurons was not confirmed, so the vision capacity figures below are upper bounds.

## Is free-tier data logged, used for training, or reviewed?

### Takeaway
Workers AI has the strongest written commitment (zero retention, no training). The OpenRouter free vision routes are the worst: Google keeps the right to use unpaid content and have humans review it, and NVIDIA's free endpoints are flagged as retaining and training on prompts.

### Cited Findings
- Workers AI (page dated Oct 16 2026): standard inference keeps no inputs or outputs after the response is delivered, Customer Content is not used for training, and only operational metadata is kept — [data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).
- Groq: inference is not retained by default, but inputs and outputs may be logged for up to 30 days for reliability and abuse monitoring. Any customer can turn on zero data retention — [your data](https://console.groq.com/docs/your-data). Groq may not train on inputs or outputs unless told to (§4.2) — [agreement](https://console.groq.com/docs/legal/services-agreement).
- OpenRouter's per-provider data policies (via its provider listing): Google AI Studio retains prompts for 55 days and needs user IDs; NVIDIA retains prompts and trains on them; AtlasCloud retains prompts but does not train — [OpenRouter providers API](https://openrouter.ai/api/v1/providers). Account settings let you block providers that train, separately for paid and free models — [provider logging](https://openrouter.ai/docs/guides/privacy/logging). OpenRouter screens all traffic in flight for CSAM and may keep flagged content for human review — [data collection](https://openrouter.ai/docs/guides/privacy/data-collection).
- Google's unpaid services: content and responses are used to improve Google products and machine learning, and human reviewers may read them — [Gemini API terms](https://ai.google.dev/gemini-api/terms).
- NVIDIA trial §3.3: NVIDIA collects User Content and Generated Content to improve its products, including AI models, and logs use for abuse monitoring — [trial terms](https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf).
- Cerebras: Service Content is not used for training or fine-tuning — [terms](https://www.cerebras.ai/terms-of-service). Fireworks §3.6 and DeepInfra §6(b) promise zero retention and no training for inference — [Fireworks](https://fireworks.ai/terms-of-service), [DeepInfra](https://deepinfra.com/terms). Together offers zero retention only if you choose No in its privacy settings — [Together](https://www.together.ai/terms-of-service). Hugging Face routing stores no request bodies and keeps debug logs for up to 30 days — [HF security](https://huggingface.co/docs/inference-providers/security). Scaleway stores data for up to two weeks, only to reproduce and fix issues — [Scaleway data privacy](https://www.scaleway.com/en/docs/generative-apis/reference-content/data-privacy/) (search snippet; the page returned 403).

### Inferences
- Photos of minors' handwritten work should not go to any route whose provider may review it or train on it. That rules out OpenRouter's Google and NVIDIA free routes even before the age clauses.

### Gaps
- Puter's terms and privacy policy predate its AI features and do not mention AI, so how Puter and its upstream vendors handle students' prompts is unconfirmed.

## Do model licences pass through to the app?

### Takeaway
Yes. Cloudflare, Groq, OpenRouter and Together each make you responsible for the model's own terms. The free-tier vision models' licences add no age rule I could find, though Llama's needs checking.

### Cited Findings
- Cloudflare: models are Third-Party Products, and using one means agreeing to the provider's restrictions and acceptable-use policies. A suspected breach can mean immediate suspension — [service terms](https://www.cloudflare.com/service-specific-terms-developer-platform/).
- Groq §4.1: you and your users must comply with the AI Model Terms, which win over the agreement for that model — [agreement](https://console.groq.com/docs/legal/services-agreement).
- OpenRouter §5.1–5.2: you must make sure your users and customers comply with the Model Terms — [terms](https://openrouter.ai/terms).
- Together: third-party model terms govern on any conflict — [terms](https://www.together.ai/terms-of-service).
- Licences: Qwen3.8-27B is Apache 2.0 and Llama 3.2 11B Vision is under the Llama 3.2 licence (per Hugging Face metadata) — [Qwen](https://huggingface.co/Qwen/Qwen3.8-27B), [Llama](https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct). Google publishes an Apache 2.0 page for Gemma — [Gemma licence](https://ai.google.dev/gemma/apache_2).
- Workers AI asks for a one-time `agree` prompt before Llama 3.2 Vision will run — [model page](https://developers.cloudflare.com/workers-ai/models/llama-3.2-11b-vision-instruct/).

### Gaps
- I could not load the Llama 3.2 licence text, so its multimodal regional restriction and acceptable-use terms were not re-checked for age wording.
- That the Apache page covers Gemma 4 specifically is inferred from Google's Gemma docs, not read in a Gemma 4 model card.

## Reliability and free-tier removal risk

### Takeaway
Free tiers shrank repeatedly in 2026: GitHub retired its service, Cerebras ended its free tier, and Groq appears to have cut daily caps. Plan on the assumption that one could disappear before March-May.

### Cited Findings
- GitHub Models was fully retired on July 30 2026 — [GitHub docs](https://docs.github.com/en/billing/concepts/product-billing/github-models).
- Cerebras replaced its open free tier with the $5 trial on July 21 2026, and on Oct 5 2026 merged the trial and paid tier into one Developer tier. This comes from a third-party pricing tracker; Cerebras's own docs confirm only the current state — [UsagePricing](https://www.usagepricing.com/blueprint/cerebras), [Cerebras](https://inference-docs.cerebras.ai/support/rate-limits).
- Groq: third-party guides from earlier in 2026 quoted 14,400 RPD per model, against 1K RPD on Groq's page now; a July 2026 German deals page says Groq moved to per-model daily limits. Groq has published no announcement of this — [search summary sources: eesel](https://eesel.ai/blog/groq-pricing), [mydealz](https://www.mydealz.de/deals/sammeldeal-kostenlose-ki-api-kapazitaten-fur-entwickler-gemini-groq-openrouter-cloudflare-workers-ai-cerebras-hugging-face-2783697), [Groq](https://console.groq.com/docs/rate-limits).
- Groq retired its vision models: Llama 4 Maverick on March 9 2026 and Scout on July 17 2026 — [deprecations](https://console.groq.com/docs/deprecations).
- Workers AI deprecated models on May 30 2026, and aliased Kimi K2.5 to the pricier K2.6 — [changelog](https://developers.cloudflare.com/workers-ai/changelog/). Third-party status aggregators list 2026 Workers AI incidents, including a 4.2-hour Gemma 4 health issue in April and about an hour of availability problems on May 19 — [IsDown](https://isdown.app/status/cloudflare-workers/outage-history).
- OpenRouter free models carry expiry dates (`liquid/lfm-2.5-2.6b:free` on 2026-11-13, `dots-studio/dots-3-note-preview:free` on 2026-12-31) — [models API](https://openrouter.ai/api/v1/models). One third-party test found 13 of 19 free models answered and 4 returned upstream 429s — [fast.io, citing klymentiev.com](https://fast.io/resources/openrouter-rate-limit/).

### Gaps
- Official status-page histories (cloudflarestatus.com, Groq, OpenRouter) were not read; the incident list above is from an aggregator.

## Worker compatibility and how much load the free tier can carry

### Takeaway
No free tier gets near the 12,000-a-day design capacity. Workers AI's Gemma 4 carries about 400 calls a day, roughly 3% or about 31 practice tests. Workers AI is the only option with no egress risk, because it runs inside the Worker.

### Cited Findings
- Workers AI is called through the Worker's own AI binding, and the free 10,000-neuron allocation applies to the Workers Free plan — [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- Groq: a Groq representative said on its forum that some 403 "Access denied" errors come from Groq blocking IP ranges at its Cloudflare edge — [Groq community](https://community.groq.com/t/getting-access-denied/886/2). A developer reported that Workers in some Asia-Pacific colos were blocked by an upstream API, and fixed it by pinning the Worker's placement to the US — [GitHub PR](https://github.com/TQZHR/grok2api/pull/1) (different API; anecdotal).
- Apex's own figures: about 12,000 calls a day and about 330 RPM on the current pool, with a practice test costing about 13 model calls — repo `README.md`, "AI capacity" section.
- Puter is called from the browser by the signed-in student, so no Worker is involved — [user-pays](https://docs.puter.com/user-pays-model/).

### Inferences
Reference request (my assumption, not measured): 1,200 input and 500 output tokens, images not counted.

| Host / model | Arithmetic | Calls/day | Share of 12,000 |
|---|---|---|---|
| Workers AI, Gemma 4 26B (vision) | 10.9 + 13.6 = 24.5 neurons; 10,000 / 24.5 | about 407 (about 31 tests) | 3.4% |
| Workers AI, Llama 3.2 11B Vision | 5.3 + 30.7 = 36.0 neurons | about 277 | 2.3% |
| Workers AI, Gemma 3 12B | 37.6 + 25.3 = 62.9 neurons | about 158 | 1.3% |
| Workers AI, Llama 4 Scout | 29.5 + 38.6 = 68.1 neurons | about 146 | 1.2% |
| Workers AI, Qwen 3.8 27B | 49.1 + 145.5 = 194.5 neurons | about 51 | 0.4% |
| Groq, one model | 200K TPD / 1,700 tokens; 8K TPM caps it at 4.7 calls a minute | about 117 | 1.0% |
| Groq, all three free models | 3 x 117 (only Qwen does vision, and it is preview) | about 352 | 2.9% |
| OpenRouter, after $10 bought once | 1,000 RPD at 20 RPM, subject to upstream limits | up to 1,000 | 8.3% |
| OpenRouter, no purchase | 50 RPD | 50 | 0.4% |
| SambaNova | 20 RPD per model; 3 production models | 60 | 0.5% |
| Scaleway | 1M tokens / 1,700, once only | about 588 total | one-time |

- The Workers AI neuron pool is shared across models, so the Workers AI rows are alternatives, not additive. Workers AI plus Groq (if Groq's age clause allowed it) comes to about 760 calls a day.
- Paying for overflow on Workers AI at the full 12,000 a day: 294,600 neurons, less the free 10,000, at $0.011 per 1,000 is about $3.13 a day, or roughly $94 for a 30-day month, plus the Workers Paid plan fee (amount not checked).
- 12,000 calls a day averages 8.3 a minute, which is above Groq's 4.7-a-minute token ceiling on any one model.
- Puter scales with users because each student pays from their own allowance, but whether the free allowance covers a student's real usage is unknown.

### Gaps
- Real Apex token counts per call were not measured; the figures scale inversely with request size.
- CORS is irrelevant for server-side calls from the Worker. Egress blocking was confirmed only anecdotally for Groq, and not tested.
