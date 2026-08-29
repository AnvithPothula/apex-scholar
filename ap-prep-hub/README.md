# Apex Scholar - AI-Powered AP Exam Prep

A modern web app for AP exam preparation with AI tutoring, practice test generation, intelligent scheduling, flashcards, and a problem solver. Built with React, Firebase, and Tailwind CSS.

## Features

### AI Tutors
Subject-specific AI tutors for every AP course. Real-time chat with context-aware responses, practice MCQ generation, and personalized learning. Supports multiple AI backends (Puter SDK for free access, Google Gemini as fallback).

### Practice Tests
Full-length, AI-generated AP practice tests with MCQ and FRQ sections. Timed test-taking, automatic scoring, detailed explanations, and test history tracking. Supports all AP subjects with unit-level filtering.

### Smart Scheduler
Intelligent study planner with task management, calendar view, priority-based scheduling, and Schoology calendar integration. Uses cognitive science principles for optimal study session planning.

### Flashcards
Create, study, and share flashcard decks. Public deck marketplace with search. Spaced repetition support and LaTeX rendering for math/science content.

### Problem Solver
Upload photos or type problems to get AI-powered step-by-step solutions. PDF support for worksheets.

### Settings
Profile management, AP subject selection, AI model preferences, Schoology integration, and data sync controls.

## Getting Started

### Prerequisites
- Node.js v16+
- Firebase project with Auth and Firestore enabled
- Google Gemini API key(s) (optional, for AI fallback)

### Installation

```bash
git clone <your-repo-url>
cd ap-prep-hub
npm install
```

### Environment Variables

Create a `.env` file in the project root. See `.env.example` for the full template.

**Required:**
```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

**AI (optional, for Gemini fallback):**

In **production**, do NOT put Gemini keys in `REACT_APP_*` — those are inlined into
the client bundle and exposed. Set the keys **server-side** in Netlify env so the
`ai-proxy` function uses them and the browser never sees them:
```
# Netlify env (server-side, NO REACT_APP_ prefix)
GEMINI_API_KEY=                     # Primary key
GEMINI_API_KEY_2= … GEMINI_API_KEY_11=   # Keys 2-11 for rotation
```
For **local dev only**, you may set `REACT_APP_GEMINI_API_KEY*` so `npm start` can
hit Gemini directly without running `netlify dev`. Never set them in a deployed env.
```env
# local dev only — leave blank in production
REACT_APP_GEMINI_API_KEY=
REACT_APP_GEMINI_API_KEY_2=
REACT_APP_GEMINI_API_KEY_11=
```

**Email (optional, for feedback form):**
```env
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
REACT_APP_EMAILJS_PUBLIC_KEY=
```

> **Note:** All `REACT_APP_*` variables are inlined into the JavaScript bundle at build time. They are visible in the client. Restrict API keys by HTTP referrer and API scope in Google Cloud Console.

### Run

```bash
npm start       # Dev server at http://localhost:3000
npm run build   # Production build, then prerenders the score-calculator pages
npm test        # Run tests
```

`npm run build` runs `scripts/prerender.mjs` after CRA. That writes a real HTML
file per AP score calculator with its own title, description and canonical, so
crawlers that don't execute JavaScript — and every link unfurler — see the
subject rather than one generic site title.

## Project Structure

```
ap-prep-hub/
  src/
    pages/              # Page components (lazy-loaded)
      AITutors.js       # AI chat tutors
      PracticeTests.js  # Practice test generation & taking
      SmartScheduler.js # Study scheduler
      Flashcards.js     # Flashcard system
      Solver.js         # Problem solver
      Settings.js       # User settings
      Learn.js          # Learning content
      Review.jsx        # Spaced-repetition review queue
      Diagnostics.js    # Unit-level diagnostic assessments
      ScoreCalculator.jsx  # Public AP score calculators (no account needed)
      NotFound.jsx      # 404 page
    components/
      ui/               # Shared UI primitives (Button, Card, Input, etc.)
      tutors/           # AI tutor components (ChatMessage, SubjectSelector)
      scheduler/        # Scheduler components (CalendarGrid, TaskCard)
      settings/         # Settings components
      auth/             # Login, OAuth callbacks
      tools/            # Solver tools (FileUpload, CalculatorPad)
      Layout.jsx        # App shell with navigation
      ErrorBoundary.jsx # React error boundary
      MarkdownRenderer.jsx  # Markdown + math rendering
      LaTeXRenderer.jsx     # LaTeX math rendering
    services/
      geminiService.js  # AI orchestrator (Puter + Gemini fallback)
      APIKeyManager.js  # API key rotation for Gemini
      dataService.js    # Firestore CRUD operations
      backgroundSync.js # Background data sync
      assignmentSync.js # Schoology assignment sync
      srs.js            # SM-2 spaced repetition scheduling
      reviewSession.js  # Review session assembly (filter, order, grade labels)
      questionBank.js   # Reads the pre-generated shared MCQ bank
    constants/          # Static data (subjects, curriculum, exam dates)
    contexts/           # React contexts (Auth, Theme)
    utils/              # Utilities (scheduler, timezone, helpers)
    config/             # Firebase config
  scripts/
    prerender.mjs             # Post-build SEO prerender (runs from `npm run build`)
    seed-question-bank.mjs    # Admin-only MCQ bank seeder (see below)
  netlify/functions/    # Serverless endpoints (AI proxy, email, admin stats)
  cloudflare/ai-router/ # Cloudflare Worker: model routing, caching, key rotation
  firestore.rules       # Firestore security rules
  tailwind.config.js    # Tailwind + design token config
```

## Design System

The app uses a comprehensive design token system. Colors are CSS variables in `src/index.css`, mapped to Tailwind classes in `tailwind.config.js`. Supports dark and light themes.

See `CLAUDE.md` for the full token reference and developer guide.

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password + Google provider)
3. Enable **Firestore Database**
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Copy config values to `.env`

## Question bank

Diagnostics used to generate 15 questions per student per attempt for content
that is identical for everyone. `src/services/questionBank.js` serves them from
a shared Firestore bank instead, falling back to live generation for whatever
the bank can't cover.

Seeding is admin-only and runs off a service account — the bank is world-readable
and shared, so a client that could write to it could put a wrong answer key in
front of every student:

```bash
node scripts/seed-question-bank.mjs --dry-run
node scripts/seed-question-bank.mjs --subject "AP Biology" --bundles 10
```

Needs `GEMINI_API_KEY` plus either `FIREBASE_SERVICE_ACCOUNT` or
`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`.
Re-runs skip bundles that already exist, so an interrupted run is safe to repeat.

## AI capacity

Two things bound how many students the site can serve at once.

**1. Only one of the eleven Gemini keys works server-side.** Probed directly
against `generateContent`: key 1 is `API_KEY_SERVICE_BLOCKED`, keys 2-7 and
9-11 return `403 ... Requests from referer <empty> are blocked`, key 8 is the
only 200. The HTTP-referrer restriction is correct for `REACT_APP_GEMINI_API_KEY*`
(those are inlined into the client bundle) but the same values are also in
`GEMINI_API_KEYS`, which is what the *server* paths read. Fix in Google Cloud
Console: keep the referrer-restricted keys for the browser, issue a separate
unrestricted or IP-restricted set for the server.

**2. One practice test is ~13 model calls**, not one — 55 MCQs in batches of 6,
plus SAQ, DBQ and LEQ. With the per-user cap of one test per day:

Usable per key per day: 1,000 requests across the two 3.x flash-lite models,
plus 100 spread across six -flash models, over a Gemma floor of 28,800 that is
only good for overflow (see "Model choice" below).

| Daily active users | Calls/day | 1 working key (~1,100 RPD) | 11 keys (~12,100 RPD) |
|---|---|---|---|
| 80 | 1,040 | at the limit | fine |
| 300 | 3,900 | ~4x over | fine |

Burst matters too: 13 sequential calls at 15 RPM is ~52 s of rate-limit budget
per test on one key, versus ~5 s across eleven.

What already absorbs load: diagnostics cost zero model calls (they read the
pre-generated question bank), the router caches responses in KV for 30 days,
`aiUsageLimiter` caps each user at one test per day plus a pooled general
budget, and `services/aiQueue.js` serialises a tab's outbound calls so one
student's practice test cannot exhaust a key's RPM on its own.

Ordering *between* students would need shared server state — a Durable Object.
It is not built, because a queue redistributes scarcity rather than creating
capacity, and a rate limit now returns Google's real RetryInfo delay so clients
back off accurately instead of hammering. Revisit once the keys are fixed and
the numbers are 11x different.

## Model choice

Gemma is the tail of every chain and never the lead. Measured against this
app's own prompts:

| task | gemma-4-31b-it | gemini-3.1-flash-lite |
|---|---|---|
| mcqGenerate (JSON) | 2/3 parsed | 3/3 |
| explain (prose) | 0/3 clean | 3/3 |

Handed a prompt shaped as an instruction list it restates the task as a plan
(`* Subject: AP Biology. * Question: ...`) and calls that the answer. Every
prompt in this app is an instruction list. None of the published fixes work on
the free tier — tested directly:

| attempted fix | result |
|---|---|
| `responseMimeType: application/json` | 2/3 |
| `+ responseSchema` | 2/3 (truncates) |
| `+ responseJsonSchema` | 2/3 (returns empty) |
| `thinkingConfig: { thinkingBudget: 0 }` | HTTP 400, not supported for this model |
| `thinkingLevel: 'MINIMAL'` | HTTP 400, unknown field |

It is kept as a last resort because a 2-in-3 answer beats a hard failure, and
`looksLikeReasoningLeak()` rejects the bad output before a student sees it.

## Deployment

Three independent targets. Pushing to `main` deploys only the first.

```bash
# 1. App + Netlify Functions — automatic on push, or:
netlify deploy --prod

# 2. Firestore rules and indexes (NOT covered by the Netlify deploy)
firebase deploy --only firestore:rules,firestore:indexes

# 3. Cloudflare AI router (NOT covered by the Netlify deploy)
cd cloudflare/ai-router && wrangler deploy
```

## License

MIT
