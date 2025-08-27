import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout.jsx';
import { LoginPage } from './components/auth/LoginPage';
import { SchoologyCallback } from './components/auth/SchoologyCallback';
import AITutors from './pages/AITutors';
import SmartScheduler from './pages/SmartScheduler';
import PracticeTests from './pages/PracticeTests';
import Settings from './pages/Settings';
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
      <Routes>
        <Route path={createPageUrl("AITutors")} element={<AITutors />} />
        <Route path={createPageUrl("AITutors", ":subject")} element={<AITutors />} />
        <Route path={createPageUrl("SmartScheduler")} element={<SmartScheduler />} />
        <Route path={createPageUrl("PracticeTests")} element={<PracticeTests />} />
        <Route path={createPageUrl("Settings")} element={<Settings />} />
        <Route path="*" element={<Navigate to={createPageUrl("AITutors")} replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
