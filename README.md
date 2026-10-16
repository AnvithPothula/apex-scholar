# Apex Scholar 🎓

Free AI-powered AP exam prep — tutors, practice tests with AI grading, spaced repetition, and a
study scheduler. Live at **[apex-scholar.com](https://apex-scholar.com)**.

> **Positioning:** everything AP prep normally charges for, free. The wedge is
> **AI-graded FRQs** — no free competitor does it well.

## 🌟 Features

| Route | What it does |
|---|---|
| `/start` | First-run check: 10 banked questions → predicted AP score with an honest range and today's plan. **Open to guests.** `/` sends anyone who hasn't done it here, everyone else to the tutors. |
| `/study` | **Learn** (formerly Study packs): interactive timelines, then every AP course (from `src/data/packs/catalog.js`, unit names read from each current CED), your subjects first; courses without packs show "Coming soon". Also a tile on the Practice hub. **Open to guests.** |
| `/study/<subject>` | That class's units with saved progress and the unit to do next (continue / up next / worth a review). **Open to guests.** |
| `/study/timelines/<slug>` | Interactive timelines (AP U.S. History live at `/study/timelines/ap-us-history`; the old `us-history` slug and the old `/learn` hub redirect here). Grid by Period and decade on desktop, a vertical list with Period/Theme dropdowns on phones; search, theme filters, starred events (saved like highlights: localStorage plus `users/{uid}/progress/hl_timeline-*`), "Quiz me on Period N" (put one event per decade in order), Lessons links to Learn units that exist, and a per-event AI study note with "Ask the tutor" (opens the course tutor with the question filled in). **Open to guests.** |
| `/study/<subject>/unit-N` | Study packs (Unit 1, or Big Idea 1, of all 39 AP courses, plus Unit 2 of AP Biology, Calculus AB, Psychology, U.S. History, U.S. Government, World History, English Language, Precalculus, Physics 1, Chemistry, Environmental Science, Statistics, Human Geography, Macroeconomics and Microeconomics; AP Physics 2 and AP Physics C: E&M start at their first units, 9 and 8; unwritten units say "Coming soon"; the Biology, Calculus, Psychology, Physics 1, Chemistry, Statistics and Microeconomics Unit 2s adapt Dan McCreary's CC BY-NC-SA 4.0 intelligent textbooks or rebuild their MicroSims and are shared under that license): hand-checked lessons in the format each topic suits (text, flashcards, worked steps, simulations, timeline and sorting activities), checkpoints with recaps and end-of-session retries, a student-chosen length (key ideas / full / pre-check), and adaptivity: a miss earns one more question on that topic, per-topic status (known / review) is saved, and returning students get "Focus on my weak spots" and a pre-check that skips what they've shown. Progress resumes anywhere (`users/{uid}/progress/pack_*`, localStorage for guests). Highlight any text in a pack for Apex's own Ask / Explain / Copy menu (it replaces the device's selection menu), which also saves highlights in yellow, blue, green or red (text-quote anchors re-found on every render; localStorage plus `users/{uid}/progress/hl_*`); tap a saved highlight to recolour or remove it; answers appear in a side panel or phone bottom sheet with follow-ups, via the `tutorChat` AI task, so guests can use it too. **Open to guests.** Content lives in `src/data/packs/`. |
| `/ai-tutors/<slug>` | Subject-specific AI chat tutors, on Learn's slugs (`/ai-tutors/ap-biology`; older `/ai-tutors/biology` links redirect). **Open to guests** — no account needed. |
| `/practice` | Hub for Practice Tests, Review, Flashcards and Classes. |
| `/practice-tests` | AI-generated exam-format tests (MCQ, SAQ, DBQ, LEQ, FRQ) with timing, AI rubric grading, and auto-save/resume. The test itself is laid out like College Board's Bluebook app (full screen; Directions, timer with Hide, Mark for Review, answer eliminator, split source/question panes, question navigator, Check Your Work page, "Apex Scholar" where Bluebook shows the student's name); marks and cross-outs are saved with auto-save and come back on resume. A free response the AI grader couldn't reach is shown as "Not graded" and left out of the score, with a **Grade it now** button on the result (also from history). Signed-in feature: guests see a sign-in card that says it's free. |
| `/review` | SM-2 spaced repetition over every question you missed, and every flashcard marked "Didn't Know". Pick one subject or mix. The queue is one doc, capped at 300 cards and ~900 KB. |
| `/flashcards` | Create, study, or share decks. **Import from Quizlet** by pasting their export. Organize decks into **folders** (names on `users/{uid}.flashcardFolders`, each deck's `folder` field); flashcards in Learn units can be saved to a new named set or added to an existing one (duplicates skipped). |
| `/classes` | Class/club join links with a shared leaderboard (members with fewer than 10 answers rank after everyone with a real sample). Multiple owners supported. |
| `/progress` | Measured mastery per subject, streaks, weekly activity, achievements. |
| `/diagnostics` | Short diagnostic per subject to find weak spots (`/diagnostics/<slug>/start`; older name-based links redirect). |
| `/solver` | Photo or text problem solver with step-by-step solutions. |
| `/smart-scheduler` | Study schedule built from your subjects, deadlines and real AP exam dates. List, Week and Month views (available as soon as you have a task): sessions coloured by difficulty, task due dates (including synced Schoology assignments) as clickable "Due" markers, AP exams, and finished tasks crossed out. On phones the week view fits the screen and opens on today at study time. |
| AI usage | Every AI feature spends a share of a 5-hour and a weekly limit, shown as % used (Settings → AI Usage, and live under the tutor box). Each task costs a set amount (`TASK_COST` in `src/services/aiUsageLimiter.js`: e.g. a tutor reply 1.5% of 5 hours, a photo solve 4%, a flashcard deck 5%). Guests get the same meter at a smaller size. Practice tests have their own 1-per-day limit. `ai-proxy` keeps a looser per-call backstop (`AI_PROXY_5H_LIMIT`, `AI_PROXY_WEEK_LIMIT`). |
| `/ap-score-calculator/<slug>` | **Public, no sign-in.** Estimate a 1–5 from raw section scores, and see the curve used. Slugs match Learn's; the 13 older ones (`ap-gov`, `ap-world-history`, …) 301 in `public/_redirects` and redirect in the app. |
| `/settings` | Subjects, AI personalisation, email preferences, integrations. |
| `/privacy`, `/terms` | Public legal pages. |
| Feedback (header button, also for guests) | Type, area (prefilled from the page), optional 1–5 rating, summary, a follow-up per type, "about you" (role, grade, AP classes), contact consent and opt-in device info. Saved by `netlify/functions/feedback` (validated against allow-lists in `netlify/lib/feedback.js`, 5 per 10 min) to the server-only Firestore `feedback` collection, and emailed through EmailJS; either one succeeding counts as sent. Bug reports are a separate form. |

### Honesty principles baked into the product
These are deliberate and worth preserving:

- **Evidence before verdicts.** Mastery reports nothing until it has enough answered questions
  (`MIN_SAMPLES`), rather than declaring a "weak area" from one question.
- **Skipping ≠ being wrong.** Unanswered questions are excluded from scoring and mastery.
- **Estimates are labelled as estimates.** The score calculator shows its whole curve and states
  that the College Board does not publish cut points.
- **No fabricated personalisation.** Recommendations come from measured data or are not shown.

## 🛠️ Stack

- **Frontend:** React 18 (Create React App), Tailwind CSS with design tokens, Framer Motion
- **Auth/DB:** Firebase Auth + Firestore (rules in `firestore.rules`)
- **AI:** Google Gemini via a **server-side proxy** — a Cloudflare Worker (`ai.apex-scholar.com`)
  with the Netlify function `ai-proxy` as fallback. Task→model chains route bulk work to Gemma and
  reserve scarce Flash quota for FRQ grading. Optional: a student can connect their own Puter
  account (AI model menu) to pick Puter models; the Puter SDK loads only for them (or when the
  connect dialog opens), and any Puter failure falls through to the proxy.
- **Subject names:** one table, `src/constants/subjects.js` (built from `src/data/packs/catalog.js`):
  the official College Board name in headings, titles, pickers and prose, and one fixed short form
  per course for chips, tags and narrow spots. `courseFor()` resolves any older name, curriculum
  key or slug, so stored data with old names still groups and displays under the current one.
- **Hosting/serverless:** Netlify (`netlify/functions/*`)
- **Email:** Cloudflare Email Routing inbound, SMTP2GO outbound. `email-weekly` (scheduled daily, 14:00 UTC) sends the Sunday digest and the daily final-week email; it is a dry run until `WEEKLY_EMAIL_ENABLED=true`. Every email links to a no-login preferences page (`email-unsubscribe`) with per-category opt-outs (weekly digest, exam-week reminders, announcements) and "unsubscribe from all"; the same toggles are in Settings
- **Analytics:** GA4, env-gated so dev and previews send nothing. Events: `sign_up`, `first_run_complete`, `test_completed`

> ⚠️ **AI keys are server-side.** Anything named `REACT_APP_*` is inlined into the public browser
> bundle by CRA — used or not. Never put a secret in one.

## 🚀 Getting started

```bash
git clone https://github.com/AnvithPothula/apex-scholar.git
cd apex-scholar/ap-prep-hub
npm ci                    # needs npm 11 — see below
cp .env.example .env      # fill in Firebase web config at minimum
npm start                 # http://localhost:3000
```

The lockfile was written by npm 11. With npm 10 (the version bundled with Node 20 and 22),
`npm ci` refuses to install and reports that package.json and package-lock.json are out of
sync. They aren't; npm 10 just reads the lockfile differently. Run `npm install -g npm@11`
first, or use `npx npm@11 ci`. CI does the same thing.

### Running with serverless functions
`npm start` runs `ai-proxy`, `cors-proxy`, `class-record-test`, `schoology-oauth` and
`admin-stats` itself (`src/setupProxy.js`), reading their server-side secrets (`GEMINI_API_KEYS`,
app tokens) from `.env`, so AI, calendar feeds and class leaderboards work in plain dev with no
keys in the browser bundle. The email functions are left out on purpose (a dev click could send
real mail). To exercise them locally, run Netlify Dev **from the repository root** (not from `ap-prep-hub` — the
`base` in `netlify.toml` is relative to the root and will double up):

```bash
cd apex-scholar && netlify dev   # http://localhost:8888
```

Stop anything already on port 3000 first, or CRA fails to start and chunks fail to load.

### Useful scripts
```bash
npm start          # dev server on :3000
npm run start:https # https://localhost:3000 — needed to exercise the real Google redirect sign-in
npm run build      # production build
npm test           # Jest
```

## 📁 Structure

```
apex-scholar/
├── netlify.toml                  # build + functions config (base = ap-prep-hub)
├── ap-prep-hub/
│   ├── firestore.rules           # security rules — user-scoped, default deny
│   ├── netlify/
│   │   ├── functions/            # ai-proxy, admin-stats, class-record-test, email-broadcast,
│   │   │                         # email-weekly, email-unsubscribe, cors-proxy, schoology-oauth
│   │   └── lib/                  # shared function code (firebase-admin, class scoring, weekly digest, exam dates)
│   ├── cloudflare/ai-router/     # the Cloudflare Worker that fronts Gemini
│   └── src/
│       ├── pages/                # one file per route above
│       ├── components/           # ui/, practice/, scheduler/, admin/, flashcards/
│       ├── services/             # geminiService, srs, mastery, classes, activityTracker, …
│       ├── utils/                # apScore, whyWrong, quizletImport, examTime, analytics, …
│       └── constants/            # apScoreModels, testConfigurations, apExamDates, admins
├── ap-prep-hub/public/ced/        # College Board CED PDFs, one per course
├── .claude/skills/ap-year-rollover/  # yearly course/exam-date update, incl. Python helpers
└── requirements.txt              # Python helper scripts (standard library only)
```

### Python helpers
The app itself needs no Python. The yearly rollover scripts and the score-curve research script
(`ap-prep-hub/docs/research/ap-score-curves/final.py`) use only the standard library, so
`requirements.txt` has no packages in it; it records the Python version (3.8+) and the one system
tool the CED scripts call, `pdftotext` from poppler (`brew install poppler` or
`apt-get install poppler-utils`).

## 🔒 Security notes

- Firestore rules are **deny-by-default** and user-scoped. Reads of a document by a *derived id*
  need an id branch in the rule — `resource.data` is `null` for a document that does not exist yet,
  so an ownership check alone denies the first read.
- The AI endpoints (the Cloudflare Worker and the `ai-proxy` fallback) are origin-locked by CORS.
  Signed-in users are identified by their Firebase ID token and get a per-user quota; guests can
  only use tutor chat, with no images. An app token is optional: set `APP_TOKEN` on the Worker or
  `AI_PROXY_APP_TOKEN` in Netlify and requests without it get a 401. It ships in the public bundle,
  so it slows down casual bots and is not a secret.
- Class leaderboard scores are written only by the `class-record-test` function. The browser sends
  the id of the test it just saved; the function re-marks the multiple-choice answers against the
  test's answer key, credits each test once, and only within 24 hours of it being saved. Rules stop
  students writing score fields themselves. The limit: the test doc (answer key included) is still
  saved by the browser, so a student who forges a whole fake test can still inflate their score.
  Closing that means generating and grading tests on the server.
- The `schoology-oauth` function keeps the consumer secret and every user's Schoology token
  server-side and its `api_call` action is **read-only**: GET to an allow-list of read paths
  (`netlify/lib/schoologyGuard.js`). Schoology OAuth 1.0a tokens have no scopes, so forwarding a
  POST/PUT/DELETE could change or delete a student's own work. Students authorize on their own
  school's Schoology host; a 401 (tokens expire after 90 days) flags the integration
  `needsReconnect`. The in-app Schoology sign-in is currently off; the calendar feed is the
  supported path.
- Admin UIDs are duplicated across `src/constants/admins.js`, `firestore.rules`, and the functions
  (three runtimes that cannot import each other). `src/constants/admins.test.js` fails if they drift.
- Server-only secrets live in Netlify **without** the `REACT_APP_` prefix.

## 🧪 Testing

```bash
npm test
```
Covers the SM-2 scheduler, mastery/evidence rules, AP score models (including an integrity test that
section weights sum to the composite max), Quizlet import parsing, exam-time parsing, join codes,
admin-UID drift, and the email broadcast safety gates.

**A green build is not evidence a page renders.** Load changed routes in a browser before calling
work done — several defects have shipped past passing builds and tests.

## 🤝 Contributing

1. Fork, branch (`git checkout -b feature/thing`)
2. `npm test` and `CI=true npm run build` must both be clean
3. Update this README if your change makes it inaccurate
4. Open a PR

## 📄 License

MIT — see [LICENSE](LICENSE).

## 📧 Contact

**help@apex-scholar.com**

---

AP® is a trademark registered by the College Board, which is not affiliated with, and does not
endorse, Apex Scholar.
