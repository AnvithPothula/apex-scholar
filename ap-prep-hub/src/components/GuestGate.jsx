import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/UIComponents';
import GoogleIcon from './ui/GoogleIcon';
import { createPageUrl } from '../utils/helpers';

/**
 * GuestGate — wraps a route's element.
 *
 *   Signed-in user  → renders {children} normally.
 *   Guest (no user) → renders a blurred decorative preview of the feature
 *                      behind a centered "sign in to unlock" upsell card.
 *
 * The real feature component is intentionally NOT mounted for guests: pages
 * like SmartScheduler/PracticeTests assume an authenticated user and read
 * Firestore with user.uid on mount, so rendering them live just to blur them
 * would throw. Instead we show a styled, static teaser — it conveys "this
 * exists, sign in to use it" without the crash risk.
 */
export default function GuestGate({ feature, children }) {
  const { user, isGuest, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return children;
  // Auth still resolving (ProtectedRoute shows the spinner) — render nothing
  // rather than flash the upsell at a user who's actually logged in.
  if (!isGuest) return null;

  const Icon = feature?.icon || Lock;

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      // On success Firebase auth state flips, this component re-renders with
      // a user and returns {children}. On redirect-based sign-in the page
      // navigates away on its own.
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Please try again.');
      setBusy(false);
    }
  };

  const goToLogin = () => {
    // Remember where they were headed so login returns them here after auth.
    navigate('/login', { state: { from: location } });
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Decorative, blurred app-surface mock */}
      <div
        aria-hidden="true"
        className="absolute inset-0 select-none pointer-events-none blur-[6px] opacity-40 p-4 sm:p-6 md:p-8"
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="h-9 w-56 rounded-md bg-base-800 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-base-850 border border-border" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-base-850 border border-border"
                style={{ width: `${92 - i * 6}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Upsell card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-base-850 border border-border rounded-md shadow-floating p-6 sm:p-8 text-center"
        >
          <div className="mx-auto w-12 h-12 rounded-md bg-content-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-content-muted" strokeWidth={1.5} />
          </div>

          <h2 className="text-lg sm:text-xl font-display font-semibold text-content-primary mb-1.5">
            {feature?.title ? `${feature.title} is for members` : 'Sign in to continue'}
          </h2>
          <p className="text-sm text-content-secondary leading-relaxed mb-6">
            {feature?.blurb ||
              'Create a free account to unlock this feature, save your progress, and sync across devices.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-error-900 border border-error-500/30 rounded-md">
              <p className="text-sm text-error-400">{error}</p>
            </div>
          )}

          <div className="space-y-2.5">
            <Button
              className="w-full h-10"
              onClick={handleGoogle}
              disabled={busy}
            >
              {busy ? (
                <div className="w-4 h-4 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10"
              onClick={goToLogin}
              disabled={busy}
            >
              Sign in another way
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate(createPageUrl('AITutors'))}
            className="mt-5 inline-flex items-center gap-1 text-xs text-content-muted hover:text-content-primary transition-colors"
          >
            Keep exploring AI Tutors as a guest
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
