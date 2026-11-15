# Direct AI lab APIs for a free website used by 13-17 year olds (as of Nov 7, 2026)

How to read these notes:
- Legal clauses are closely paraphrased with their section number and link. Exactly one is quoted word for word, to stay within quoting limits. Read the linked page for exact wording before relying on any clause.
- Pages were read on Nov 7, 2026, mostly through a summarising fetch tool. Check section numbers against the source.
- "Not found" means not found in the parts of the page I read. It does not prove the text is absent.
- Two documents are posted with effective dates after today: OpenAI's Usage Policies (Nov 20, 2026) and Anthropic's Usage Policy (Nov 12, 2026). I did not compare either with the version currently in force.
- Ratings describe what the text says. They are not legal conclusions.

## Can a developer's app have end users aged 13-17?

### Takeaway
Google is the only provider whose text clearly prohibits this: both the Gemini API (paid and unpaid) and Vertex AI bar any site likely to be accessed by under-18s. OpenAI, Anthropic, Mistral, Kimi and Cohere allow it with conditions. The others are silent, ambiguous, or conflict between their own documents.

### Summary table
| Provider | Rating | Developer must be 18? | Conditions for teen end users | Key doc date |
|---|---|---|---|---|
| OpenAI | Allowed with conditions | Not stated in Services Agreement | Parental consent; COPPA; age-appropriate safeguards; ZDR before processing under-13 personal data; audits | Agreement effective Jan 1, 2026 |
| Anthropic | Allowed with conditions | No age clause in Commercial Terms | Safeguards (age verification, moderation, monitoring); public COPPA statement; AI disclosure; audits. No parental consent clause, no age floor, no approval step | Article Mar 16, 2026; AUP dated Nov 12, 2026 |
| Google Gemini API (paid and unpaid) | Prohibited | Yes, 18+ | Banned if the site is directed at or likely to be accessed by under-18s | Mar 23, 2026 |
| Google Vertex AI | Prohibited | n/a | Same ban for all Generative AI Services, extended to end users (s.20(d)); immediate suspension allowed (s.20(f)) | Undated page (note dated Feb 18, 2026) |
| Workspace for Education / Gemini for Education | Not a developer API | n/a | A school-managed product, not something Apex Scholar can build on | Undated |
| Azure OpenAI / Foundry | Unclear; no prohibition found | Not found | Code of Conduct has no age rule; Mistral models on Foundry require parental consent | Code of Conduct v4.0, May 1, 2026 |
| Amazon Bedrock | Unclear; depends on model | Not found | No Bedrock age rule found; OpenAI models on Bedrock carry the parental-consent rule | Service Terms Nov 5, 2026 |
| Mistral | Allowed with conditions | Not found | Legally adequate parental consent; no personal data of under-13s | Sep 25, 2026 |
| xAI (now "SpaceXSI") | Unclear | Yes, 18+ | Nothing found about a developer's end users | ToS Oct 27, 2026; FAQ Feb 25, 2025 |
| DeepSeek | Unclear; probably conditions | Not stated in platform terms | End users must follow DeepSeek's consumer terms (18+, minors need guardian consent); PRC law; data held in China | Platform terms Apr 29, 2026 |
| Alibaba Qwen (Model Studio) | Unclear; own documents conflict | Minors may register with parental permission | Privacy Policy says minors must not use the Cloud Services at all | Both Sep 4, 2026 |
| Moonshot Kimi | Allowed with conditions | Yes, 18+ for individuals | Parental consent; no personal data of under-14s | Jul 30, 2026 |
| Zhipu GLM (Z.ai) | Unclear; no prohibition found | No; a minor reviews terms with a guardian | No apps inappropriate for minors; under-13 data only as COPPA allows | Apr 14, 2026 |
| Cohere | Allowed with conditions (Usage Policy); older terms may conflict | Age of majority | AI disclosure; child-safety law; controls such as age verification and moderation | Usage Policy Nov 21, 2024 |
| MiniMax | Unclear | Under-18s need guardian consent | Nothing found about end users | Mar 30, 2026 |

### Cited Findings

**OpenAI**
- The Services Agreement's restrictions bar the customer, and its end users, from doing the following: "allow minors to use OpenAI Services without consent from their parent or guardian". The same list bars circumventing rate limits or Usage Limits and bars buying, selling or transferring API keys. Updated Dec 1, 2025, effective Jan 1, 2026 — [OpenAI Services Agreement](https://openai.com/policies/services-agreement/)
- Organizations serving under-18s must comply with child protection, safety and privacy law, including COPPA. They must take reasonable steps to keep content age-appropriate: AI disclosures, content filters, monitoring with escalation paths, and age assurance where required or appropriate. The page is undated and does not mention parental consent — [Under-18 API guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)
- The same page says not to process personal data of under-13s (or under the local age of digital consent) without first implementing zero data retention. It recommends the most current flagship models for minor-facing products. OpenAI may audit, warn, suspend or terminate — [Under-18 API guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)
- The Usage Policies bar endangering under-18s and exposing minors to age-inappropriate content. They also list academic dishonesty as a prohibited use. The posted version takes effect Nov 20, 2026; the prior version is dated Oct 29, 2025 — [OpenAI Usage Policies](https://openai.com/policies/usage-policies/)

**Anthropic**
- The Commercial Terms have no clause on age or minors. Effective Jun 17, 2025 — [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms)
- The Usage Policy lists products serving minors, including those letting minors interact directly with API-based products, as a use case that must follow additional guidelines and applicable law. It defines a minor as anyone under 18. The posted version is dated Nov 12, 2026 — [Anthropic Usage Policy](https://www.anthropic.com/legal/aup)
- The serving-minors article sets out what organizations must do:
  - add safeguards suited to their use case, such as age verification, content moderation, monitoring and reporting, and educational resources;
  - comply with laws such as COPPA and state that compliance on their website;
  - tell users they are talking to an AI, not a human.

  Anthropic audits periodically and may require changes, suspend or terminate. No age floor or approval process is stated. Dated Mar 16, 2026 — [Anthropic: serving minors](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)
- The Usage Policy also treats some education uses as high-risk, needing qualified human review and disclosure. These include grading an assessment that decides admission, graduation or certification (outside multiple choice) and academic misconduct decisions — [Anthropic Usage Policy](https://www.anthropic.com/legal/aup)

**Google**
- Gemini API: you must be 18 or older, and the Services may not be used in a site directed at or likely to be accessed by under-18s. This sits in the general terms, not the unpaid-tier section. Effective Mar 23, 2026 — [Gemini API Additional Terms](https://aistudio.google.com/docs/terms)
- Vertex AI: Cloud Service Terms s.20(d) says the customer will not, and will not let end users, use any Generative AI Service in a site directed at or likely to be accessed by under-18s. s.20(f) allows immediate suspension or termination on a suspected violation — [Google Cloud Service Terms](https://cloud.google.com/terms/service-terms)
- Workspace for Education offers the Gemini app and Notebook to students, with stricter content policies for under-18s. Google pages conflict on the age floor: one says all ages, another says 13+ — [Workspace quickstart](https://support.google.com/a/answer/16350447?hl=en); [Gemini for Education](https://edu.google.com/ai/gemini-for-education/)
- On Google's developer forum, a tutoring business asked on Oct 17, 2026 whether the Gemini API can serve under-18 students, and whether a paying parent account changes anything. The only reply (Oct 23, 2026, no staff badge visible) declined to give legal guidance and pointed back to the terms — [Google AI forum thread](https://discuss.ai.google.dev/t/can-gemini-api-be-used-in-an-educational-platform-for-students-under-18/190152)

**Microsoft Azure OpenAI / Foundry**
- The Code of Conduct sets no minimum age. It bars:
  - exploiting vulnerabilities due to age;
  - inferring a person's specific age (age ranges are excluded);
  - erotic or romantic chatbots.

  It requires AI disclosure, input and output controls, abuse reporting channels, and any notices and consents that law requires. Version 4.0, May 1, 2026 — [Microsoft AI Code of Conduct](https://learn.microsoft.com/en-us/legal/ai-code-of-conduct)
- Mistral models sold through Foundry bar sending under-13 personal data and bar minor use without parental consent — [Foundry model-specific terms](https://learn.microsoft.com/en-us/legal/microsoft-foundry/model-specific-terms)
- Prompts and completions are not available to OpenAI, not used by model providers, and not used to train foundation models without permission — [Azure data privacy](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy)
- Microsoft Q&A answers saying OpenAI's age rules carry over to Azure come from volunteers, not policy — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/1290416/does-azure-open-ai-service-have-age-restriction-fo)

**Amazon Bedrock**
- The AWS Responsible AI Policy bars harm or abuse of a minor and sets no age rule. It makes the customer and its end users responsible for decisions based on outputs. Updated Jan 13, 2025 — [AWS Responsible AI Policy](https://aws.amazon.com/ai/responsible-ai/policy/)
- The third-party model terms on Bedrock include OpenAI's parental-consent restriction for OpenAI models, and Anthropic's commercial terms for Claude — [Bedrock third-party model terms](https://aws.amazon.com/legal/bedrock/third-party-models/)
- The only COPPA / under-13 parental-consent wording I found in the Service Terms is tied to Amazon Lex, not Bedrock. Updated Nov 5, 2026 — [AWS Service Terms](https://aws.amazon.com/service-terms/)
- Bedrock inputs and outputs are not shared with model providers or used to train base models — [Bedrock security and privacy](https://aws.amazon.com/bedrock/security-privacy-responsible-ai/)

**Mistral**
- Commercial Terms s.2.2(c) bars two things: including personal information of under-13s (or under the local digital-consent age) as Customer Data, and letting minors use the products without legally adequate parental or guardian consent. Effective Sep 25, 2026 — [Mistral Commercial Terms](https://legal.mistral.ai/terms/commercial-terms-of-service)
- The Usage Policy bans CSAM. No age rule was found in it. Effective Jun 11, 2026 — [Mistral Usage Policy](https://legal.mistral.ai/terms/usage-policy)

**xAI (the site now brands the company "SpaceXSI")**
- The enterprise terms describe themselves as for business users of the API who are at least 18. Updated Oct 27, 2026. A follow-up search of the same page for minor or end-user clauses returned nothing — [xAI Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)
- The FAQ says you must be 18 or older to use the API. Last updated Feb 25, 2025 — [xAI Enterprise FAQ](https://x.ai/legal/faq-enterprise)
- The Acceptable Use Policy bars sexualizing or exploiting children. Effective Aug 14, 2026 — [xAI AUP](https://x.ai/legal/acceptable-use-policy)

**DeepSeek**
- Platform terms tell under-18s to read the terms with a guardian. They make the developer ensure end users comply with DeepSeek's Terms of Use and manage end users' behavior (s.3.1-3.2). PRC law governs, with courts at the Hangzhou registered office (s.10). Effective Apr 29, 2026 — [DeepSeek Open Platform Terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html)
- The consumer Terms of Use say the Services are mainly for adults and users must be 18 (or the local minimum). Minors may use them only with guardian consent (s.2.1). Updated Mar 27, 2026 — [DeepSeek Terms of Use](https://cdn.deepseek.com/policies/en-US/deepseek-terms-of-use.html)
- The privacy policy says services are not aimed at children and personal data is stored in the PRC. Data of end users of developer apps is outside the policy. Updated Feb 10, 2026 — [DeepSeek Privacy Policy](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html)

**Alibaba Qwen (Model Studio)**
- The Privacy Policy says the platform and Cloud Services are not intended for under-18s, and minors must not use them for any purpose. Updated Sep 4, 2026 — [Alibaba Cloud Privacy Policy](https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-privacy-policy)
- Terms of Use s.1.5 instead lets a minor register and use an account with parental permission. Updated Sep 4, 2026 — [Alibaba Cloud Terms of Use](https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-terms-of-use-alibaba-cloud-international-website-terms-of-use)

**Moonshot Kimi**
- Individuals must be at least 18 (or the local consent age). The prohibited-uses list bars sending personal information of under-14s (or under the local digital-consent age) and bars letting minors use the Services without parental consent. Updated Jul 30, 2026 — [Kimi Open Platform Terms](https://platform.kimi.ai/docs/agreement/modeluse)

**Zhipu GLM (Z.ai)**
- The Terms bar:
  - uses that endanger children, and developing apps "inappropriate for minors" (s.III.3(j));
  - processing under-13 personal information in violation of COPPA (s.III.11(c)).

  Z.ai disclaims liability for minors and recommends guardian supervision (s.IX.8). Singapore law. Updated Apr 14, 2026 — [Z.ai Terms of Use](https://docs.z.ai/legal-agreement/terms-of-use)

**Cohere**
- If a customer application interacts with minors, the customer must comply with child-safety regulations and add controls such as age verification and content moderation. All chatbots must disclose that they are AI. Updated Nov 21, 2024 — [Cohere Usage Policy](https://docs.cohere.com/docs/usage-policy)
- The older Terms of Use require the age of majority and restrict material harmful to or targeted at minors (s.13.3). I did not confirm the scope of that restriction. Updated Sep 7, 2022 — [Cohere Terms of Use](https://cohere.com/terms-of-use)
- The SaaS Agreement is dated Apr 8, 2025. I did not confirm any minors clause in it — [Cohere SaaS Agreement](https://cohere.com/saas-agreement)

**MiniMax**
- An under-18 should read the agreement with a guardian and get their consent before using the Service. End users are not third-party beneficiaries. Singapore law. Effective Mar 30, 2026 — [MiniMax Terms](https://platform.minimax.io/protocol/terms-of-service)

### Inferences
- Paying Google does not remove the ban, because the under-18 restriction sits in the general Gemini API terms and Vertex has its own version. Claude or other partner models run through Vertex may also fall under s.20(d), but I did not confirm whether partner models count as Google "Generative AI Services".
- Guest access is the weakest point for any provider whose terms require parental consent (OpenAI, Mistral, Kimi, and in effect DeepSeek and MiniMax). None of the texts says how consent must be obtained, and a guest flow collects none.
- Anthropic's text requires no parental consent. It does require a public COPPA statement, AI disclosure and safeguards, and Anthropic says it audits.
- Under-13 users are a separate trigger. OpenAI requires ZDR first; Mistral and Kimi bar the data entirely (Kimi from under 14).

### Gaps
- Microsoft Product Terms: the page I reached showed no minor or child terms, but it may have been a partial page. Unconfirmed.
- The full current Bedrock section of the AWS Service Terms was not read.
- Anthropic's Nov 12, 2026 Usage Policy and OpenAI's Nov 20, 2026 Usage Policies were not compared with the versions currently in force.
- Alibaba's Model Studio product terms and the Qwen model licences were not read.

## What free API access exists, and what happens to the data?

### Takeaway
No provider that clearly allows teens has a recurring free API tier without a catch. OpenAI's daily free tokens require sharing traffic with OpenAI. Cohere's trial key is recurring but tiny, and its production-use rules are unconfirmed. Z.ai's free Flash models are the only recurring free option found, and Z.ai's minors position is unclear. Everything else is a one-time credit or nothing.

### Cited Findings
- **OpenAI:**
  - The usage-tier table lists a Free tier (allowed geographies, $100/month usage limit), but the pricing page shows no free text-token allowance — [OpenAI rate limits](https://developers.openai.com/api/docs/guides/rate-limits); [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
  - Some organizations get daily complimentary tokens, but only on traffic shared with OpenAI. Build orgs get up to 250,000 tokens in one model group and 2.5M in another; Launch and Grow orgs get 1M and 10M. Fine-tuned models, evals and tools are excluded. Page updated about mid-Oct 2026 — [OpenAI data-sharing help](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai)
  - Without opting in, API data is not used for training. Abuse-monitoring logs are kept up to 30 days, and ZDR needs OpenAI's prior approval via sales — [OpenAI your data](https://developers.openai.com/api/docs/guides/your-data)
- **Anthropic:**
  - New users get a small amount of free credits for testing; there is no free tier — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
  - API inputs and outputs are deleted within 30 days by default, with exceptions such as flagged content — [Claude privacy center](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)
  - ZDR is requested through sales — [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
- **Google (unpaid tier, prohibited for this use anyway):**
  - Content is used to improve products, human reviewers may read it, and Google says not to submit personal information — [Gemini API Additional Terms](https://aistudio.google.com/docs/terms)
  - Flash and Flash-Lite models are free of charge on the unpaid tier. Exact per-model RPM and RPD appear only inside AI Studio — [Gemini pricing](https://aistudio.google.com/docs/pricing); [Gemini rate limits](https://aistudio.google.com/docs/rate-limits)
- **Mistral:**
  - Mistral's own docs conflict on free API access. The admin docs say Free mode includes a monthly budget for Vibe and Studio but no API access; creating API keys requires activating pay-as-you-go billing — [Mistral usage and limits](https://docs.mistral.ai/admin/user-management-finops/tier)
  - The Vibe 2.0 announcement says free API use remains on the Experiment plan — [Mistral Vibe 2.0](https://mistral.ai/news/mistral-vibe-2-0/)
  - Free-tier data may be used for training, with an opt-out in the Admin panel — [Mistral opt-out](https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training)
- **Azure:**
  - No free token allowance was found. Azure for Students gives $100 for 12 months, but only to full-time students at accredited two- to four-year degree-granting institutions — [Azure Education Hub FAQ](https://learn.microsoft.com/en-us/azure/education-hub/azure-dev-tools-teaching/program-faq)
  - A $200 / 30-day trial is mentioned only in Q&A answers — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5825359/azure-free-students-credits)
- **AWS:**
  - New accounts get $100 in credits, can earn up to $100 more, and Bedrock is on the Free plan. The plan ends after 6 months or when credits run out. It is one-time, and anyone who has previously had an AWS account is ineligible — [AWS Free Tier announcement](https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan/); [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/)
- **xAI:**
  - No free API tier was found. The FAQ says xAI may offer free credits in exchange for permission to train on business data. Data is deleted within 30 days unless flagged — [xAI Enterprise FAQ](https://x.ai/legal/faq-enterprise)
- **DeepSeek:**
  - The terms mention a "free quota for paid services" set on product pages, with no amount stated — [DeepSeek Open Platform Terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html)
- **Alibaba Qwen:**
  - 1M free tokens each on qwen3.7-flash, qwen3.8-flash and qwen3.7-plus, valid 90 days. Singapore / International deployment only, granted on first activation — [Model Studio pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing); [Free quota](https://www.alibabacloud.com/help/en/model-studio/new-free-quota)
- **Kimi:**
  - No free inference credits were found; only file-related APIs are temporarily free — [Kimi pricing](https://platform.kimi.ai/docs/pricing/chat)
- **Zhipu (Z.ai):**
  - GLM-4.7-Flash and GLM-4.5-Flash are free for input and output. No rate or concurrency limits are stated — [Z.ai pricing](https://docs.z.ai/guides/overview/pricing)
  - API content is not used to develop or improve services unless the customer explicitly agrees (s.IV.7) — [Z.ai Terms of Use](https://docs.z.ai/legal-agreement/terms-of-use)
- **Cohere:**
  - Trial keys get 20 chat requests per minute and 1,000 API calls per month. The page calls evaluation keys free but limited and does not address production use — [Cohere rate limits](https://docs.cohere.com/docs/rate-limits)
- **MiniMax:**
  - No free tier was found. MiniMax may use inputs and outputs to develop and improve its services — [MiniMax Terms](https://platform.minimax.io/protocol/terms-of-service)

### Inferences
- OpenAI's complimentary-token program would mean sharing teens' prompts with OpenAI. Nothing I read says whether that is acceptable for minors. It also sits awkwardly with OpenAI's under-13 ZDR requirement, since ZDR and data sharing pull in opposite directions.
- Cohere's 1,000 calls a month is far too small for a live site.
- Z.ai's free models have no published limits, and the Z.ai terms are unclear on teen-facing apps.

### Gaps
- OpenAI Free-tier per-model RPM and RPD were not found on public pages.
- DeepSeek's free-quota amount was not found.
- Cohere trial-key terms on production use were not found.

## Cheapest compliant paid option

### Takeaway
Among providers that expressly allow teen end users, Claude Haiku 5.5 and OpenAI gpt-6-luna both cost $0.10 input and $0.50 output per 1M tokens. Neither trains on API data by default, and both keep data up to 30 days unless ZDR is approved. OpenAI's gpt-5-nano is cheaper but may not meet OpenAI's own "current flagship" recommendation for minors.

### Prices (USD per 1M tokens, input / output)
| Provider | Model | Price | Training default | Retention / ZDR |
|---|---|---|---|---|
| Anthropic | Claude Haiku 5.5 (prompts up to 100k tokens) | $0.10 / $0.50; Batch 50% off | Not trained on | 30 days; ZDR via sales |
| OpenAI | gpt-6-luna | $0.10 / $0.50 | Not trained on unless opted in | 30-day abuse logs; ZDR needs approval |
| OpenAI | gpt-5-nano | $0.05 / $0.40 | Same | Same |
| OpenAI | gpt-4o-mini | $0.15 / $0.60 | Same | Same |
| Mistral | Mistral Small 4 | $0.15 / $0.60 (search snippet; confirm) | Paid-tier default not confirmed | ZDR doc exists |
| Kimi | K3 series | Price not loaded | Not confirmed | Not confirmed |
| Azure OpenAI | GPT-5.4 mini / nano, GPT-4.1-mini, gpt-4o-mini | Prices did not render | Not trained on | Not confirmed |
| Bedrock | Claude Haiku / Nova | Not shown in the parts read | Not shared with providers, not used to train | Not confirmed |
| Bedrock | GPT OSS Safeguard 20B (US regions) | $0.07 / $0.20 | Same | Not confirmed |
| Google (barred) | gemini-3.1-flash-lite | $0.25 / $1.50 | Paid tier not trained on | Limited logging |
| xAI (unclear) | grok-4.3 | $1.25 / $2.50 | Not trained on without permission | 30 days; optional ZDR |
| DeepSeek (unclear) | deepseek-flash | About $0.15–0.30 / $0.60–1.20 off-peak/peak (column labels unclear) | Not confirmed for API | Data in PRC |
| Qwen (conflicting docs) | qwen3.7-flash, up to 32k tokens | $0.03 / $0.13 | Not confirmed | Not confirmed |
| Zhipu (unclear) | GLM-5.3-Flash | $0.15 / $0.50; GLM-4.7-Flash free | Not trained on unless agreed | Not confirmed |
| MiniMax (unclear) | MiniMax-M3.1-Flash | $0.15 / $0.60 | May use inputs to improve services | Not confirmed |

### Cited Findings
- Claude Haiku 5.5 costs $0.10 / $0.50 for prompts up to 100,000 tokens and $0.50 / $2.50 above that. Haiku 4.5 costs $1 / $5. Batch API is 50% off — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Anthropic may not train on Customer Content from the Services — [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms)
- OpenAI prices: gpt-6-luna $0.10 / $0.50, gpt-5-nano $0.05 / $0.40, gpt-4o-mini $0.15 / $0.60, gpt-5-mini $0.25 / $2.00. Batch is about half price — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- OpenAI uses Customer Content only to provide the Services unless the customer explicitly agrees otherwise — [OpenAI Services Agreement](https://openai.com/policies/services-agreement/)
- Mistral Small 4 is listed at $0.15 / $0.60 (from a search snippet of the pricing page). The pricing page I fetched showed only Mistral Large at $0.50 / $1.50 — [Mistral API pricing](https://docs.mistral.ai/inference/pricing); [Mistral pricing](https://mistral.ai/pricing/)
- Azure lists GPT-5.4 mini / nano and GPT-4.1-mini, but the price fields did not render — [Azure OpenAI pricing](https://azure.microsoft.com/en-us/pricing/details/azure-openai/)
- Bedrock lists GPT OSS Safeguard 20B at $0.07 / $0.20 in US regions. Claude Haiku and Nova prices were not in the parts read — [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- Gemini paid-tier prices: gemini-3.1-flash-lite $0.25 / $1.50; gemini-3.8-flash $0.75 / $3.75 until Dec 31, 2026, then $1.50 / $7.50 — [Gemini pricing](https://aistudio.google.com/docs/pricing)
- grok-4.3 is $1.25 / $2.50 and grok-4.7 is $2 / $6. API data is kept 30 days by default; ZDR is a console setting — [xAI models](https://docs.x.ai/developers/models); [xAI security FAQ](https://docs.x.ai/developers/faq/security)
- DeepSeek: off-peak is 50% of peak, effective Sep 10, 2026. Column labels were unclear in the search result — [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- Qwen and Z.ai prices — [Model Studio pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing); [Z.ai pricing](https://docs.z.ai/guides/overview/pricing)
- MiniMax-M3.1-Flash is $0.15 / $0.60 — [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview)

### Inferences
- If guests or users under 13 are kept, OpenAI requires approved ZDR for under-13 personal data, and approval is not guaranteed. Anthropic needs no ZDR but does need a public COPPA statement and safeguards.

### Gaps
- Azure, Bedrock-Claude, Kimi and Mistral paid prices are unconfirmed.
- Mistral's paid-tier training default is unconfirmed.

## Do free tiers ban pooling several accounts or keys?

### Takeaway
Rotating 11 Gemini keys gains nothing if they share one project, because limits apply per project. If they are spread across projects to multiply quota, that plausibly breaches Google's ban on circumventing API limits, though no Google text names the pattern. OpenAI and Cohere have express clauses.

### Cited Findings
- **Google:**
  - Gemini rate limits apply per project, not per API key — [Gemini rate limits](https://aistudio.google.com/docs/rate-limits)
  - Developers agree not to try to circumvent documented API limits, and need Google's express consent to go beyond them (s.2(d)). Last modified Nov 9, 2021 — [Google APIs Terms of Service](https://developers.google.com/terms)
  - The Gemini API additional terms have no clause on multiple accounts, keys or quota circumvention — [Gemini API Additional Terms](https://aistudio.google.com/docs/terms)
- **OpenAI:** bars circumventing rate limits, configuring the Services to avoid Usage Limits, and transferring API keys — [OpenAI Services Agreement](https://openai.com/policies/services-agreement/)
- **Cohere:** bars registering more than one account (s.13.3) — [Cohere Terms of Use](https://cohere.com/terms-of-use)
- **Mistral:** bars buying, selling or transferring API keys or accounts to or from third parties (s.2.2(h)), and bars circumventing security or moderation (s.2.2(f)) — [Mistral Commercial Terms](https://legal.mistral.ai/terms/commercial-terms-of-service)
- **Anthropic, DeepSeek, Kimi, Z.ai:** no express multi-account clause found. DeepSeek and Kimi can prohibit re-registration after a breach — [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms); [DeepSeek Open Platform Terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html); [Z.ai Terms of Use](https://docs.z.ai/legal-agreement/terms-of-use)

### Inferences
- The Gemini key-rotation question matters less than the age ban: under the current terms, Apex Scholar may not use the Gemini API at all.

### Gaps
- I have not checked whether Apex Scholar's 11 keys sit in one project or several. That is in the project config, not covered by this research.
