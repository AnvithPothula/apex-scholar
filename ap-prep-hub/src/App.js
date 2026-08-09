/* eslint-disable import/first */
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import AnimatedOutlet from './components/ui/AnimatedOutlet';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout.jsx';
import { LoginPage } from './components/auth/LoginPage';
// Lazy: this OAuth-callback route statically pulls schoologyAPI -> Firestore,
// which put the whole SDK in the initial bundle for a page almost nobody hits.
const SchoologyCallback = lazy(() =>
  import('./components/auth/SchoologyCallback').then((m) => ({ default: m.SchoologyCallback }))
);
import GuestGate from './components/GuestGate';
import { Calendar, FileQuestion, Zap, Calculator, Settings as SettingsIcon, Activity, GraduationCap, Brain, TrendingUp, Users } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/ui/PageSkeleton';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import ToastContainer from './components/ui/Toast';
import AiDowngradeNotice from './components/ui/AiDowngradeNotice';
// eslint-disable-next-line import/first
const AITutors = lazy(() => import('./pages/AITutors'));
// eslint-disable-next-line import/first
const SmartScheduler = lazy(() => import('./pages/SmartScheduler'));
// eslint-disable-next-line import/first
const PracticeTests = lazy(() => import('./pages/PracticeTests'));
// eslint-disable-next-line import/first
const Settings = lazy(() => import('./pages/Settings'));
// eslint-disable-next-line import/first
const Flashcards = lazy(() => import('./pages/Flashcards'));
// eslint-disable-next-line import/first
const Solver = lazy(() => import('./pages/Solver'));
// eslint-disable-next-line import/first
const Diagnostics = lazy(() => import('./pages/Diagnostics'));
// eslint-disable-next-line import/first
const LearnHub = lazy(() => import('./pages/LearnHub'));
// eslint-disable-next-line import/first
const Review = lazy(() => import('./pages/Review'));
// eslint-disable-next-line import/first
const Practice = lazy(() => import('./pages/Practice'));
// eslint-disable-next-line import/first
const Legal = lazy(() => import('./pages/Legal'));
// eslint-disable-next-line import/first
const ProgressPage = lazy(() => import('./pages/Progress'));
// eslint-disable-next-line import/first
const Classes = lazy(() => import('./pages/Classes'));
// eslint-disable-next-line import/first
const NotFound = lazy(() => import('./pages/NotFound'));
import { createPageUrl } from './utils/helpers';
import { initializeBackgroundSync } from './services/backgroundSync';
import { initAnalytics, trackPageView } from './utils/analytics';

// Per-feature copy shown to guests on the sign-in upsell (GuestGate).
// AI Tutors is intentionally absent — it's open to guests.
const FEATURES = {
  scheduler:   { icon: Calendar,     title: 'Smart Scheduler',  preview: '/guest-previews/scheduler.jpg',   blurb: 'Sign in for free to build an AI study schedule that adapts to your subjects, deadlines, and Schoology assignments.' },
  practice:    { icon: FileQuestion, title: 'Practice Tests',    preview: '/guest-previews/practice.jpg',    blurb: 'Sign in for free to generate full-length AP practice tests with timed sections and detailed scoring.' },
  flashcards:  { icon: Zap,          title: 'Flashcards',        preview: '/guest-previews/flashcards.jpg',  blurb: 'Sign in for free to create, study, and share flashcard decks with spaced repetition.' },
  solver:      { icon: Calculator,   title: 'Problem Solver',    preview: '/guest-previews/solver.jpg',      blurb: 'Sign in for free to get step-by-step solutions to any problem from a photo or text.' },
  settings:    { icon: SettingsIcon, title: 'Settings',          preview: '/guest-previews/settings.jpg',    blurb: 'Sign in for free to pick your AP subjects, customize your tutor, and manage your account.' },
  diagnostics: { icon: Activity,     title: 'Diagnostics',       preview: '/guest-previews/diagnostics.jpg', blurb: 'Sign in for free to run a diagnostic that pinpoints your strengths and weak spots per subject.' },
  learn:       { icon: GraduationCap, title: 'Learn',            blurb: 'Sign in for free to explore interactive timelines and study lessons for your AP subjects.' },
  review:      { icon: Brain,        title: 'Review',            blurb: 'Sign in for free to turn every question you miss into a spaced-repetition card that comes back until it sticks.' },
  practiceHub: { icon: FileQuestion, title: 'Practice',          blurb: 'Sign in for free to take AP practice tests, study flashcards, and review every question you have missed.' },
  progress:    { icon: TrendingUp,   title: 'Progress',          blurb: 'Sign in for free to track your accuracy, streaks, and measured weak spots across every AP subject.' },
  classes:     { icon: Users,        title: 'Classes',           blurb: 'Sign in for free to join your class or club with a link and compare progress on a shared leaderboard.' },
};

// Main App Component
function App() {
  // Initialize background sync when app starts
  useEffect(() => {
    initializeBackgroundSync();
    // No-op unless REACT_APP_GA_MEASUREMENT_ID is set, so dev and previews
    // never send events.
    initAnalytics();
  }, []);

  return (
    <ThemeProvider>
    <ToastProvider>
    <ConfirmProvider>
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/schoology-callback" element={<Suspense fallback={<PageSkeleton />}><SchoologyCallback /></Suspense>} />
          <Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        </Routes>
        <AnalyticsRouteTracker />
        <ToastContainer />
        <AiDowngradeNotice />
      </Router>
    </AuthProvider>
    </ConfirmProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * Client-side redirect from an old PascalCase route to its kebab-case
 * equivalent, preserving any subpath.
 *
 * Lives alongside the Netlify _redirects 301s as defense-in-depth:
 *   - Netlify _redirects fires only on initial HTTP requests, so it
 *     misses any client-side react-router navigation. This catches those.
 *   - On localhost (CRA dev server) there's no Netlify layer at all,
 *     so this is the only thing redirecting old URLs.
 *
 * Example: hit `/AITutors/AP%20Statistics` → renders this component
 * with `to="/ai-tutors"` and splat="AP%20Statistics" → Navigate to
 * `/ai-tutors/AP%20Statistics`.
 */
/**
 * /join/:code → /classes/:code. The short link is what teachers actually share,
 * but the class page is where the join happens, so this is a pure redirect.
 */
function JoinRedirect() {
  const { code } = useParams();
  return <Navigate to={`${createPageUrl('Classes')}/${code || ''}`} replace />;
}

/**
 * SPA route changes aren't page loads, so GA never sees them without this.
 * Lives inside the Router so it can use useLocation.
 */
function AnalyticsRouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

function LegacyRedirect({ to }) {
  const params = useParams();
  const splat = params['*'] || '';
  const target = splat ? `${to}/${splat}` : to;
  return <Navigate to={target} replace />;
}

// Main App with Layout
function MainApp() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<Layout><ErrorBoundary><Suspense fallback={<PageSkeleton />}><AnimatedOutlet /></Suspense></ErrorBoundary></Layout>}>
          <Route index element={<Navigate to={createPageUrl("AITutors")} replace />} />
          <Route path={createPageUrl("AITutors")} element={<AITutors />} />
          <Route path={createPageUrl("AITutors", ":subject")} element={<AITutors />} />
          <Route path={createPageUrl("SmartScheduler")} element={<GuestGate feature={FEATURES.scheduler}><SmartScheduler /></GuestGate>} />
          <Route path={createPageUrl("PracticeTests")} element={<GuestGate feature={FEATURES.practice}><PracticeTests /></GuestGate>} />
          <Route path={createPageUrl("Flashcards")} element={<GuestGate feature={FEATURES.flashcards}><Flashcards /></GuestGate>} />
          <Route path={createPageUrl("Solver")} element={<GuestGate feature={FEATURES.solver}><Solver /></GuestGate>} />
          <Route path={createPageUrl("Settings")} element={<GuestGate feature={FEATURES.settings}><Settings /></GuestGate>} />
          <Route path={createPageUrl("Diagnostics")} element={<GuestGate feature={FEATURES.diagnostics}><Diagnostics /></GuestGate>} />
          <Route path={createPageUrl("Diagnostics", ":subject")} element={<GuestGate feature={FEATURES.diagnostics}><Diagnostics /></GuestGate>} />
          <Route path={createPageUrl("Diagnostics", ":subject/start")} element={<GuestGate feature={FEATURES.diagnostics}><Diagnostics /></GuestGate>} />
          {/* Legal pages are intentionally NOT behind GuestGate — they must be
              readable (and crawlable) without an account, and linkable from
              outside the app. */}
          <Route path={createPageUrl("Privacy")} element={<Legal />} />
          <Route path={createPageUrl("Terms")} element={<Legal />} />
          <Route path={createPageUrl("Practice")} element={<GuestGate feature={FEATURES.practiceHub}><Practice /></GuestGate>} />
          <Route path={createPageUrl("Review")} element={<GuestGate feature={FEATURES.review}><Review /></GuestGate>} />
          <Route path={createPageUrl("Progress")} element={<GuestGate feature={FEATURES.progress}><ProgressPage /></GuestGate>} />
          <Route path={createPageUrl("Classes")} element={<GuestGate feature={FEATURES.classes}><Classes /></GuestGate>} />
          <Route path={createPageUrl("Classes", ":code")} element={<GuestGate feature={FEATURES.classes}><Classes /></GuestGate>} />
          {/* Short share link. Kept separate from /classes/:code so the thing a
              teacher pastes into a slide reads as an invitation, not a page. */}
          <Route path="/join/:code" element={<JoinRedirect />} />
          {/* Learn is dev-only for now (LearnHub redirects non-admins). No
              GuestGate wrap — guests just get redirected too, no upsell for a
              feature users can't access yet. */}
          <Route path={createPageUrl("Learn")} element={<LearnHub />} />
          <Route path={`${createPageUrl("Learn")}/timeline/:subject`} element={<LearnHub />} />
          <Route path={`${createPageUrl("Learn")}/curriculum/:subject`} element={<LearnHub />} />

          {/* Legacy PascalCase routes — redirect to kebab-case canonicals.
              The `/*` splat catches subpaths (e.g., /AITutors/statistics). */}
          <Route path="/AITutors/*"       element={<LegacyRedirect to="/ai-tutors" />} />
          <Route path="/SmartScheduler/*" element={<LegacyRedirect to="/smart-scheduler" />} />
          <Route path="/PracticeTests/*"  element={<LegacyRedirect to="/practice-tests" />} />
          <Route path="/Flashcards/*"     element={<LegacyRedirect to="/flashcards" />} />
          <Route path="/Solver/*"         element={<LegacyRedirect to="/solver" />} />
          <Route path="/Settings/*"       element={<LegacyRedirect to="/settings" />} />
          <Route path="/Diagnostics/*"    element={<LegacyRedirect to="/diagnostics" />} />
        </Route>
        {/* 404 renders full-screen, outside the Layout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
