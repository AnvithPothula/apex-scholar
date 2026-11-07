# Show HN: notes only. You write it and you post it.
HN bans generated and AI-edited text and automated posting, so there is deliberately no finished comment here.
Needs an HN account (none yet). Comment on other threads first; an account that only launches gets noticed.

Title options (under 80 chars, no hype):
- Show HN: Apex Scholar – Free AP exam prep with honest score ranges
- Show HN: A free, open-source AP exam prep site I built as a student

URL: https://apex-scholar.com/start (clean, no tags; no account needed)

First comment: write it yourself, in this order:
1. Who you are and the specific reason you built it. Only you know this.
2. Try it in a minute: pick subject -> 10 questions -> predicted score, range, today's plan. No account. Tutors also open to guests. Practice tests, flashcards and scheduler need sign-in.
3. Under the hood: React, Firebase, Gemini through a Cloudflare Worker with a Netlify fallback; free-tier quota pooling; MIT repo.
4. The audit, the most HN-worthy part:
   - 3,560 AI-generated questions
   - one pass: 14 wrong keys, 6 no correct choice, 2 with two correct choices
   - 1,082 quantitative items re-solved by two models, about 30 more fixes, final re-check 0 wrong
   - correct answer was often the longest choice: 865 items rewritten; items with any flagged flaw 33.7% -> 12.1%
5. Honest limits: score cut points are estimates; free AI quota can run out; two models agreeing doesn't prove a question is right; 12% still carry a flagged flaw.
6. Real numbers: 98 accounts, 5 signed in during the last 30 days.
7. Feedback you want: 2-3 specific questions, such as how you'd validate an AI-written question bank, and whether the range is more useful than a single score.

Questions to expect:
- How much did AI write the code? Say exactly how much. Don't dodge this.
- Why not Knowt? Be honest about where Knowt is better.
- Is the prediction accurate? No real-score data yet; it's an estimate.
- Student data and minors? Privacy policy, no ads, nothing sold.
- Why Gemini free tier? No budget; keeps it free.

Never ask anyone to upvote or comment. Keep a few hours free for replies.
