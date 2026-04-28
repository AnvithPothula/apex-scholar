/* eslint-disable import/first */
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import AnimatedOutlet from './components/ui/AnimatedOutlet';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout.jsx';
import { LoginPage } from './components/auth/LoginPage';
import { SchoologyCallback } from './components/auth/SchoologyCallback';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/ui/PageSkeleton';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/Toast';
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
const NotFound = lazy(() => import('./pages/NotFound'));
import { createPageUrl } from './utils/helpers';
import { initializeBackgroundSync } from './services/backgroundSync';

// Main App Component
function App() {
  // Initialize background sync when app starts
  useEffect(() => {
    initializeBackgroundSync();
  }, []);

  return (
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/schoology-callback" element={<SchoologyCallback />} />
          <Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
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
          <Route path={createPageUrl("SmartScheduler")} element={<SmartScheduler />} />
          <Route path={createPageUrl("PracticeTests")} element={<PracticeTests />} />
          <Route path={createPageUrl("Flashcards")} element={<Flashcards />} />
          <Route path={createPageUrl("Solver")} element={<Solver />} />
          <Route path={createPageUrl("Settings")} element={<Settings />} />

          {/* Legacy PascalCase routes — redirect to kebab-case canonicals.
              The `/*` splat catches subpaths (e.g., /AITutors/statistics). */}
          <Route path="/AITutors/*"       element={<LegacyRedirect to="/ai-tutors" />} />
          <Route path="/SmartScheduler/*" element={<LegacyRedirect to="/smart-scheduler" />} />
          <Route path="/PracticeTests/*"  element={<LegacyRedirect to="/practice-tests" />} />
          <Route path="/Flashcards/*"     element={<LegacyRedirect to="/flashcards" />} />
          <Route path="/Solver/*"         element={<LegacyRedirect to="/solver" />} />
          <Route path="/Settings/*"       element={<LegacyRedirect to="/settings" />} />
        </Route>
        {/* 404 renders full-screen, outside the Layout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
