/* eslint-disable import/first */
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <Router>
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
    <Layout>
      <Suspense fallback={<div className="p-6 text-slate-300">Loading…</div>}>
        <Routes>
          <Route path={createPageUrl("AITutors")} element={<AITutors />} />
          <Route path={createPageUrl("AITutors", ":subject")} element={<AITutors />} />
          <Route path={createPageUrl("SmartScheduler")} element={<SmartScheduler />} />
          <Route path={createPageUrl("PracticeTests")} element={<PracticeTests />} />
          <Route path={createPageUrl("Flashcards")} element={<Flashcards />} />
          <Route path={createPageUrl("Solver")} element={<Solver />} />
          <Route path={createPageUrl("Settings")} element={<Settings />} />
          <Route path="*" element={<Navigate to={createPageUrl("AITutors")} replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
