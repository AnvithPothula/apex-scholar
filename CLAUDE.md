# CLAUDE.md — Apex Scholar AI Assistant Guide

This document provides essential context for AI assistants (Claude, etc.) working on the Apex Scholar codebase.

---

## Project Overview

**Apex Scholar** is a React-based AI tutoring platform for AP (Advanced Placement) exam preparation. It supports 32 AP subjects with AI-powered tutoring, practice test generation, smart scheduling, flashcards, and a problem solver. The frontend is a single-page application deployed on Netlify, backed by Google Firebase (Authentication + Firestore) and the Google Gemini API.

**Live App URL:** Deployed via Netlify (see `netlify.toml`)

---

## Repository Layout

```
apex-scholar/
├── ap-prep-hub/              # Main React application (all source code lives here)
│   ├── src/
│   │   ├── components/       # Reusable UI components (40+)
│   │   │   ├── ui/           # Base design-system components
│   │   │   ├── auth/         # Login/signup forms
│   │   │   ├── scheduler/    # Smart scheduler components
│   │   │   ├── settings/     # Settings panels
│   │   │   ├── tutors/       # AI tutor UI
│   │   │   └── tools/        # Miscellaneous utilities
│   │   ├── pages/            # Top-level page components (route targets)
│   │   ├── services/         # External integrations (Gemini, Firebase, Schoology)
│   │   ├── contexts/         # React context providers (AuthContext)
│   │   ├── config/           # Firebase init + environment config
│   │   ├── constants/        # AP exam dates, full curriculum, subject list
│   │   ├── utils/            # Pure utility functions + scheduler engine
│   │   └── entities/         # JSON schemas for Firestore data models
│   ├── public/               # Static assets, favicons, PWA manifest, AP CED PDFs
│   ├── netlify/functions/    # Netlify serverless functions (CORS proxy)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── firebase.json
│   ├── firestore.rules
│   └── firestore.indexes.json
├── netlify.toml              # Netlify build + deploy config
├── README.md
├── SECURITY.md               # Security policies and key-rotation guidelines
└── PERFORMANCE.md            # Performance optimization notes and targets
```

> **All development work happens inside `ap-prep-hub/`.** The root-level `package.json` only contains the `remark-gfm` dependency and is not the build entry point.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 (Create React App) |
| Routing | React Router v6 |
| Styling | Tailwind CSS + CSS custom properties (design tokens) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend/Auth | Google Firebase (Firestore + Auth) |
| AI/LLM | Google Gemini API (via `geminiService.js`), Puter fallback |
| Math Rendering | KaTeX + react-markdown + remark-math + rehype-katex |
| PDF Handling | pdfjs-dist |
| Email | EmailJS |
| LMS Integration | Schoology OAuth |
| Deployment | Netlify (with serverless functions) |
| Date Utilities | date-fns |
| Encryption | crypto-js |

---

## Development Setup

### Prerequisites
- Node.js 18+
- A `.env` file in `ap-prep-hub/` (copy from `.env.example`)

### Install & Run

```bash
cd ap-prep-hub
npm install
npm start          # Development server on http://localhost:3000
```

### Build

```bash
cd ap-prep-hub
npm run build      # Production build → ap-prep-hub/build/
```

### Tests

```bash
cd ap-prep-hub
npm test                        # Interactive watch mode
npm test -- --watchAll=false    # Single run (CI-friendly)
npm test -- --coverage          # With coverage report
```

Test files live alongside the code they test (`*.test.js`). There are currently 6 test files covering the scheduler engine, timezone utilities, settings components, and Schoology services.

---

## Environment Variables

All environment variables are prefixed with `REACT_APP_` (Create React App convention). Copy `ap-prep-hub/.env.example` to `ap-prep-hub/.env` and fill in values.

### Required

```
# Google Gemini (11 keys for automatic rotation & failover)
REACT_APP_GEMINI_API_KEY=
REACT_APP_GEMINI_API_KEY_2=
...
REACT_APP_GEMINI_API_KEY_11=

# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

### Optional

```
# Debug mode (verbose AI logging)
REACT_APP_AI_DEBUG=false

# Custom Gemini model override
REACT_APP_GEMINI_MODEL=

# EmailJS (for user feedback)
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
REACT_APP_EMAILJS_PUBLIC_KEY=

# Schoology LMS integration
REACT_APP_SCHOOLOGY_CONSUMER_KEY=
REACT_APP_SCHOOLOGY_CONSUMER_SECRET=
```

---

## Routing

Routes are defined in `src/App.js`. Pages are lazy-loaded with `React.lazy()`.

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Redirect | → `/AITutors` |
| `/login` | LoginPage | Public |
| `/schoology-callback` | Schoology OAuth | Public |
| `/AITutors` | AITutors | Protected |
| `/AITutors/:subject` | AITutors | Protected, subject param |
| `/PracticeTests` | PracticeTests | Protected |
| `/Flashcards` | Flashcards | Protected |
| `/Solver` | Solver | Protected |
| `/SmartScheduler` | SmartScheduler | Protected |
| `/Settings` | Settings | Protected |
| `*` | NotFound | 404 page |

All protected routes require Firebase authentication. Unauthenticated users are redirected to `/login`.

---

## Key Services

### `geminiService.js` (64 KB)
Central AI integration layer. Key responsibilities:
- Calls Google Gemini API (with Puter as fallback)
- Manages 11 API keys with automatic rotation on rate-limit errors (`APIKeyManager.js`)
- Request deduplication — identical concurrent calls are merged into one
- Prompt sanitization via `sanitizeForPrompt()` to prevent injection
- Rate limiting via `apiManager.js`

**Never call the Gemini API directly from pages/components.** Always go through `geminiService.js`.

### `apiManager.js` (30 KB)
- Centralized queue for all outbound API requests
- Per-key and global rate limiting
- Retry logic with exponential backoff
- `RateLimitError` custom error class

### `dataService.js` (9 KB)
- All Firestore CRUD operations
- Follows the collection structure described in [Database Schema](#database-schema)

### `assignmentSync.js` + `schoologyAPI.js` + `schoologyCalendar.js`
- Schoology LMS OAuth flow and data synchronization
- Tokens stored encrypted in Firestore

---

## Firestore Database Schema

The app uses Google Firestore. The security rules (`firestore.rules`) enforce that all user data is scoped to the authenticated user's UID.

```
users/{userId}
  ├── testHistory/{testId}
  ├── flashcards/{flashcardId}
  ├── progress/{progressId}
  ├── schoologyTokens/{tokenId}
  ├── settings/{settingId}
  ├── tasks/{taskId}
  ├── schedulerPreferences/{prefId}
  ├── integrations/{integrationId}
  └── syncHistory/{syncId}

conversations/{conversationId}
  ├── messages/{messageId}
  └── mcqResponses/{responseId}

flashcardDecks/{deckId}
solverHistory/{historyId}
userProgress/{progressId}
practiceTests/{testId}
testProgress/{progressId}
studySessions/{sessionId}
diagnosticResults/{resultId}
userAchievements/{achievementId}
schoologyTokens/{tokenId}
reviews/{reviewId}
publicData/{document}
```

**Entity schemas** are documented as JSON files in `src/entities/`: `User.json`, `Conversation.json`, `Message.json`, `Task.json`.

---

## Authentication

Handled entirely by `src/contexts/AuthContext.js` using Firebase Auth.

- **Providers:** Google OAuth, Email/Password
- **State:** Exposed via `useAuth()` hook from `AuthContext`
- **Persistence:** Firebase session persistence (browser localStorage)
- **User profile data** is stored in Firestore under `users/{uid}`

---

## State Management

The app uses a minimal, pragmatic state approach:

| Scope | Mechanism |
|-------|-----------|
| Global auth | `AuthContext` (React Context) |
| Page/component UI state | `useState` / `useReducer` |
| Persistent user data | Firestore real-time listeners (`onSnapshot`) |
| Cached preferences | `localStorage` |

There is no Redux or Zustand — keep it that way unless complexity genuinely demands a global store.

---

## Styling Conventions

- **Tailwind CSS** is the primary styling tool — prefer utility classes over custom CSS.
- **Design tokens** live as CSS custom properties (see `tailwind.config.js` for `extend` values).
- **Fonts:** Plus Jakarta Sans (UI), Source Sans 3 (body).
- **Dark mode** is configured via the `class` strategy in Tailwind.
- Use `tailwind-merge` (via the `cn()` helper) to merge conditional classes without conflicts.
- Component variants use `clsx` for conditional class application.

---

## Coding Conventions

### File & Component Naming
- **Pages and Components:** PascalCase (`AITutors.js`, `BlackoutScheduleManager.jsx`)
- **Utilities and Services:** camelCase (`geminiService.js`, `intelligentScheduler.js`)
- **Constants:** camelCase (`apExamDates.js`, `comprehensiveCurriculum.js`)
- **Test files:** Co-located with the source file, `.test.js` suffix

### React Patterns
- Functional components only (no class components)
- Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
- Custom hooks for reusable Firebase listeners (prefix `use`)
- Lazy-load heavy pages with `React.lazy()` + `Suspense`
- Avoid prop drilling — lift state to the nearest common ancestor or use context

### Logging
- **Never use `console.log` unconditionally in production code.**
- Gate all debug logging behind `NODE_ENV === 'development'` or `REACT_APP_AI_DEBUG`.
- The `performanceMonitor.js` utility handles metrics in a production-safe way.

### Error Handling
- Use `try/catch` in all async service calls.
- Surface errors to the user via inline UI messages, not `alert()`.
- API rate-limit errors throw `RateLimitError` — handle them separately from generic errors.

### Security Rules (Non-Negotiable)
- **Never hardcode API keys or secrets** in source files. Use `.env` only.
- **Always sanitize user input** before including it in AI prompts — use `sanitizeForPrompt()`.
- **Never bypass Firestore security rules** by broadening them without a documented reason.
- Admin UIDs are hardcoded in `firestore.rules` — coordinate with the project owner before changing them.

---

## AI Integration Patterns

When working with AI-generated content:

1. **All AI calls go through `geminiService.js`** — do not make direct `fetch` calls to Gemini/OpenAI.
2. **Prompt injection prevention:** Use `sanitizeForPrompt(userInput)` before inserting any user-controlled text into a prompt.
3. **Streaming responses** are supported — use the streaming API for long-form content (e.g., explanations, tutoring).
4. **Model selection:** The model can be overridden via `REACT_APP_GEMINI_MODEL`. Default is managed by `geminiService.js`.
5. **Puter fallback:** If the primary Gemini keys are exhausted, the service falls back to Puter. Response formats differ — `geminiService.js` normalizes them.

---

## Performance Guidelines

See `PERFORMANCE.md` for full details. Key rules:

- **KaTeX and PDF.js are large** — only import them where needed; consider lazy-loading.
- The `comprehensiveCurriculum.js` constant file is ~378 KB — import only specific subjects/units when possible.
- The `intelligentScheduler.js` utility is ~117 KB — it runs CPU-intensive work; consider moving heavy operations to a Web Worker if UI jank occurs.
- Firebase `onSnapshot` listeners **must be unsubscribed** in `useEffect` cleanup to prevent memory leaks.
- Memoize expensive derived values with `useMemo` and stable callbacks with `useCallback`.

---

## Deployment

The app is deployed automatically by Netlify on every push to the configured branch.

```toml
# netlify.toml
[build]
  base    = "ap-prep-hub"
  command = "npm run build"
  publish = "build"
```

**Serverless functions** live in `ap-prep-hub/netlify/functions/`. Currently only `cors-proxy.js` exists — it proxies requests to bypass browser CORS restrictions.

**Static asset caching** is configured in `netlify.toml`:
- JS/CSS bundles: `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `Cache-Control: no-cache` (always revalidate)

**Security headers** enforced by Netlify:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Git Workflow

- `master` is the main branch.
- Feature/fix branches should follow the `claude/<description>-<id>` convention when created by AI assistants.
- Commit messages are imperative and descriptive (e.g., `Add onboarding, LaTeX fixes & AI personalization`).
- There are no pre-commit hooks configured — but run `npm test` before pushing.

---

## Common Tasks & Where to Look

| Task | File(s) |
|------|---------|
| Add a new AP subject | `src/constants/subjects.js`, `src/constants/comprehensiveCurriculum.js` |
| Add a new page/route | `src/App.js`, `src/pages/` |
| Change AI prompt behavior | `src/services/geminiService.js` |
| Modify Firestore security | `ap-prep-hub/firestore.rules` |
| Add a new Firestore collection | `firestore.rules`, `firestore.indexes.json`, `src/services/dataService.js` |
| Update UI design tokens | `ap-prep-hub/tailwind.config.js` |
| Add a new Netlify function | `ap-prep-hub/netlify/functions/` |
| Change auth behavior | `src/contexts/AuthContext.js` |
| Modify the scheduler algorithm | `src/utils/intelligentScheduler.js` |
| Update email templates | EmailJS dashboard + `src/services/emailService.js` |

---

## What to Avoid

- **Do not eject** from Create React App (`npm run eject`). Prefer adding a `craco.config.js` if build customization is needed.
- **Do not commit `.env` files.** The `.gitignore` already excludes them, but double-check.
- **Do not add new global state libraries** (Redux, Zustand, Jotai) without discussion — the current Context + Firestore pattern is intentional.
- **Do not call the Gemini API from page/component code directly** — always use `geminiService.js`.
- **Do not widen Firestore security rules** beyond user-scoped access without explicit approval.
- **Do not import all of `comprehensiveCurriculum.js`** in components that only need a single subject — it is very large.
