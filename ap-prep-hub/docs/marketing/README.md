# Marketing playbook

*Updated 2026-09-25. Start here. The detail lives in
[reddit-playbook.md](reddit-playbook.md) and [data-asset-status.md](data-asset-status.md);
the research behind the choices is in
[../research/growth-retention-adaptivity.md](../research/growth-retention-adaptivity.md).*

## Where things stand (measured, not guessed)

**Google Analytics, last 90 days (Jun 27 – Sep 24).** GA went live in late July, so
most of the 93 accounts signed up before it could see them.

| Channel | Sessions | Share |
|---|---|---|
| Direct | 74 | 78% |
| Organic search | 14 | 15% |
| Referral | 5 | 5% |
| Organic social | 2 | 2% |
| **Total** | **95** | |

"Direct" is mostly you, testers, and data-centre traffic (Ashburn and Council Bluffs
are cloud regions, not students). **No channel is currently bringing in students.**

**Production (aggregate counts only).** 93 accounts, 0 practice tests in the last 30
days, about 87 of them emailable (6 opted out).

**Measurement gap.** The app sends no `sign_up` or "finished a test" event to GA, and no
key events are configured, so GA can't show which channel produces *students*, only
visits. Fix this before spending effort on any channel.

## Positioning

**The free AP coach: it tells you what to do today, and it's honest about your score.**

Why this line and not "free AI study tools":
- **Knowt** already gives away practice tests, AI-graded FRQs, an AI tutor, spaced
  repetition, a score calculator and phone apps, and claims 700k AP students. Competing
  as "also free, also AI" loses.
- **Fiveable** now charges $79/year or $29/month. "Free" is a real difference against
  Fiveable, not against Knowt.
- Nobody else ties a practice result to the per-exam curve, labels the sections it
  predicted as predictions, and says the cut points are estimates. Honesty is the story.

Say: free, no ads, no paywall, built by a student, per-exam score estimates with ranges,
a plan that counts down to your exam.
Don't say: "most accurate", "official", "guaranteed 5", or anything implying College
Board involvement.

## Status of the prerequisites (2026-10-04, built, not deployed)

- **First-run flow** — `/start`. `/` sends new visitors and accounts there; guests can take it.
- **Weekly email** — `netlify/functions/email-weekly.js`. **Sends nothing until you set
  `WEEKLY_EMAIL_ENABLED=true`** in Netlify; until then each daily run only logs who it would email.
- **GA events** — `sign_up`, `first_run_complete`, `test_completed` are sent. **You still have to
  mark them as key events**: GA → Admin → Data display → Events → star each one (they appear
  after the first time each fires in production).

## Sequencing: the first-run flow comes before any big push

A teacher's announcement or a well-received Reddit comment is a **one-time** burst of
attention. Right now that attention lands on a chat box, and nothing brings anyone back.
Ship these first:
1. The first-run flow (subject + exam date → 10 questions → predicted score + today's plan).
2. The weekly email.
3. GA `sign_up` / `test_completed` key events.

Until then, only do the steps that don't spend attention: Reddit Phase 1 (below),
setting up the class for your own school, and the modmail.

## Channels, in priority order

### 1. Teachers and clubs (you, in person) — highest leverage

One teacher sharing one class link is ~30 students from a single decision, and it's the
channel where the fact that a student built this helps most. Classes, join links and
the class leaderboard are already built (`/classes`).

**Status:** planned. **Next action:** after the first-run flow ships, ask **one**
teacher you have a good relationship with, in a subject the bank covers well.

**Best timing** (when students feel the need): the week before a unit test; the first
week back in January; early March, when AP review starts. Avoid finals weeks.

**Before you ask:**
- [ ] Create a class for that teacher's course and open the join link on a phone,
      signed out, to confirm it works end to end.
- [ ] Check that subject's questions yourself (answer 10) so nothing embarrassing shows up.
- [ ] Have a link with UTM tags ready (see Measurement).

**The ask — in person, 30 seconds:**
> I built a free AP practice site. It's no ads and no paywall, and it scores practice
> against each exam's curve. Would you be okay posting one link in Google Classroom
> before the Unit [N] test? Students join a class leaderboard. It doesn't need anything
> from you, and I can take it down if it's not useful.

**The same ask by email:**
> **Subject:** Free AP [Subject] practice for the Unit [N] test
>
> Hi [Teacher],
>
> I'm [name] from your [period] class. I built a free AP study site, Apex Scholar
> (apex-scholar.com). It has practice questions with explanations, reviews the ones
> you miss, and estimates your AP score from each exam's curve. No ads, no paywall,
> no student data sold. It's a student project.
>
> Would you be willing to share this join link with the class before the Unit [N]
> test? [link]. Students who join see a class leaderboard. Nothing is needed from
> you beyond posting it.
>
> If anything in it looks wrong for [Subject], please tell me and I'll fix it.
>
> Thanks,
> [name]

Keep it to one class and one link. Don't ask them to assign it or grade with it (the
leaderboard is self-reported; see the note in `src/services/classes.js`).

**Clubs** work the same way: NHS/peer tutoring, Mu Alpha Theta, science olympiad, any
AP study group. A club lead can create the class themselves.

### 2. Reddit — slow, but it's how AI search engines find you

**Status:** modmail to r/APStudents **not sent yet.** Follow
[reddit-playbook.md](reddit-playbook.md) in order: Phase 1 (20–30 genuinely helpful
comments, no mention of Apex) **before** Phase 2 (the modmail). Sending the modmail from
an account with no history in the subreddit invites a "no."

### 3. Email to existing users — cadence decided

**Weekly**, and **daily only in the final 7 days before each student's own exam.**
Nothing else.

The Sunday digest is personal: questions answered that week and accuracy vs the week before,
the most-missed topic (linked to that subject's tutor), tests finished, reviews due, days to each
exam, latest predicted score. A student who went quiet gets a short nudge instead.

Students can turn off each type separately (weekly / exam week / announcements) from the link in
any email or in Settings. Opening the link changes nothing until they choose; school mail filters
that open every link no longer unsubscribe people by accident. A mail app's own Unsubscribe button
still turns everything off in one click.

- Until the automated weekly digest is built, send manual broadcasts from Dev Settings.
  Use at most one every two weeks, so manual sends don't train people to ignore the
  weekly one later.
- Every email: one call to action, subject ≤ 35 characters, the existing one-click
  unsubscribe. Most readers are under 18. Keep it useful, never guilt-based.
- Weekly digest contents (when built): reviews due, days to the exam, the predicted
  score and how it moved, one question to answer right away.
- The final-week daily email needs each student's exam date. Only send it to students
  who picked subjects; the dates come from `AP_EXAM_DATES_2027`.

Draft on file: [../email-drafts/back-to-school-2026.md](../email-drafts/back-to-school-2026.md).

### 4. Search and the score calculator

Organic search is the only outside channel producing anything today (14 sessions in 90
days), and the calculators are the pages it lands on.
- **Curves reference page** (from [data-asset-status.md](data-asset-status.md)): one
  page with every subject's estimated curve and confidence. Linkable and citable.
- **Honest comparison pages** now that Fiveable is paid: "Apex Scholar vs Fiveable",
  "vs Knowt", and state where each competitor is better. Keep it to a handful of real
  pages, not a template farm (plan Part 4.5).
- Every calculator result links into practice for that subject.

### 5. Short-form video / YouTube — later

Faceless screen recordings (plan Part 3) of the calculator and "the question you'll
get wrong on Unit N". Wait until the first-run flow exists so the link has somewhere
good to land.

### Not doing

- Paid ads (no budget, and paid installs don't retain in education).
- Alt accounts, upvote requests, or posts without disclosure (see the reddit-playbook table).
- The "we graded N thousand FRQs" data post. It's blocked until the thresholds in
  [data-asset-status.md](data-asset-status.md) are met; today it would be ~0 tests.
- Web push. It only reaches iPhone users who installed the site to their home screen.

## Measurement

Set up once:
- [x] Send GA events `sign_up`, `first_run_complete` and `test_completed` from the app.
- [ ] Mark all three as key events in GA → Admin → Events (after deploy, once each has fired).
- [ ] Tag every link you hand out that isn't on Reddit:
      `https://apex-scholar.com/join/CODE?utm_source=teacher&utm_medium=classroom&utm_campaign=<school>-<subject>`.
      Leave UTMs off Reddit links; they read as marketing.

Check weekly (5 minutes):
| Metric | Where | Target by end of November |
|---|---|---|
| New sign-ups per week, by channel | GA key event `sign_up` × session source | a named channel producing sign-ups every week |
| Finished the first diagnostic in the first session | GA / Firestore aggregate | ≥ 50% of sign-ups |
| Came back within 7 days (D7) | Firestore `lastSeenAt` aggregate | ≥ 20% |
| Answers logged per week | `responses` count | ≥ 2,000 once a channel is running |
| Class members | `members` collection-group count | one class with ≥ 15 members |

## Calendar to May 2027

| When | Do |
|---|---|
| Now – mid Oct | Reddit Phase 1 comments. Build the first-run flow, weekly email, GA key events. Set up your own class. |
| Late Oct – Nov | First teacher ask (one class). Send the modmail once you have comment history. |
| December | Quiet. Fix whatever the first class exposes. |
| January | Second round of teacher asks (new semester). Comparison pages. |
| March – April | Main push: every teacher who said yes re-shares; Reddit replies in review threads; calculator traffic peaks. |
| Final week before each exam | Daily email to students with that exam. |
| After exams | Ask students for their real score (feeds the curve estimates), then rerun the curve script in July. |
