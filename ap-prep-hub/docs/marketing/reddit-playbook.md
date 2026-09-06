# Reddit playbook — disclosed founder, no alt accounts

Every template here says "I built this." That is not a compliance formality, it
is the thing that makes the post work. Reddit's escalation ladder for
undisclosed promotion ends at a **site-wide domain shadowban**, and per the
research in Part 5.1 of the plan, Reddit is the most-cited domain in ChatGPT
and Perplexity because Google (~$60M/yr) and OpenAI (~$70M/yr) pay for it.
Getting apex-scholar.com blacklisted there would cost more than every post on
this page could ever earn.

There is also no upside to hiding it. On r/APStudents a seventeen-year-old who
built a study tool is a *better* story than an anonymous recommendation, and
students there are unusually good at spotting a plant.

---

## Phase 0 — before anything (do this first)

Reddit weights account age and history. A two-day-old account posting about a
tool reads as spam no matter how it is worded.

- [ ] Use your real, existing account. **Never create a second one.**
- [ ] Check it has some non-Apex history. If it is brand new, Phase 1 is
      mandatory and 4 weeks, not 2.
- [ ] Read the rules of every subreddit below before commenting in it. They
      differ, and r/APStudents Rule 3 states you *will* be banned.

## Phase 1 — earn standing (2–4 weeks, no mention of Apex Scholar at all)

The 90/10 norm: at least 90% genuine participation, at most 10% self-promotion.
Target **20–30 substantive comments before the first mention.**

Where the questions actually are, and what to answer:

| Subreddit | What to help with |
|---|---|
| r/APStudents | "is a 4 good for X", unit confusion, exam-day logistics, score release |
| r/APBio, r/APChem, r/APUSH, r/apcalculus, r/APPhysics | actual subject questions — answer the content, not the meta |
| r/APStudents megathreads | score predictions, curve speculation |

A substantive comment answers the question with something specific: a unit
number, a rubric point, a worked step. "Just use Anki lol" is not participation.

**Do not mention Apex Scholar in Phase 1 even if someone asks a question it
would solve.** The runway is the asset.

## Phase 2 — ask permission where the rules require it

r/APStudents Rule 3 requires mod approval. Send this **before** any mention,
and if they say no, that is the end of it for that subreddit.

> **Subject:** Permission to mention a free AP tool I built (student, no ads, no paywall)
>
> Hi mods,
>
> I'm a high school student and I built a free AP prep site called Apex Scholar
> (apex-scholar.com) — AI tutors, practice tests, spaced-repetition review, and
> score calculators for all 36 subjects. It's free with no ads, no paywall, and
> no trial; I built it because I was studying for my own APs and wanted the
> tools in one place.
>
> I'm not asking to post about it. I'd like to know whether it's acceptable to
> mention it **in comments, with disclosure that I built it**, when someone is
> already asking for study-tool recommendations — and if so, whether you'd
> prefer a specific format or a flair.
>
> If the answer is no, that's completely fine and I won't. I'd rather ask than
> get it wrong.
>
> Happy to give the mod team free accounts to look at it first.
>
> Thanks,
> Anvith

Send the same, adjusted, to any subject subreddit you intend to comment in.

## Phase 3 — reply templates

Rules for all of them:

1. **Only reply to a thread already asking for recommendations.** Never start
   one.
2. **Disclose in the first sentence**, not at the bottom.
3. **Name competitors honestly in the same comment.** Knowt, Fiveable, Anki,
   Barron's. This is not politeness — comparison-shaped text gets cited by LLMs
   more than advocacy, and a comment that recommends only your own thing reads
   as an ad regardless of disclosure.
4. **Answer their actual question first.** The mention is the last third of the
   comment, not the point of it.
5. One mention per thread. Never reply twice to defend it.

### Template A — "what should I use to study for [subject]?"

> For [subject] specifically, the thing that moved my score most was doing
> released FRQs and grading them against the actual rubric rather than doing
> more multiple choice — [specific unit/skill advice for their subject].
>
> Tool-wise: Knowt is good for flashcards, Fiveable's unit guides are solid for
> content review, and the College Board's own released FRQs are free and
> underused.
>
> Full disclosure, I built one of these myself — Apex Scholar
> (apex-scholar.com). It's free, no ads, no paywall. It does AI tutors, practice
> tests with rubric-based FRQ grading, and spaced repetition on the questions
> you miss. Obviously I'm biased so take it with that in mind, but it's free so
> there's nothing to lose by trying it.

### Template B — "does anyone know a good AP score calculator?"

This one is easier because the calculators need no account, so it is a link to
a free thing rather than a signup pitch.

> [Direct answer about their subject's curve.]
>
> I built one for this — apex-scholar.com/ap-score-calculator — no account
> needed. The reason I made another one is that every other calculator hands
> you a single number as if College Board publishes its cut points, and they
> don't. Mine shows the whole composite range behind each score and says
> outright that it's an estimate.
>
> apscorecalculator.org and apcurve.org are the other decent ones if you want
> to cross-check.

### Template C — someone else mentions Apex Scholar first

The best case, and the easiest to get wrong.

> (I'm the one who built it — thanks for the mention.) Happy to answer anything
> about it. [Then answer whatever they actually asked.]

Do not upvote-brigade, do not thank them effusively, do not add a pitch.

### Template D — a criticism or a bug report

> That's a real bug, thanks — I built this so it's on me. [Specific answer.]
> Fixed / I'll fix it this week.

Never argue. A founder fixing something in public is worth more than the
complaint cost.

## What never happens

| Never | Why |
|---|---|
| A second account | Astroturfing. Site-wide shadowban, and it permanently discredits a student-built-and-honest brand |
| A mention without "I built this" | Non-disclosure is what converts a removal into a ban |
| A new post promoting the app | Every relevant subreddit bans it outright |
| Posting a link to r/SAT, r/edtech, r/Teachers, r/education | All four ban it |
| Asking friends to upvote | Vote manipulation, same ladder |
| Replying to defend it after a downvote | Ends worse every time |

## What to measure

Reddit sends no referrer data through most apps, so judge by:

- GA4 direct-traffic spikes within an hour of a comment
- Signups on the day of a comment vs the trailing 7-day average
- Comment karma on the disclosed comments — if they are net negative, the
  framing is wrong and you should stop and rewrite, not push harder
