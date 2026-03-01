/* eslint-disable import/first */
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout.jsx';
import { LoginPage } from './components/auth/LoginPage';
import { SchoologyCallback } from './components/auth/SchoologyCallback';
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
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/schoology-callback" element={<SchoologyCallback />} />
          <Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Main App with Layout
function MainApp() {
  return (
    <Suspense fallback={<div className="p-6 text-content-secondary">Loading…</div>}>
      <Routes>
        <Route element={<Layout><Suspense fallback={<div className="p-6 text-content-secondary">Loading…</div>}><Outlet /></Suspense></Layout>}>
          <Route index element={<Navigate to={createPageUrl("AITutors")} replace />} />
          <Route path={createPageUrl("AITutors")} element={<AITutors />} />
          <Route path={createPageUrl("AITutors", ":subject")} element={<AITutors />} />
          <Route path={createPageUrl("SmartScheduler")} element={<SmartScheduler />} />
          <Route path={createPageUrl("PracticeTests")} element={<PracticeTests />} />
          <Route path={createPageUrl("Flashcards")} element={<Flashcards />} />
          <Route path={createPageUrl("Solver")} element={<Solver />} />
          <Route path={createPageUrl("Settings")} element={<Settings />} />
        </Route>
        {/* 404 renders full-screen, outside the Layout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
