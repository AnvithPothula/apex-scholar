# Apex Scholar (AP Prep Hub) - Developer Guide

## Architecture Overview

React 18 single-page app built with Create React App, Tailwind CSS, and Firebase. Provides AI-powered AP exam tutoring, practice tests, flashcards, scheduling, and a problem solver.

### Tech Stack
- **Frontend:** React 18.3.1 (CRA), Tailwind CSS 3 with design tokens, Framer Motion
- **Backend:** Firebase Auth + Firestore (no custom server)
- **AI:** Puter SDK (primary, free tier) with Google Gemini API fallback (11 rotating keys)
- **Math:** KaTeX for LaTeX rendering, react-markdown for rich text
- **Icons:** lucide-react

## Design Token System

All colors are CSS variables defined in `src/index.css`, mapped to Tailwind classes in `tailwind.config.js`.

**Usage pattern:** Always use token classes, never hardcode colors.
```
bg-base-950    # Deepest background
bg-base-900    # Page background
bg-base-850    # Card background
bg-base-800    # Input/elevated surface
bg-base-750    # Hover state

text-content-primary    # Headings, primary text
text-content-secondary  # Body text
text-content-muted      # Labels, hints
text-content-disabled   # Disabled elements

border-border           # Default border
border-border-subtle    # Subtle dividers
border-border-strong    # Emphasized borders

primary-400/500/600     # Teal accent (sparingly)
accent-400/500          # Slate-blue secondary accent
success/warning/error/info-400/500/900  # Semantic colors
```

**Typography tokens:** `text-display`, `text-h1`..`text-h4`, `text-body`, `text-body-sm`, `text-caption`, `text-label`, `text-overline`

**Fonts:** Plus Jakarta Sans (display), Source Sans 3 (body)

**Dark/light theming:** CSS variables swap via `[data-theme]` attribute, managed by `ThemeContext.js`.

## Component Library

Shared primitives in `src/components/ui/UIComponents.jsx`:
- **Button** — variants: primary, secondary, ghost, destructive, outline
- **Card, CardContent, CardHeader, CardTitle**
- **Input, Textarea** — with icon support
- **Badge** — 6 variants
- **Avatar, AvatarFallback**
- **DropdownMenu**
- **ScrollArea**
- **MultiSelectDropdown** — tag-based multi-select with search (`ui/MultiSelectDropdown.jsx`)
- **ModelSelector** — AI model picker (`ui/ModelSelector.jsx`)
- **HelpTooltip** — hover tooltip (`ui/HelpTooltip.jsx`)

## AI Service Layer

```
User Request
    ↓
geminiService.js (orchestrator)
    ↓
┌─ Puter SDK (primary) ─── Free AI models (Claude, GPT-4, etc.)
│   authenticated via Puter auth token
│   no API key needed
└─ Google Gemini (fallback) ─── 11 rotating API keys
    managed by APIKeyManager.js
    v1beta endpoint for gemini-2.5-* models
    rate limiting + key rotation on 429s
```

**Key files:**
- `services/geminiService.js` — Central AI class with prompt sanitization, Puter→Google fallback
- `services/ai/jsonParser.js` — JSON extraction/repair pipeline for AI responses (extracted from geminiService)
- `services/APIKeyManager.js` — Manages 11 Google API keys with rotation and rate limit tracking
- `services/apiManager.js` — Higher-level API orchestration

**JSON repair pipeline:** AI responses often have issues (LaTeX escape sequences, truncation, malformed structure). `services/ai/jsonParser.js` implements a multi-strategy repair pipeline: clean artifacts → direct parse → brace-matching → incremental repairs → truncation repair.

## Firebase Data Model

All user data is scoped under `users/{userId}/`:
- `conversations/` — AI tutor chat history (with `messages/` subcollection)
- `flashcardDecks/` — User's flashcard collections (public decks queryable by all)
- `practiceTests/` — Completed test results
- `testProgress/` — In-progress test state (auto-save)
- `studySessions/` — Scheduler study sessions
- `userProgress/` — Learning progress per subject
- `diagnosticResults/` — Diagnostic assessment results
- `userAchievements/` — Gamification achievements
- `solverHistory/` — Problem solver history
- `schoologyTokens/` — Schoology OAuth tokens (sensitive)

**Security rules:** `firestore.rules` — user-scoped access, default deny-all.

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/ai-tutors` | `AITutors.js` | Subject-specific AI chat tutors |
| `/smart-scheduler` | `SmartScheduler.js` | Intelligent study scheduler |
| `/practice-tests` | `PracticeTests.js` | AI-generated AP practice tests |
| `/flashcards` | `Flashcards.js` | Flashcard creation/study/sharing |
| `/solver` | `Solver.js` | Photo/text problem solver |
| `/settings` | `Settings.js` | User preferences, API keys, sync |

All pages are lazy-loaded via `React.lazy()` in `App.js`.

## Utility Modules

- `utils/testUtils.js` — Pure functions extracted from PracticeTests: question sorting, AI response parsing, LaTeX repair, duplicate detection, rubric building
- `utils/errorLogger.js` — Centralized logging (dev: console, prod: suppressed except errors)
- `constants/testConfigurations.js` — AP test config data (sections, units, timing) — single source of truth
- `hooks/useLocalStorage.js` — Typed localStorage hook with JSON parsing
- `hooks/useMobile.js` — Reactive viewport width hook using matchMedia

## Key Patterns

- **State:** `useState` hooks (no Redux/Zustand). Large pages have many state variables.
- **Routing:** React Router v6 with `createPageUrl()` helper for consistent URL generation
- **Auth:** Firebase Auth with `AuthContext` provider, `ProtectedRoute` wrapper
- **Error handling:** `ErrorBoundary.jsx` with centralized `errorLogger`. Production builds suppress `console.log/debug/info` (see `index.js`).
- **Performance:** Key list components wrapped in `React.memo` (MCQCard, TaskCard, SubjectSelector, APExamDashboard). Static data wrapped in `useMemo`.
- **Animations:** Framer Motion `AnimatePresence` + `motion.*` components
- **Accessibility:** ARIA labels on interactive elements, keyboard support (Escape to close dialogs, Enter/Space on custom buttons), focus management.

## Development

```bash
npm start        # Dev server on :3000
npm run build    # Production build
npm test         # Jest test runner
```

**Environment variables:** All prefixed `REACT_APP_*` (CRA requirement). See `.env.example` for full list.

**Important:** `REACT_APP_*` vars are inlined into the JS bundle at build time. Do not store secrets that shouldn't be client-visible.
