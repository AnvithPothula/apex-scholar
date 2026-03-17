import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Shield, Clock, ArrowRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * PuterAuthPrompt — shown after Firebase login if the user hasn't
 * authenticated with Puter yet.  It explains what Puter does and lets
 * the user either authenticate or skip.
 *
 * State tracking (all localStorage):
 *   puter.auth.token         — set by the Puter SDK on successful auth
 *   apex.puter.authenticated — set by US after a successful auth (never cleared)
 *   apex.puter.skipped       — set by us when the user clicks "Skip for now"
 *   apex.puter.skippedAt     — timestamp of last skip (re-prompt after 7 days)
 */

const AUTH_KEY  = 'apex.puter.authenticated';
const SKIP_KEY  = 'apex.puter.skipped';
const SKIP_TS   = 'apex.puter.skippedAt';
const RE_PROMPT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Check every reasonable signal that the user has previously authenticated */
function isPuterAuthenticated() {
  try {
    // Our own permanent flag (survives token expiry / SDK changes)
    if (localStorage.getItem(AUTH_KEY) === 'true') return true;
    // SDK in-memory token
    if (typeof window !== 'undefined' && window.puter && window.puter.authToken) return true;
    // localStorage token set by the Puter SDK
    const token = localStorage.getItem('puter.auth.token');
    if (token && token.length > 10) {
      // While we're here, set our permanent flag so future checks are instant
      try { localStorage.setItem(AUTH_KEY, 'true'); } catch {}
      return true;
    }
  } catch {}
  return false;
}

function wasRecentlySkipped() {
  try {
    if (localStorage.getItem(SKIP_KEY) !== 'true') return false;
    const ts = parseInt(localStorage.getItem(SKIP_TS) || '0', 10);
    return (Date.now() - ts) < RE_PROMPT_MS;
  } catch { return false; }
}

export default function PuterAuthPrompt() {
  const [visible, setVisible] = useState(false);
  const [authState, setAuthState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const visibleRef = useRef(false);

  // Decide whether to show the prompt
  useEffect(() => {
    // Check at 4s, then poll every 2s up to 12s for the SDK to arrive.
    // This handles both fast connections (~200ms) and very slow ones.
    // On a blocked network, __puterBlocked is set within 0-10s by
    // the loader in index.html (onerror, onload check, fetch probe, timeout).
    let attempts = 0;
    const maxAttempts = 5; // 4s + (5 * 2s) = 14s max wait

    function tryShow() {
      if (isPuterAuthenticated()) return true;   // already good, stop
      if (wasRecentlySkipped()) return true;     // user said "skip", stop

      // Check if the SDK is actually available (live check, no flag dependency)
      const sdkAvailable = typeof window !== 'undefined'
        && window.puter
        && window.puter.ai
        && typeof window.puter.ai.chat === 'function';

      if (sdkAvailable) {
        // SDK is loaded — show the auth prompt
        visibleRef.current = true;
        setVisible(true);
        return true; // stop polling
      }

      // SDK not yet available — keep waiting
      attempts++;

      // After max attempts, show the prompt anyway so the user can try
      if (attempts >= maxAttempts) {
        visibleRef.current = true;
        setVisible(true);
        return true;
      }
      return false;
    }

    // First check at 4s
    const timer = setTimeout(() => {
      if (tryShow()) return;
      // If inconclusive, poll every 2s for the SDK to arrive
      const interval = setInterval(() => {
        if (tryShow()) clearInterval(interval);
      }, 2000);
      // Safety: clear interval after maxAttempts * 2s even if tryShow didn't stop it
      setTimeout(() => clearInterval(interval), maxAttempts * 2000 + 100);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for manual re-open requests (e.g. from ModelSelector "Connect Puter" button)
  useEffect(() => {
    const handleRequest = () => {
      if (isPuterAuthenticated()) return;
      visibleRef.current = true;
      setAuthState('idle');
      setErrorMsg('');
      setVisible(true);
    };
    window.addEventListener('apex:requestPuterAuth', handleRequest);
    return () => window.removeEventListener('apex:requestPuterAuth', handleRequest);
  }, []);

  // Poll for auth becoming valid while the prompt is visible (handles
  // edge case where the SDK completes auth in the background, e.g. via
  // a different tab or the SDK's own popup).
  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      if (isPuterAuthenticated() && visibleRef.current) {
        visibleRef.current = false;
        setAuthState('success');
        setTimeout(() => setVisible(false), 1200);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [visible]);

  // Handle "Continue with Puter"
  const handleContinue = useCallback(async () => {
    setAuthState('loading');
    setErrorMsg('');
    try {
      if (!window.puter || !window.puter.auth) {
        throw new Error('Puter SDK not loaded — please refresh the page and try again.');
      }

      // Temporarily restore the SDK's original authenticateWithPuter while
      // we call signIn(), in case the SDK needs it during the auth flow.
      // Re-suppress it immediately after, regardless of success or failure.
      const ui = window.puter.ui;
      const suppressed = ui && typeof ui._originalAuthenticateWithPuter === 'function';
      if (suppressed) {
        ui.authenticateWithPuter = ui._originalAuthenticateWithPuter;
      }

      try {
        // signIn() opens the Puter popup; it MUST be called from a user-
        // initiated click so Safari doesn't block it.
        await window.puter.auth.signIn();
      } finally {
        // Re-suppress the SDK's built-in popup
        if (suppressed && ui) {
          ui.authenticateWithPuter = function() {
            return Promise.reject(new Error('Auth suppressed by Apex Scholar'));
          };
        }
      }

      // If we get here the user completed auth.
      // Set our permanent flag so the prompt never shows again
      try { localStorage.setItem(AUTH_KEY, 'true'); } catch {}
      setAuthState('success');
      // Reload model selector defaults after Puter becomes available
      window.dispatchEvent(new CustomEvent('apex:puterAuthComplete'));
      setTimeout(() => setVisible(false), 1500);
    } catch (err) {
      // Safely extract a human-readable error string (avoid [object Object])
      let msg = '';
      if (err instanceof Error) {
        msg = err.message || '';
      } else if (typeof err === 'string') {
        msg = err;
      } else {
        try { msg = JSON.stringify(err); } catch { msg = ''; }
      }
      // "User cancelled" is not a real error — they just closed the popup
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('closed')) {
        setAuthState('idle');
        return;
      }
      console.error('[PuterAuth] Error:', err);
      setErrorMsg(msg || 'Something went wrong. You can try again or skip for now.');
      setAuthState('error');
    }
  }, []);

  // Handle "Skip for now"
  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem(SKIP_KEY, 'true');
      localStorage.setItem(SKIP_TS, String(Date.now()));
    } catch { /* storage full / blocked — fine */ }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-base-850 rounded-md max-w-lg w-full border border-border shadow-floating overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-content-primary/10 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-content-primary/20">
                <Sparkles className="w-6 h-6 text-content-muted" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-content-primary">Enable AI Features</h2>
                <p className="text-sm text-content-muted mt-0.5">One-time setup — takes about 30 seconds</p>
              </div>
            </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {authState === 'success' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <CheckCircle className="w-12 h-12 text-success-400" strokeWidth={1.5} />
              <p className="text-success-300 font-semibold text-lg">You're all set!</p>
              <p className="text-content-muted text-sm">AI features are now fully enabled.</p>
            </div>
          ) : (
            <>
              <p className="text-content-secondary text-sm leading-relaxed">
                Apex Scholar uses <strong className="text-content-muted">Puter</strong> to provide free,
                unlimited access to advanced AI models. We <strong className="text-content-primary">strongly recommend</strong> connecting
                your account — it only takes a moment and dramatically improves your experience.
              </p>

              <div className="space-y-2.5">
                <Benefit icon={Sparkles} text="Access to 500+ AI models including GPT, Claude, and Gemini" />
                <Benefit icon={Shield}   text="Faster, more reliable AI responses" />
                <Benefit icon={Clock}    text="No daily limits on AI tutoring, flashcards, and more" />
              </div>

              {/* Important note */}
              <div className="bg-warning-900/20 border border-warning-700/40 rounded-sm px-4 py-3 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm text-warning-200/90 leading-relaxed">
                  <strong>Please note:</strong> A new tab will open to complete the setup.
                  It may take a moment to load — <strong>do not close the tab</strong> while it's working.
                  If you're asked to create a Puter account, it's free and quick.
                  <br /><span className="text-warning-300/70 text-xs mt-1 block">Puter sign-in is per-device — you may need to connect again on other devices.</span>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-error-900/20 border border-error-700/40 rounded-sm px-4 py-3 text-sm text-error-300">
                  {errorMsg}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {authState !== 'success' && (
          <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSkip}
              disabled={authState === 'loading'}
              className="flex-1 px-4 py-2.5 bg-base-800 hover:bg-base-750 disabled:opacity-50 text-content-secondary rounded-sm text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={authState === 'loading'}
              className="flex-[2] px-4 py-2.5 bg-content-primary hover:opacity-90 disabled:opacity-70 text-base-950 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-raised"
            >
              {authState === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  Connecting — don't close this tab…
                </>
              ) : authState === 'error' ? (
                <>Try Again</>
              ) : (
                <>
                  Continue with Puter
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-lg bg-base-800/60">
        <Icon className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
      </div>
      <span className="text-content-secondary text-sm">{text}</span>
    </div>
  );
}
