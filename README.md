# Apex Scholar 🎓

Free AI-powered AP exam prep — tutors, practice tests with AI grading, spaced repetition, and a
study scheduler. Live at **[apex-scholar.com](https://apex-scholar.com)**.

> **Positioning:** everything AP prep normally charges for, free. The wedge is
> **AI-graded FRQs** — no free competitor does it well.

## 🌟 Features

| Route | What it does |
|---|---|
| `/ai-tutors` | Subject-specific AI chat tutors. **Open to guests** — no account needed. |
| `/practice` | Hub for Practice Tests, Review, Flashcards and Classes. |
| `/practice-tests` | AI-generated exam-format tests (MCQ, SAQ, DBQ, LEQ, FRQ) with timing, AI rubric grading, and auto-save/resume. |
| `/review` | SM-2 spaced repetition over every question you missed. Pick one subject or mix. |
| `/flashcards` | Create, study, or share decks. **Import from Quizlet** by pasting their export. |
| `/classes` | Class/club join links with a shared leaderboard. Multiple owners supported. |
| `/progress` | Measured mastery per subject, streaks, weekly activity, achievements. |
| `/diagnostics` | Short diagnostic per subject to find weak spots. |
| `/solver` | Photo or text problem solver with step-by-step solutions. |
| `/smart-scheduler` | Study schedule built from your subjects, deadlines and real AP exam dates. |
| `/ap-score-calculator` | **Public, no sign-in.** Estimate a 1–5 from raw section scores, and see the curve used. |
| `/settings` | Subjects, AI personalisation, email preferences, integrations. |
| `/privacy`, `/terms` | Public legal pages. |

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
  reserve scarce Flash quota for FRQ grading.
- **Hosting/serverless:** Netlify (`netlify/functions/*`)
- **Email:** Cloudflare Email Routing inbound, SMTP2GO outbound
- **Analytics:** GA4, env-gated so dev and previews send nothing

> ⚠️ **AI keys are server-side.** Anything named `REACT_APP_*` is inlined into the public browser
> bundle by CRA — used or not. Never put a secret in one.

## 🚀 Getting started

```bash
git clone https://github.com/yourusername/apex-scholar.git
cd apex-scholar/ap-prep-hub
npm install
cp .env.example .env      # fill in Firebase web config at minimum
npm start                 # http://localhost:3000
```

### Running with serverless functions
Functions do **not** run under `npm start`. To exercise `ai-proxy`, `admin-stats`, or the email
functions locally, run Netlify Dev **from the repository root** (not from `ap-prep-hub` — the
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
│   │   ├── functions/            # ai-proxy, admin-stats, email-broadcast, email-unsubscribe,
│   │   │                         # cors-proxy, schoology-oauth
│   │   └── lib/                  # shared function code (firebase-admin bootstrap)
│   ├── cloudflare/ai-router/     # the Cloudflare Worker that fronts Gemini
│   └── src/
│       ├── pages/                # one file per route above
│       ├── components/           # ui/, practice/, scheduler/, admin/, flashcards/
│       ├── services/             # geminiService, srs, mastery, classes, activityTracker, …
│       ├── utils/                # apScore, whyWrong, quizletImport, examTime, analytics, …
│       └── constants/            # apScoreModels, testConfigurations, apExamDates, admins
└── AP Course and Exam Descriptions/
```

## 🔒 Security notes

- Firestore rules are **deny-by-default** and user-scoped. Reads of a document by a *derived id*
  need an id branch in the rule — `resource.data` is `null` for a document that does not exist yet,
  so an ownership check alone denies the first read.
- The AI proxy requires an app token; without it the endpoint returns 401.
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
