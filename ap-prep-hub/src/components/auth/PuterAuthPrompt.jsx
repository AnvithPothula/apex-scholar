import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, Shield, Clock, ArrowRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

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
    // Small delay so the page renders first and Puter SDK initialises
    const timer = setTimeout(() => {
      if (isPuterAuthenticated()) return;   // already good
      if (wasRecentlySkipped()) return;     // user said "skip" recently
      visibleRef.current = true;
      setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
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
      setTimeout(() => setVisible(false), 1200);
    } catch (err) {
      const msg = String(err?.message || err || '');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Enable AI Features</h2>
                <p className="text-sm text-slate-400 mt-0.5">One-time setup — takes about 30 seconds</p>
              </div>
            </div>
            {authState === 'idle' && (
              <button onClick={handleSkip} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {authState === 'success' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <p className="text-green-300 font-semibold text-lg">You're all set!</p>
              <p className="text-slate-400 text-sm">AI features are now fully enabled.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-300 text-sm leading-relaxed">
                Apex Scholar uses <strong className="text-blue-400">Puter</strong> to provide free, 
                unlimited access to advanced AI models. We <strong className="text-white">strongly recommend</strong> connecting 
                your account — it only takes a moment and dramatically improves your experience.
              </p>

              <div className="space-y-2.5">
                <Benefit icon={Sparkles} text="Access to 500+ AI models including GPT, Claude, and Gemini" />
                <Benefit icon={Shield}   text="Faster, more reliable AI responses" />
                <Benefit icon={Clock}    text="No daily limits on AI tutoring, flashcards, and more" />
              </div>

              {/* Important note */}
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-3 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200/90 leading-relaxed">
                  <strong>Please note:</strong> A new tab will open to complete the setup. 
                  It may take a moment to load — <strong>do not close the tab</strong> while it's working. 
                  If you're asked to create a Puter account, it's free and quick.
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 text-sm text-red-300">
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
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 rounded-xl text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={authState === 'loading'}
              className="flex-[2] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-70 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {authState === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting — don't close this tab…
                </>
              ) : authState === 'error' ? (
                <>Try Again</>
              ) : (
                <>
                  Continue with Puter
                  <ArrowRight className="w-4 h-4" />
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
      <div className="p-1.5 rounded-lg bg-slate-700/60">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <span className="text-slate-300 text-sm">{text}</span>
    </div>
  );
}
