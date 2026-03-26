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
```env
REACT_APP_GEMINI_API_KEY=           # Primary key
REACT_APP_GEMINI_API_KEY_2=         # Keys 2-11 for rotation
...
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
npm run build   # Production build
npm test        # Run tests
```

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
    constants/          # Static data (subjects, curriculum, exam dates)
    contexts/           # React contexts (Auth, Theme)
    utils/              # Utilities (scheduler, timezone, helpers)
    config/             # Firebase config
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

## Deployment

```bash
npm run build
firebase deploy --only hosting
```

Also works with Vercel, Netlify, or any static hosting.

## License

MIT
