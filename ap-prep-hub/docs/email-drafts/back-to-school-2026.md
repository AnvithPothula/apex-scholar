# Back-to-school broadcast — draft

Paste the **Body** section below straight into Dev Settings → Email Broadcast.
It uses only the syntax that renderer supports (`#`/`##`, `-`, `**bold**`,
`*italic*`, `[text](url)`, `![alt](url)`). Hit **Preview** before **Send**.

**Subject:** `New AP season at Apex Scholar`

29 characters. The subject does three jobs — inbox subject, preheader (the grey
line beside it), and the `<h1>` inside the card — and the tightest of the three
is the inbox on a phone: Gmail on Android cuts around 35 characters and Apple
Mail on an iPhone around 35-40, both with an ellipsis. Anything at or under 35
survives in full everywhere, so the brand name can't be the part that gets cut.

## A note on images

There is exactly one image in this draft, and the email reads completely without
it. Gmail, Outlook and Apple Mail all block remote images by default for a sender
the recipient has never replied to, so a diagram-led email arrives as a stack of
empty boxes for most of the list. Anything that has to be understood is text.

If you want more visuals later, the safe version is more `##` sections and
bullets, not more images — those render identically everywhere.

---

## A note on line breaks

Do not re-wrap the paragraphs below. A single newline becomes a `<br>` — correct
when you intend a line break, wrong when it is just where your editor wrapped.
One paragraph per line; blank line between blocks.

## Body

![Apex Scholar](https://apex-scholar.com/og-image.png)

Hey,

School's back, so Apex Scholar is too. A few things changed over the summer and you'll want to know about them before the year runs away from you.

The date first. AP exams run May 3–14, 2027, and late testing is May 17–21. If your subjects are added, the countdown already knows which day you sit and whether you're morning or afternoon. Tick "taking the late exam" on a subject and it counts down to your date instead of the main one.

## Score calculators, no account needed

All 36 of them are public now. Put in your multiple-choice and free-response points, get an estimated 1–5.

The part I care about is that it shows you the curve. Other calculators hand you one number as though College Board publishes its cutoffs. It doesn't, and nobody outside College Board knows the real ones. So ours shows the composite range behind each score and says outright that it's an estimate.

[Score Calculator](https://apex-scholar.com/ap-score-calculator)

## Review remembers what you got wrong

[Review](https://apex-scholar.com/review) runs real spaced repetition now. Miss something on a diagnostic and it goes into your queue on its own, with the explanation for the answer *you* picked instead of only the correct one.

Pick the subjects you want, or take everything. Scheduled order or shuffled. Each grade button tells you when that card comes back, so "Hard" and "Good" stop being a coin flip. And if you get one wrong it returns in ten minutes, not tomorrow, which is the whole point.

## The rest of it, still free

AI tutors for every subject. Practice tests graded against the actual rubric with a predicted score. A scheduler that plans around your real Schoology assignments instead of a blank week. Flashcards, the photo solver, diagnostics that go unit by unit.

No trial, no paywall, no ads. Same as last year.

## Picked up a new AP this year?

Open Settings, add your subjects, connect Schoology if your school uses it. That's what switches on the scheduler and the countdown. Without your subjects the app can't tell you much.

## Tell someone

Apex Scholar spreads by word of mouth and nothing else. No ads, no budget, no sponsorships.

If it saved you time last year, send it to one person taking an AP this year — a friend in your class, a group chat, whoever asked you how you studied.

If something's broken or a question looks wrong, use the Feedback form in the app (right under the Settings button when you click your profile picture).

— Anvith

---

## Pre-send checklist

- [ ] **Preview** renders, and the image is not doing any load-bearing work
- [ ] Send yourself a test first — the audience count in the UI is live
- [ ] Every link resolves (`/ap-score-calculator`, `/review`)
- [ ] Exam dates still match
      [AP Central](https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates)
- [ ] Send outside 9am–3pm local so it doesn't land during class
- [ ] `MAIL_FROM` is a no-reply address, so the body must never say "reply to
      this" — point people at the in-app Feedback form instead
