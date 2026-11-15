# Alternatives to free API tiers for serving teens with AI, and the law that applies (as of 7 Nov 2026)

Research notes, not legal advice. They report what the texts say and flag where it's unclear. "Unconfirmed" means the primary page would not load or was not checked. Firecrawl credits ran out partway through, so some items rest on search summaries, and those are labelled.

Context check: the project's `CLAUDE.md` says the AI proxy is `netlify/functions/ai-proxy` with 11 rotating keys, not a Cloudflare Worker. Hosting doesn't change any finding below, except that the Cloudflare Workers AI route assumes a Cloudflare account.

## 1. Grants and credits: which could Apex Scholar actually get, and do they allow a teen audience?

### Takeaway
Hack Club AI is the only programme found that an unincorporated 18-year-old can use today with no application, and it is the only one built for teens. But its rules cap spend at $3 a day, limit it to people "18 and under", and say any tool giving others access must make them follow the same rules. Every startup programme checked (Cloudflare, AWS, NVIDIA, Microsoft, probably Google) needs a company. The nonprofit routes need 501(c) status. The open-source maintainer programmes give the maintainer a subscription, or credits for maintainer work, not credits to serve an app's users. Google credits can't fix the core problem either, because Google Cloud's generative AI terms carry the same under-18 ban.

### Cited Findings

**Hack Club (AI proxy, HCB)**
- Hack Club AI offers "Every model on OpenRouter, plus image generation, embeddings, web search and OCR, behind one OpenAI-compatible API. No credit card." Its usage dashboard lets the account holder "inspect what was sent" — [Hack Club AI](https://ai.hackclub.com/)
- The rules say "This service is for teens 18 and under only." They allow 7,500 requests per 30 minutes per user and "$3 per day across all endpoints" per account, with HTTP 402 over the limit; higher limits by email. Reselling is banned ("use it to create a service that resells AI to others"). The rules also say "You are not allowed to use this service to create proxies or other tools that allow others to access the API without them also abiding by these rules." Explicit or harmful content is banned; 403 means "banned, needs identity verification, or the request was blocked" — [Hack Club AI rules](https://docs.ai.hackclub.com/guide/rules.html)
- Hack Club describes itself as for teens aged 13 to 18 — [Hack Club](https://hackclub.com/)
- The upstream, OpenRouter, requires users to be 18: "You must be at least 18 years of age to use the Service" (last updated 31 Aug 2026) — [OpenRouter Terms](https://openrouter.ai/terms)
- HCB fiscal sponsorship takes 7% of revenue. It gives "tax-deductible 501(c)(3) status" for foundation grants, files Form 990, and accepts donations. The page states no age limit or teen-led requirement — [HCB](https://hackclub.com/fiscal-sponsorship/)

**GitHub Student Developer Pack**
- AI benefits: Copilot Student ("unlimited code completions" plus a set allowance of AI credits; auto model selection only), a Camber student plan, and Microsoft 365 Copilot access. No GPUs and no inference API credits. The $100 Azure credit is for students "aged 18+", and a separate 13-17 Azure offer lists no credit — [GitHub Education Pack](https://education.github.com/pack)
- Copilot Student: eligibility is reassessed monthly; the docs state no minimum age and say nothing on use for public apps — [GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students)
- GitHub Models, the old free inference API, is gone: "As of July 30, 2026, GitHub Models has been fully retired" — [GitHub Docs](https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models)
- Azure for Students gives $100 for 12 months. It is "Available only to full-time university students" and the account is "expressly for the support of education or teaching, non-commercial research" — [Azure for Students](https://azure.microsoft.com/en-us/free/students)

**Cloudflare**
- Cloudflare for Startups Tier 3 gives $10k for bootstrapped companies or those under $1M raised, with Workers AI capped at $2,500, for one year. Every applicant must be "a for-profit business using a business email", incorporated no more than 10 years ago, with a live website. Personal emails are not accepted. Government and civic projects are pointed to the Athenian Project and Project Galileo — [Cloudflare for Startups](https://www.cloudflare.com/forstartups/)
- Workers AI has a no-application free allowance of 10,000 Neurons a day, then $0.011 per 1,000 Neurons on Workers Paid (page updated 20 Oct 2026) — [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Project Alexandria: **unconfirmed**, the page returned 403.

**Anthropic**
- Claude for Open Source gives "6 months of free Claude Ultra", a subscription, with no API credits mentioned. Criteria include "500 or more dependent repos", "200,000 or more combined monthly downloads", 100+ PRs merged into others' repos in 12 months, or a repo with 20+ external contributors; "apply anyway" is allowed — [Claude for OSS](https://claude.com/contact-sales/claude-for-oss)
- The education offering is "A comprehensive university-wide plan for institutions", with a separate "Claude for Teachers" for K-12 teachers. No student-builder or API-credit programme appears — [Claude for Education](https://claude.com/solutions/education)
- AI for Science gives free API credits to researchers on high-impact science, with a biology and life-sciences emphasis (page modified 19 Oct 2026) — [Anthropic](https://www.anthropic.com/news/ai-for-science-program)
- Claude for Nonprofits: **unconfirmed** at source (the page redirected). Secondary sources say it covers 501(c)(3)s and K-12 schools, is validated by Goodstack, and gives seat discounts, not API credits — [search summary of Claude help and press](https://support.claude.com/en/articles/12893767-getting-started-with-claude-for-nonprofits)
- Anthropic's API does allow organisations to serve minors, with conditions (see section 4) — [Anthropic minors guidelines](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)

**OpenAI**
- Codex for Open Source gives six months of ChatGPT Pro with Codex, plus API credits "for projects that use Codex in pull request review, maintainer automation, release workflows, or other core open-source work". No amounts are stated on the page — [Codex for OSS](https://developers.openai.com/community/codex-for-oss). Secondary reports put the fund at $1M, with grants of up to $25,000 in API credits — [Daniel Vaughan blog, Mar 2026](https://codex.danielvaughan.com/2026/03/31/codex-open-source-fund)
- Researcher Access gives up to $1,000 in API credits for studying responsible deployment and societal impact; credits expire after one year — [OpenAI Help](https://help.openai.com/en/articles/10139500-researcher-access-program-faq)
- Nonprofits: OpenAI's help centre says nonprofit discounts are for ChatGPT Business and Enterprise seats only, not the API (search summary) — [OpenAI Help](https://help.openai.com/en/articles/9359041-openai-for-nonprofits)

**Google**
- Google Cloud's generative AI terms carry the same age ban as the Gemini API: "Customer will not, and will not allow End Users to, use a Generative AI Service as part of a website, Customer Application, or other online service that is directed towards or is likely to be accessed by individuals under the age of 18." — [Google Cloud Service Specific Terms s.20(d)](https://cloud.google.com/terms/service-terms)
- The Gemini API terms (effective 23 Mar 2026) say "You must be 18 years of age or older to use the APIs" and ban services "likely to be accessed by individuals under the age of 18" — [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms)
- Google for Startups Cloud Program: **unconfirmed** (the page didn't render).
- Google for Education: not researched within budget.

**Microsoft, AWS, NVIDIA, Modal**
- Microsoft for Startups offers up to $150,000 over time, with $5,000 unlocked "through business verification", aimed at "early-stage startups building software products" — [Microsoft for Startups](https://www.microsoft.com/en-us/startups)
- AWS Activate Founders starts at $1,000 and goes up to $5,000. It requires pre-Series B, founded within 10 years, and a paid-tier account — [AWS Activate](https://aws.amazon.com/startups/credits)
- AWS Imagine Grant requires "a registered 501(c) status based in the United States" and excludes educational institutions. The 2026 cycle is closed, with winners announced 1 Dec — [AWS Imagine Grant](https://aws.amazon.com/government-education/nonprofits/aws-imagine-grant-program/)
- NVIDIA Inception requires an officially incorporated company with a functioning website, under 10 years old — [NVIDIA Inception](https://www.nvidia.com/en-us/startups/)
- Modal gives $30 a month free compute on Starter, plus startup grants and "up to $10k" for "Graduate students, labs, and researchers" — [Modal pricing](https://modal.com/pricing)

### Inferences
- Hack Club AI fits the budget on paper. $3 a day is about $90 a month, and at the token prices in section 3 that covers roughly 3,000 to 8,000 short requests a day on a cheap model. It has three structural problems:
  1. Apex takes users from 13 up with no upper limit (seniors who turn 18, teachers, adults), but the "also abiding by these rules" clause appears to require all end users to be 18 and under.
  2. The developer is 18 now and ages out.
  3. Hack Club can see prompts, which has to go in the privacy policy.
- Asking Hack Club in writing whether a public, ad-free study site may proxy for 13-18-year-old users is cheap and decisive. Their rules don't settle it.
- Fiscal sponsorship through HCB is the most plausible path into the nonprofit programmes (Anthropic and OpenAI seat discounts, AWS Imagine). Whether Goodstack or AWS accept a fiscally sponsored project rather than its own 501(c) is **unconfirmed**. AWS's "registered 501(c) status" wording suggests not.
- Google for Startups credits could only fund non-Google compute, such as self-hosted open models on Cloud Run. Whether a self-hosted Gemma counts as a Google "Generative AI Service" under s.20(d) is ambiguous; most likely not, since the customer runs it, but unconfirmed.
- Cloudflare's free Workers AI allowance is the only no-application, no-incorporation compute route besides Hack Club. Whether Cloudflare's terms restrict minors was not checked (**unconfirmed**).

### Gaps
- Google for Startups eligibility and amounts; Google for Education; Project Alexandria; Anthropic nonprofit terms at source; whether any programme accepts HCB-sponsored projects; Cloudflare and Workers AI terms on minors.

## 2. Do open-weight licences permit serving minors?

### Takeaway
None of the licences or use policies checked bar minors as end users. The child-related clauses cover abuse material and unlawful distribution of obscene content to minors without legally required age-gating. Apache 2.0 and MIT carry no use restrictions at all. Age obligations come from law and from the hosting provider's terms, not from the weights.

### Cited Findings
- Llama 4 Acceptable Use Policy s.1(a)(ii) bans "Exploitation or harm to children, including the solicitation, creation, acquisition, or dissemination of child" exploitative content. s.1(a)(iv) bans "The illegal distribution of information or materials to minors, including obscene materials" and "failure to employ legally required age-gating in connection with such information or materials". There is no general bar on minor users — [Meta Llama 4 Use Policy](https://dev.meta.ai/llama/llama4/use-policy/)
- Gemma Prohibited Use Policy (last modified 21 Feb 2024): the only child clause is "Promoting or generating content related to child sexual abuse or exploitation;" with no age restriction on users — [Google](https://ai.google.dev/gemma/prohibited_use_policy)
- gpt-oss-120b usage policy, in full: "We aim for our tools to be used safely, responsibly, and democratically, while maximizing your control over how you use them." and "By using OpenAI gpt-oss-120b, you agree to comply with all applicable law." Nothing on minors — [Hugging Face, openai/gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b/blob/main/USAGE_POLICY)
- Licence types (secondary, Oct 2026; check each LICENSE file):
  - DeepSeek V4 and V4.1 are MIT, but V4 is text-only.
  - Qwen3.5's flagship is a native vision-language model under Apache 2.0.
  - Gemma 4 is Apache 2.0.
  - Mistral Small 4 is Apache 2.0; Mistral Medium 3.5 is modified MIT with a $20M-revenue condition.
  - GLM-5.x and Kimi use custom or modified terms.
  - Sources: [Transmit Security, 2026](https://transmitsecurity.com/blog/which-open-source-ai-model-should-you-actually-use-in-2026), [Kevin Welter, 26 Oct 2026](https://kevinwelter.com/en/blog/open-source-ki-modelle), [Slash Digital, 27 Oct 2026](https://slash-digital.io/en/insights/open-weight-models-2026/), [Shattered.io](https://shattered.io/open-weight-ai-models-side-by-side-the-spec-sheet/)
- Licences are drifting toward custom terms; one cautionary example is a "modified-mit" card whose file "added banned uses" — [Slash Digital](https://slash-digital.io/en/insights/open-weight-models-2026/)
- Llama 4 grants companies based in the EU no rights to its multimodal models (secondary). This is irrelevant to a US developer — [Kevin Welter](https://kevinwelter.com/en/blog/open-source-ki-modelle)

### Inferences
- The Llama AUP's age-gating clause bites only where law already requires age-gating for specific content. A study tool that blocks explicit content is unaffected.
- Whether Gemma 4's move to Apache 2.0 retires the Gemma Prohibited Use Policy for Gemma 4 weights is **unconfirmed**. Either way, that policy has no minors clause.

### Gaps
- Llama 4 Community License text (the page redirected and wasn't re-fetched), Qwen, GLM and Mistral licence files at source, and the DeepSeek V4 model card at source.

## 3. Self-hosting cost for 500-2,000 vision and text requests a day

### Takeaway
At this volume, per-token hosted open-weight inference costs roughly $5 to $30 a month, which beats scale-to-zero GPUs at roughly $40 to $300 a month. Cold starts on 15-60 GB vision models also make the GPU route slow. Modal's $30 a month free credit is the only standing free GPU compute found.

### Cited Findings
- Workers AI: 10,000 free Neurons a day, then $0.011 per 1,000. `@cf/google/gemma-4-26b-a4b-it` costs $0.100/M input and $0.300/M output tokens. `@cf/meta/llama-3.2-11b-vision-instruct` costs $0.049/M input and $0.676/M output. `@cf/moondream/moondream3.1-9B-A2B` costs $0.300 and $1.000 — [Workers AI pricing, 20 Oct 2026](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Modal: $30/month free. L4 $0.000222/s, A10 $0.000306/s, L40S $0.000542/s, A100-80GB $0.000694/s — [Modal pricing](https://modal.com/pricing)
- RunPod serverless: flex workers "scale to zero"; billing covers cold start "From when the worker starts until your handler is ready" — [RunPod docs](https://docs.runpod.io/serverless/pricing). The 24 GB flex class is about $0.69/hr (~$0.00019/s) per a third-party read on 23 Sep 2026, so treat it as secondary — [search summary citing flexprice.io](https://flexprice.io/blog/runprod-pricing-guide-with-gpu-costs)
- Cloud Run: L4 24 GB GPUs can scale to zero; GPU is billed for the whole instance lifecycle. About $0.000233/GPU-second in Tier 1 regions, plus CPU and RAM; this rate is secondary and unconfirmed against Google's page — [Cloud Run GPU docs](https://docs.cloud.google.com/run/docs/configuring/services/gpu), [gmicloud summary](https://www.gmicloud.ai/en/blog/cloud-run-gpu-pricing-explained)

### Inferences (my arithmetic, not sourced figures)
- **Workers AI, Gemma 4 26B.** Assume about 2,000 input tokens (including an image) and 500 output tokens per request. That is about $0.00035 per request: roughly $5/month at 500 a day and $21/month at 2,000 a day, before the free Neurons and the Workers Paid base fee. The base fee is **unconfirmed**; it is commonly $5/month.
- **Llama 3.2 11B Vision** is about $0.00044 per request, so about $26/month at 2,000 a day.
- **Scale-to-zero GPU.** Assume roughly 10 GPU-seconds per request. Then 2,000 a day is about 5.6 GPU-hours a day, or roughly $130/month on Modal L4 before cold-start and idle overhead. 500 a day is roughly $35-50/month, so Modal's $30 credit (about 37 L4-hours) nearly covers the low end. Traffic spread through the day keeps an instance warm, so real cost sits nearer the top of these ranges.
- **Home GPU.** Capital cost plus electricity, and exposing a home machine to public traffic. No sourced figures.

### Gaps
- Official Cloud Run and RunPod rates (pages didn't render); Workers AI Neuron-to-token conversion for the free allowance; home GPU costs.

## 4. Law for a US service with 13-17-year-old users sending text and photos to an AI

### Takeaway
No enacted federal AI-and-minors law was found. Minnesota's proposed ban on minors using chatbots (SF 1857) never left the Senate. Minnesota's privacy law almost certainly doesn't reach Apex Scholar below 100,000 Minnesota users.

The real exposure is out-of-state chatbot laws that apply wherever users live and have no revenue floor:
- Colorado's HB26-1263 is the broadest. It covers any public AI service that "primarily simulates human conversation", with no education exemption found, and from 1 Jan 2027 requires age estimation beyond self-declaration and bans badges and streaks for known minors.
- California and New York cover "companion" bots, which a study tutor probably isn't, though the wording is ambiguous.

COPPA applies to "commercial" operators. Whether a free, ad-free project by an individual is "commercial" is unresolved, so the safe course is a neutral age gate and deleting any under-13 data on discovery.

### Cited Findings

**Federal**
- COPPA "applies to operators of commercial websites and online services" directed to under-13s or with "actual knowledge". "COPPA expressly states that the law applies to commercial websites and online services and not to nonprofit entities". The FTC doesn't require operators to ask age. If an operator later learns a user is under 13, notice and parental consent apply; general-audience sites "may" block under-13s and should ask age neutrally. "Although COPPA does not apply to teenagers, the FTC is concerned about teen privacy." — [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- The amended COPPA Rule was published 22 Apr 2025, effective 23 Jun 2025, with compliance by 22 Apr 2026 — [Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule), [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches). It adds written retention policies, a written security programme and biometric identifiers — [Bass Berry](https://bassberry.com/news/amendments-to-the-coppa-rule-now-in-effect/). In its commentary, the FTC says disclosing children's data to train AI is not "integral" and needs separate verifiable parental consent; this is commentary, not rule text — [Data Protection Report, Jun 2025](https://www.dataprotectionreport.com/2025/06/ftcs-coppa-rule-changes-include-ai-training-consent-requirement/), [Akin Gump](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/new-coppa-obligations-for-ai-technologies-collecting-data-from-children)
- The FTC's 6(b) inquiry of 11 Sep 2025 went to Alphabet, Character Technologies, Instagram, Meta, OpenAI, Snap and xAI. It asks about testing for harm to children and teens, COPPA compliance, age limits and monetisation. It is a study, "do not have a specific law enforcement purpose", and doesn't bind small operators — [FTC](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions)
- Congress: COPPA 2.0 passed the Senate in March 2026 but stalled in the House; Congress "stalls again" (June 2026) — [Loeb & Loeb, Jun 2026](https://www.loeb.com/en/insights/publications/2026/06/childrens-online-privacy-in-2026-congress-stalls-again-ftc-signals-priorities). The House KIDS Act bundles KOSA, COPPA 2.0 and the SAFE BOTs Act — [Pillsbury](https://www.pillsburylaw.com/en/news-and-insights/kids-act-house-ai-chatbot-safety.html). The CRS still described it as a proposal on 3 Aug 2026 — [CRS LSB11465](https://www.everycrsreport.com/files/2026-08-03_LSB11465_bef40f280a57fff659f1cb66d836b0f103ecdcb9.pdf). The GUARD Act, a proposed ban on AI companions for minors, cleared Senate Judiciary on 30 Apr 2026 with no floor vote (secondary) — [hiwavemakers](https://hiwavemakers.com/blog/why-congress-still-hasnt-passed-a-kids-ai-safety-law/)
- FERPA: the ED page says rights transfer to the student at 18 or on entering postsecondary education, and doesn't address sites students pick themselves — [studentprivacy.ed.gov](https://studentprivacy.ed.gov/faq/what-ferpa). That FERPA binds schools and agencies receiving ED funds is general knowledge, not confirmed on that page.

**Minnesota**
- **SF 1857.** The 2nd engrossment (7-8 Apr 2026) bars making chatbots available to minors "to use, interact with, purchase, or converse with". It defines chatbots to include systems that "behave in a way that would lead a reasonable person to believe the chatbot is conveying that it has humanity, sentience, emotions, or desires", with no education exemption. It would take effect 15 Jan 2027, with private suits (statutory damages "not to exceed $1,000") and AG penalties "not to exceed $5,000,000" — [SF 1857 text](https://www.revisor.mn.gov/bills/94/2025/0/SF/1857/versions/2)
- **SF 1857 status.** "Still in the Senate", with no passage in either chamber and no governor action; last action 04/07/2026 (an author added) — [Revisor status page](https://www.revisor.mn.gov/bills/bill.php?b=Senate&f=SF1857&ssn=0&y=2025). Advocacy coverage calls it a ban on "recreational" chatbots — [Transparency Coalition, 11 Mar 2026](https://www.transparencycoalition.ai/news/tcai-bill-guide-minnesotas-sf-1857-chatbot-protections-for-kids). A separate HF 4452 would create a cause of action for harm from companion chatbots — [Revisor HF 4452](https://www.revisor.mn.gov/bills/94/2026/0/HF/4452/versions/latest/)
- **MCDPA thresholds.** It applies to controllers of "personal data of 100,000 consumers or more", or over 25% of revenue from data sales plus 25,000 consumers. SBA-defined small businesses are exempt except s.325M.17. There is no general nonprofit exemption — [325M.12](https://www.revisor.mn.gov/statutes/cite/325M.12). s.325M.17 says small businesses must not "sell a consumer's sensitive data without the consumer's prior consent" — [325M.17](https://www.revisor.mn.gov/statutes/cite/325M.17)
- **MCDPA duties.** Where it applies: sensitive data about a known child needs parental consent under COPPA. Targeted advertising and sale need consent "where the controller knows that the consumer is between the ages of 13 and 16". There are privacy-notice and data-minimisation duties — [325M.16](https://www.revisor.mn.gov/statutes/cite/325M.16). Opt-out rights include targeted advertising — [325M.14](https://www.revisor.mn.gov/statutes/cite/325M.14)
- **Student Data Privacy Act** (Minn. Stat. 13.32). A "technology provider" is one who "contracts with a public educational agency or institution" for a school-issued device. "Educational data" means data "maintained by a public educational agency or institution or by a person acting for the agency". Duties include a 90-day return or destroy rule, no sale, and no "commercial purpose" use — [13.32](https://www.revisor.mn.gov/statutes/cite/13.32)

**Chatbot laws in other states (no revenue floors found except SB 1119's audit tiers)**
- **California SB 243** (in effect 1 Jan 2026). "Companion chatbot" means a system "capable of meeting a user's social needs, including by exhibiting anthropomorphic features and being able to sustain a relationship across multiple interactions". It excludes bots "used only for customer service, a business' operational purposes, productivity and analysis related to source information, internal research, or technical assistance". "Operator" means "a person who makes a companion chatbot platform available to a user in the state" — [SB 243 chaptered text](https://legiscan.com/CA/text/SB243/2025)
  - Duties: AI disclosure if a reasonable person could be misled; a published suicide and self-harm protocol with crisis referral; for known minors, a break reminder every 3 hours and no sexual content; reporting from 1 Jul 2027; private right of action — [CA Senate Judiciary analysis, Jun 2026](https://sjud.senate.ca.gov/system/files/2026-06/ab-2023-wicks-sjud-analysis.pdf), [Fenwick, 7 Oct 2026](https://www.fenwick.com/insights/publications/chatbot-compliance-wave-californias-new-law-not-only-one-watch)
- **California SB 1119**, Adam's Law (signed 10 Sep 2026, most provisions 1 Jan 2027). It applies to "companion chatbot operators that permit child users". Operators need a risk assessment before features likely to reach minors, a child safety policy covering age assurance, and a crisis protocol. Penalties run up to $5,000 per affected child (negligent) or $15,000 (intentional). Independent audits apply to "$500M+ gross revenue" operators from 2029 and smaller ones by 2032 — [Fenwick, 9 Oct 2026](https://www.fenwick.com/insights/publications/california-enacts-comprehensive-child-safety-laws-targeting-ai-chatbots), [Fenwick, 7 Oct 2026](https://www.fenwick.com/insights/publications/chatbot-compliance-wave-californias-new-law-not-only-one-watch)
- **New York GBL 1700.** An "AI companion" must retain prior interactions, ask "unprompted or unsolicited emotion-based questions", and sustain "dialogue concerning matters personal to the user". It excludes systems "primarily designed and marketed for providing efficiency improvements or, research or technical assistance" — [NY GBL 1700](https://www.nysenate.gov/legislation/laws/GBS/1700). New York S 9008C, the Safe by Design Act (1 Jan 2027), requires age assurance before access and companion features off by default for minors — [Fenwick table](https://www.fenwick.com/insights/publications/chatbot-compliance-wave-californias-new-law-not-only-one-watch)
- **Colorado HB26-1263** (signed 29 May 2026; duties from 1 Jan 2027). It covers "an artificial intelligence system that is accessible to the general public" that "primarily simulates human conversation and interaction through adaptive textual, visual, or aural communications". Operators must estimate the age of account holders; for known minors, give disclosures, "avoid rewards that encourage engagement", and limit sexual and emotionally dependent content; plus an AI disclosure, a self-harm protocol and annual AG reports. The page showed no education or small-operator exemption — [Colorado General Assembly](https://leg.colorado.gov/bills/hb26-1263)
  - The AG's proposed rules (11 Aug 2026) say self-declaration alone is not enough for age estimation. They ban "leaderboards, badges, login streaks, and features tied to session length" for minors, and default minors to not retaining prior sessions and not training on their data. Narrow rule-based bots are exempt — [Troutman Pepper, 14 Aug 2026](https://www.consumerfinancialserviceslawmonitor.com/2026/08/colorado-proposes-rules-for-automated-decision-making-technology-and-chatbot-safety/)
- **Oregon SB 1546 and Washington HB 2225** (both 1 Jan 2027).
  - Oregon excludes certain software for "customer service, patient care, education, financial services…" and applies on actual knowledge or "has reason to believe". It has a private right of action for the greater of actual damages or $1,000.
  - Washington applies when the operator "knows" or the bot is "directed to minors", and is enforced under the Consumer Protection Act.
  - Source: [Mayer Brown, Apr 2026](https://www.mayerbrown.com/en/insights/publications/2026/04/oregon-and-washington-join-california-in-enacting-companion-chatbot-laws)
- **Other states** (summaries only): Idaho SB 1297 and Nebraska LB 525 define a "conversational AI service" broadly, with business-use exceptions, from July 2027; parental controls are mandatory for under-13s. Georgia, Iowa, Connecticut, Rhode Island and Hawaii have also enacted laws (table) — [Fenwick table](https://www.fenwick.com/insights/publications/chatbot-compliance-wave-californias-new-law-not-only-one-watch), [regulations.ai, Idaho](https://regulations.ai/regulations/RAI-US-ID-S129700-2026). Fourteen chatbot measures passed in 13 states by mid-2026 — [Transparency Coalition](https://www.transparencycoalition.ai/news/watershed-year-for-chatbot-safety-measures-14-new-state-laws-enacted-so-far-in-2026)

**Age-appropriate design codes**
- Maryland (in force since 1 Oct 2024; NetChoice challenge, no injunction): applicability reportedly turns on annual gross revenue above $25,000,000 plus a child-audience condition. This is a search summary of law-firm write-ups, **unconfirmed** at source — [Hogan Lovells](https://www.hoganlovells.com/en/publications/the-data-chronicles-rapid-reaction-marylands-new-kids-code)
- Vermont takes effect 1 Jan 2027 and Nebraska's design code uses COPPA's under-13 line (secondary) — [FPF](https://fpf.org/?p=245734), [IAPP](https://iapp.org/news/a/nebraska-vermont-s-age-appropriate-design-codes-look-to-bolster-children-s-online-safety)
- Parts of California's code are enjoined, but the Ninth Circuit rejected a facial challenge in *NetChoice v. Bonta* (9th Cir. 2026) — [CA Senate Judiciary analysis](https://sjud.senate.ca.gov/system/files/2026-06/ab-2023-wicks-sjud-analysis.pdf)
- SOPIPA (Cal. Bus. & Prof. Code 22584): text **unconfirmed** (pages blocked).

**What providers require when serving minors**
- **Anthropic.** Organisations "must disclose to their users that they are interacting with an AI system rather than a human". They must comply with COPPA, and compliance "should be clearly stated on the organization's website". Safety measures "may include" age verification, content moderation, monitoring and reporting, and education for minors; Anthropic may provide a child-safety system prompt. Anthropic audits, and a high violation rate without these measures can lead to suspension — [Anthropic](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)
- **OpenAI.** "You should not use OpenAI services to process any personal data of children under 13 … without first implementing zero data retention." OpenAI also asks for age-appropriate disclosures, content filters, monitoring with "escalation paths for high-risk interactions", age assurance "where required", and its "most current flagship models" — [OpenAI Under-18 guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance). Its usage policies prohibit exposing minors to graphic self-harm, sexual or violent content, among other things — [OpenAI Usage policies](https://openai.com/policies/usage-policies/)
- **Google.** Gemini unpaid tier: "Do not submit sensitive, confidential, or personal information to the Unpaid Services"; inputs may be read by "human reviewers" and used to improve products — [Gemini API terms](https://aistudio.google.com/docs/terms)

### Inferences
- **Minnesota.** SF 1857 had no floor vote, and the 94th Legislature (2025-26) has ended its regular sessions. That makes it very likely dead, though a near-identical bill could return in the 95th Legislature in January 2027. Its text had no education carve-out, so it would hit Apex Scholar head-on, and it should be watched. This conclusion is my inference from the status page, not an official "dead" notice.
- **MCDPA.** It doesn't apply below 100,000 Minnesota consumers. That threshold works without needing the SBA small-business exemption, which may not fit an unincorporated, not-for-profit project anyway (the SBA definition of "business concern" is unconfirmed).
- **Minnesota 13.32 and FERPA.** Neither applies to a site students choose themselves with no school contract. This changes if a school or district formally adopts Apex. Its Schoology integration makes that plausible, and then 13.32 duties and FERPA "school official" terms would apply.
- **"Free" does not escape the chatbot laws.** SB 243, Colorado and Oregon define operators by making the service available, not by revenue. Only SB 1119's audit timing and Maryland's design code turned on size in what was found. For COPPA, "commercial" is untested for an ad-free individual project, and the FTC's nonprofit carve-out covers nonprofit entities, which Apex isn't unless fiscally sponsored.
- **Scope ambiguity for a study tutor.**
  - California and New York: probably out of scope, since a tutor isn't built to meet "social needs" or ask emotion-based questions. Persistent chat history and a friendly persona move it closer.
  - Oregon: explicitly excludes education.
  - Colorado, Idaho and Nebraska: likely in scope, because of the "primarily simulates human conversation" wording.
- **Colorado's rules hit current features.** The proposed rules on badges and streaks would bite Apex's `userAchievements` gamification for known minors from 2027.
- **Practical safeguards that satisfy most of the above together:**
  1. A visible, persistent "you are talking to an AI" disclosure.
  2. A published self-harm protocol that detects and refers to 988.
  3. Filters on sexual and graphic content.
  4. A neutral 13+ age gate, with deletion of under-13 accounts on discovery.
  5. No training on, or sale of, student data; zero or short retention at the provider.
  6. Break reminders and no engagement rewards for minors.
  7. A COPPA statement on the website (Anthropic expects one).
  8. Colorado-grade age estimation beyond a birthday field, which is the hard part and needs a separate decision.

### Gaps
- Final SF 1857 and HF 1991 outcome on an official record; Colorado enrolled text (exemptions); Washington, Idaho and Nebraska text on education; SOPIPA text; Maryland thresholds at source; SBA "business concern" definition; the FTC's position on free or non-commercial operators; Cloudflare and Hack Club privacy terms on minors' data.

## 5. Does pooling free-tier keys across accounts or projects create risk?

### Takeaway
Yes. Google's terms forbid attempts to circumvent API limits, and its docs scope limits per project. Eleven keys only add quota if they sit in separate projects or accounts, which is exactly the circumvention pattern. No Google text names multi-project pooling outright, and forum reports show automated enforcement with hard-to-appeal restrictions on free projects. OpenRouter bans the practice explicitly and OpenAI bans circumventing rate limits. The age ban makes the question moot for Gemini anyway.

### Cited Findings
- "Google sets and enforces limits on your use of the APIs"; "You agree to, and will not attempt to circumvent, such limitations documented with each API"; use beyond limits needs "Google's express consent"; "You will not misrepresent or mask either your identity or your API Client's identity"; "Google may suspend access to the APIs by you or your API Client without notice" (last modified 9 Nov 2021) — [Google APIs Terms](https://developers.google.com/terms)
- "Rate limits are applied per project, not per API key." — [Gemini API rate limits](https://aistudio.google.com/docs/rate-limits)
- Forum reports describe projects flagged by automated abuse systems, with a reply that "We cannot lift the automated restrictions on free tier accounts" and project-wide quota set to 0 after a policy notice. These are anecdotal — [Google AI forum](https://discuss.ai.google.dev/t/gemini-api-project-wide-quota-set-to-0-rpm-after-policy-notice-appeal-still-pending/176359), [Google AI forum](https://discuss.ai.google.dev/t/request-for-clarification-on-multi-project-gemini-api-free-tier-collaboration-architecture/176171)
- OpenRouter prohibits users to "create multiple accounts as a single user, for purposes of bypassing or circumventing use limits on the Site or Service" — [OpenRouter Terms](https://openrouter.ai/terms)
- OpenAI prohibits acts to "circumvent any rate limits or restrictions or bypass any protective measures" — [OpenAI Terms of Use](https://openai.com/policies/row-terms-of-use/)
- Hack Club AI caps spend per account and enforces identity verification and bans (HTTP 403) — [Hack Club AI rules](https://docs.ai.hackclub.com/guide/rules.html)

### Inferences
- Rotating keys on 429s across separate projects is the textbook reading of "attempt to circumvent". The realistic penalty is suspension of every linked project without notice, which would take the whole AI layer down at once.
- The same pattern would breach OpenRouter's terms, and by extension risks a Hack Club ban if replicated there.

### Gaps
- Anthropic's API terms on multiple accounts were not checked. Google has made no explicit public statement on multi-project free-tier pooling.

## 6. What comparable teen education AI products do

### Takeaway
The public detail is thin. The pattern from the two documented products is: buy from major providers under no-training or no-retention terms, add a moderation layer that flags self-harm or distress, and alert an adult.

### Cited Findings
- MagicSchool uses several models, including OpenAI GPT-4o, Anthropic Claude and Google Gemini, matched by tool. It says its providers may not keep or train on educator or student data and must delete it after processing — [MagicSchool](https://www.magicschool.ai/privacy/quality)
- A Claude customer story describes MagicSchool using a Haiku-based moderation prompt to detect student self-harm or distress (vendor account, unverified figure) — [Claude customer story](https://claude.com/customers/magicschool-qa)
- Khanmigo: Khan Academy says Khanmigo uses OpenAI technology to review conversations and flag possibly unsafe messages, that the system sometimes makes mistakes, and that flags send an automatic email to an adult connected to the student — [Khan Academy support](https://support.khanacademy.org/hc/tr/articles/13871273505933)
- Knowt says it is compliant with student privacy guidelines and will sign data privacy agreements (self-description in a competitive page) — [Knowt](https://knowt.com/teachers/free-schoolai-alternative)
- Hack Club AI is itself a teen-only AI service, using sign-in, per-account spend caps, content rules and identity verification — [Hack Club AI rules](https://docs.ai.hackclub.com/guide/rules.html)

### Inferences
- Apex's realistic equivalent of Khanmigo's adult alert is weaker, because there is no linked parent or teacher account. The minimum credible substitute is crisis referral (988) plus a log the developer reviews.

### Gaps
- SchoolAI, Quizlet (Q-Chat), Photomath and Knowt: providers and subprocessors **unconfirmed** (not found in search, and budget exhausted).
