# Deep Research: Growing Apex Scholar's repeat users, and making it adaptive as it grows

*2026-09-25. Depth: thorough (~20 sources, plus aggregate-only production counts).
Builds on, and does not repeat, `adaptive-learning-plan.md` (2026-09-19) and plan
Parts 3–5 (Reddit rules, AI-citation/SEO, teachers, YouTube).*

## Executive Summary

The biggest problem isn't adaptivity, and it isn't features. **Almost nobody is using the
product right now.** Production today: 93 accounts, **0 practice tests in the last 30
days** (5 in 90), 3 tutor conversations touched in 30 days (19 in 90), 3 users stamped
by presence tracking since it shipped on Sept 21, and **0 rows** in the `responses` log.
The log is deployed and its rule is live; it's empty because nobody has taken a
graded test since. An adaptive engine with no answers coming in is a demo.

The market makes this harder than more features can fix. Knowt already gives away
everything Apex Scholar has, for free: practice tests, AI-graded FRQs, an AI tutor,
spaced repetition, an AP score calculator, and native mobile apps. It claims 700,000
of the 1.3 million class-of-2025 AP students. A second free feature set doesn't beat that. The opening
is elsewhere: Fiveable went paid ($79/yr), and Knowt is a content library, not a coach.
The wedge worth owning is **"it tells you what to do today, and it's honest about your
score."** Most of the parts for that already exist (per-exam curves, SRS queue, exam dates,
response log, misconception taxonomy). They're just not the first thing a student sees,
and nothing brings a student back.

So the order is: (1) replace the landing page with a 10-question diagnostic that ends in a predicted
score and today's plan; (2) add a return trigger, which realistically means email (web push
on iOS needs a home-screen install first); (3) use classes and teachers as the
acquisition channel already researched in Part 5; (4) make it adaptive **per unit, not per item**,
because item-level estimates need about 100 students per item (≈356k answers across the
3,560-item bank). Per-student estimates, by contrast, work after about 10 answers.

## Key Findings

1. **Usage is near zero, measured.** 0 practice tests / 30 days; 3 active since presence
   shipped; 0 logged responses; 1 class with 2 members. `emailOptIn` is `false` for only
   6 users, so about 87 accounts can be emailed (opt-in defaults to on, per Round 12).
   *(Aggregate Firestore counts, 2026-09-25.)*
2. **Knowt matches Apex feature for feature, for free, at scale.** Practice Test Room, FRQ Room "graded by Kai",
   AI tutor, spaced repetition, score calculator, iOS/Android apps; "At least 700,000 of 1.3
   million students used Knowt for the May 2025 AP season." [knowt.com]. That denominator
   is College Board's class-of-2025 count of graduates who took any AP exam during high
   school (1,307,781) [CB], not one season's test-takers, so treat the 50% claim as marketing.
3. **Fiveable is now paid**: $79/year or $29/month [fiveable.me]. There is now demand for a
   free alternative.
4. **Education apps retain badly everywhere.** Mobile education D30 ≈ 2–3%
   (AppsFlyer/Business of Apps) [benchmarks]. Industry write-ups say activation in the
   first session is the strongest predictor of D30 retention (UXCam; not a controlled study).
5. **Streak mechanics work, but the effects are small and mostly correlational.** Users on 7-day streaks are
   3.6× likelier to finish a course (correlation); Streak Freeze gave +0.38% DAU; streak
   animations gave +1.7% D7 for new learners (experiments) [Duolingo blog]. Friend Streak users are
   22% likelier to finish the daily lesson (correlation) [Duolingo blog]. Bandit-optimised
   notifications gave +0.5% DAU and +2% new-user retention [Yancey & Settles, KDD 2020]. All of these are
   optimisations on top of an existing return trigger. Apex has no return trigger.
6. **Web push barely reaches iPhone users.** iOS web push needs iOS 16.4+ *and* a manual Add to
   Home Screen first; about 16% of mobile users accept web push prompts; the reachable
   audience is roughly 10–15× smaller than native push [MobiLoud citing HTTP Archive]. Email is the
   practical trigger.
7. **Streaks of wrong answers make students quit.** In Math Garden, one error roughly doubled the odds of
   quitting and three in a row roughly tripled to quadrupled them. The same write-up also
   says "13×", so the figures conflict. Harder items raise quitting on their own too; serve an easier item
   after an error [MemoryLab, citing ten Broeke et al.].
8. **The adaptivity data arithmetic.** Elo needs **≈100 students per item** for good item
   difficulty, but only **≈10 answers per student** for a reasonable skill estimate
   (r ≈ 0.8) [Pelánek 2016]. At the cold start, knowing *what* the item is matters more
   than knowing *who* the student is: item-difficulty priors cut forgetting-rate prediction error by up to 20.1% (100M
   trials, 140k learners) [van der Velde et al. 2024].
9. **Item difficulty can be estimated before anyone answers.** LLM "simulated classroom" estimates
   correlated 0.75–0.82 with real NAEP math item difficulty [arXiv 2601.09953]. Together with
   the existing flaw-sweep priors, that gives each item a starting difficulty that real answers replace.
10. **Practice testing works, which is why the test-first flow is right.** Practice tests beat
    re-study with g = 0.61 [Adesope et al. 2017]. The 85% rule gives a theoretical target
    difficulty (≈15% error) [Wilson et al. 2019]. It was derived for model learners, so use it
    as a heuristic, not a law.

## Detailed Analysis

### A. Diagnosis: the product has nothing that brings people back

What a signed-in student sees first is the AI tutor (`App.js` index → `AITutors`): a chat
box, the most commoditised surface in edtech. Nothing then pulls them back. There is no
service worker, no push, and no scheduled email. The only outbound channel is the
admin-triggered broadcast (`email-broadcast.js`). The review queue, streaks and
achievements all exist, but they only matter to someone who is already on the site.
Diagnostics have run 3 times across 93 users (Sept 19 count). The pieces that would make
the product adaptive sit behind a click almost nobody makes.

For the next few months this matters more than any model. With ~3 active users,
the response log fills at roughly zero rows per week, and every adaptive feature in
`adaptive-learning-plan.md` stays hypothetical.

### B. Positioning: don't copy Knowt feature for feature

Knowt wins "free everything" through distribution (native apps, 5M+ users, community decks).
Its weak points are real but narrow: students on r/APStudents say community-made content is
uneven, and "AI slop" practice that doesn't match real exams is a recurring complaint
(Reddit, search snippets only; the thread itself couldn't be scraped). Apex's
defensible pieces:

- **Scores tied to real curves.** Per-exam cut points, sections the student didn't take
  predicted and labelled as predicted, and a link from the result into the calculator. That's
  more honest than most score calculators (Round 79).
- **Question-quality work others don't show.** Flaw sweep, the 200-item labelled
  dataset, and the rule that the log is append-only.
- **Coaching.** Exam dates, SRS queue, exam-weighted allocation (planned). That adds up to
  "here is today's 20 minutes", which a library doesn't give.

Recommendation *(my judgement, not measured)*: position as the free AP **coach**, not
a hub. Everything a new student sees should answer three questions: *what will I get, what do I do today, how
many days until the exam.*

### C. Activation: make the first session the diagnostic

Replace the index redirect with a first-run flow: **pick a subject + exam date → 10
questions → predicted AP score (with an honest range) + today's plan + the misses queued
for review.** This does several jobs at once:

- It delivers value in the first session (finding 4).
- It produces exactly the ~10 answers the student-level estimate needs (finding 8), so the
  first plan is already personalised.
- It fills the `responses` log from day one, with `chosen` and `msToAnswer`.
- It gives the student something to share: the calculator link already exists.

Use the existing bank (`questionBank`, 3,560 items, answer key checked, no generation
latency), ordered easy→hard by the flaw-sweep difficulty priors. If a student misses
two in a row, serve an easier item next (finding 7).

### D. Retention: add a return trigger before tuning it

1. **Weekly email digest, then daily for students who opt in.** Build it on the existing SMTP2GO
   and unsubscribe pieces as a Netlify **scheduled** function. Contents: reviews due, days
   to the exam, the predicted score and how it moved, one question to answer right away. The daily
   version covers the final eight weeks before May. Mind minors and CAN-SPAM: every email keeps the one-click
   unsubscribe that already exists. *Reach: about 87 addresses today.*
2. **Streak with slack.** The streak exists (`effectiveStreak`). Add one automatic freeze per
   week (Duolingo's result: slack helps persistence). Don't add loss-aversion copy aimed at teenagers.
3. **Class streaks and class leaderboards** instead of friend streaks. Classes and join links are already
   built. One teacher link brings ~30 students, and a shared goal is the social mechanism with
   the strongest evidence (finding 5, correlational).
4. **Skip web push for now.** On iOS it only reaches students who installed to the
   home screen (finding 6). Add it later for Android and installed users, after email proves the loop works.

Expect usage to follow the school calendar, not a smooth curve *(inference)*: unit
tests in class during the year, then a spike from March to May. Time the plan and emails to
"your unit test" during the year and "the exam" in spring.

### E. Adaptivity that scales with users

Working from the literature and the bank's size:

| Stage | Users / answers | What to turn on | Why it works at this stage |
|---|---|---|---|
| Now | ~0–100 WAU, <5k answers | Per-student, **per-unit** skill (Elo or Beta-Binomial) with a shown interval; item difficulty = flaw-sweep prior (+ optional LLM simulated-classroom prior) | Students need ~10 answers; items borrow priors (findings 8–9) |
| Early | ~5–50k answers | Unit-level difficulty learned from data; item offset = prior + learned shift, pulled toward the prior until the item has enough answers; pick items with predicted success ≈ 80–85% | Units pool thousands of answers each; items don't yet |
| Scale | 100+ answers per item for the most-used items | Item-level Elo with an uncertainty-based K, U(n)=a/(1+bn) (a=1, b=0.05); misconception rates per distractor; fast-wrong vs slow-wrong routing | Meets the ~100-students-per-item bar [Pelánek] |
| Later still | many thousands of students, months of logs | Knowledge tracing / IRT refits offline | Blocked until then (as in the Sept 19 plan) |

Rough count: at the plan's target of 1,000 weekly users × ~30 answers each = ~30k answers a
week. A unit-level model becomes usable within a week or two at that volume. Full item-level coverage of 3,560 items
takes most of a year, and the rarely used items never get there, which is fine because the unit prior
covers them.

The LLM simulated-classroom prior only sets a starting difficulty; real answers replace it.
Keep it separate from the item-quality labels, which the
standing rule says an LLM must not decide.

### F. Acquisition channels (additions to Parts 4–5, not repeats)

- **"Free Fiveable alternative" searches** are a new keyword opening since Fiveable's paywall.
  Honest comparison pages only (Part 4.5 warns against scaled low-value pages).
- **Teachers and clubs remain the channel with the most leverage** (Part 5.6). The class
  leaderboard and class streak from D give a teacher a reason to share the link.
- **The score-result share link** is the one loop a single student can spread without a teacher.

## Contrarian Views And Risks

- **Maybe the 3 active users are just seasonal.** It's late September. Students haven't
  hit their first unit tests, so low usage partly reflects the calendar. But 0 tests in 30
  days, including early September, and 5 in 90 days means it isn't only the season.
- **Features may not be the constraint at all.** Eighty engineering rounds haven't moved
  usage. If the 93 accounts came from one early burst and no ongoing channel, a better
  first session only helps people who arrive. Distribution work (Reddit modmail, teachers,
  YouTube; Part 4.6) isn't code, and it can't be skipped.
- **Knowt could copy the coach idea within a quarter.** The real edge may be local: your
  school, your clubs, your teachers. There, one person's effort makes a large share of
  the difference.
- **Email to minors.** Default-on consent was a product decision (Round 12). Under
  CAN-SPAM it's defensible, but a heavy cadence will produce unsubscribes and spam
  complaints that hurt email deliverability. Start weekly.
- **Most retention evidence here is correlational** (streaks, friend streaks) or from
  products with 100M+ users. At this size, measure directly rather than assume
  the effects carry over.
- **The 85% rule** was derived for model learners doing binary classification. It's a
  reasonable default, not an established finding for AP content.

## Open Questions

1. Where did the 93 accounts come from? (GA4 acquisition report; sign-up dates exist only for 3.)
2. Will you personally run the teacher/club channel at your school? It's the highest-leverage
   growth work, and none of it is code.
3. Did r/APStudents answer the modmail (Part 4.6 step 2)?
4. Email cadence you're comfortable with for a mostly under-18 audience: weekly only, or daily in the final 8 weeks?

## Suggested next 6 weeks (in order)

1. First-run diagnostic flow replacing `/ → /ai-tutors` (C).
2. Weekly email digest as a scheduled function (D1).
3. Easier item after an error in practice and review (finding 7).
4. Per-student per-unit Elo + intervals, reading `responses` (E, stage "Now").
5. Class streak and class leaderboard in the class view (D3), then pitch one teacher.
6. Metrics, all from aggregate counts: activation = finished the diagnostic in the first session;
   D7 return; responses per week. Targets for the next 6 weeks: 50% activation,
   ≥20% D7, and ≥2,000 responses a week once acquisition is running.

## Sources

- Production Firestore, aggregate `count()` queries only (2026-09-25) — usage numbers above.
- https://knowt.com/ — Knowt feature list and user-count claims.
- https://knowt.com/exams/AP/frq-room — Knowt free AI-graded FRQs.
- https://reports.collegeboard.org/ap-program-results/class-of-2025 — 1,307,781 class-of-2025 AP takers; 4.8M exams.
- https://fiveable.me/fiveable-vs-ap-classroom — Fiveable $79/yr, $29/mo.
- https://blog.duolingo.com/how-duolingo-streak-builds-habit/ — streak effects (3.6×, +1.7% D7, +0.38% DAU).
- https://blog.duolingo.com/friend-streak/ — Friend Streak +22% daily completion (correlational).
- https://dl.acm.org/doi/10.1145/3394486.3403351 — Yancey & Settles, notification bandit, +0.5% DAU, +2% new-user retention.
- https://www.mobiloud.com/blog/progressive-web-apps-ios — iOS web push constraints, 16% acceptance, 10–15× reach gap.
- https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide — iOS 16.4+ / home-screen requirement.
- https://www.businessofapps.com/data/education-app-benchmarks/ — education D30 ≈ 2%.
- https://uxcam.com/blog/mobile-app-retention-benchmarks/ — activation → D30 (industry, not peer-reviewed).
- https://www.memorylab.nl/blogs/what-causes-students-to-stop-studying/ — error streaks and quitting (summarising ten Broeke et al.; internal inconsistency noted).
- https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf — Pelánek, Elo in education: ~100 students/item, ~10 answers/student, U(n)=a/(1+bn).
- https://link.springer.com/article/10.1007/s11257-024-09401-5 — van der Velde et al. 2024, "what" beats "who", up to 20.1% error reduction.
- https://link.springer.com/article/10.1007/s11257-025-09439-z — dynamic-K Elo in Math Garden (volatile ability tracking).
- https://arxiv.org/html/2601.09953v1 — LLM simulated-classroom difficulty, r 0.75–0.82 on NAEP math.
- https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.long-papers.104/index.html — LLM uncertainty as a difficulty signal (EDM 2025).
- https://www.researchgate.net/publication/315706448_Rethinking_the_Use_of_Tests_A_Meta-Analysis_of_Practice_Testing — Adesope et al. 2017, g = 0.61.
- https://www.nature.com/articles/s41467-019-12552-4 — Wilson et al. 2019, the 85% rule.
- Reddit r/APStudents search snippets (AI-practice skepticism; Knowt quality) — could not be scraped; low weight.

## Rerun Inputs

workflow: firecrawl-deep-research
topic: growing retained users and scaling adaptivity for a free AP prep app (Apex Scholar)
depth: thorough
output: markdown
