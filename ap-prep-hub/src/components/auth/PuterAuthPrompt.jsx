import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Shield, Clock, ArrowRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import errorLogger from '../../utils/errorLogger';

/**
 * PuterAuthPrompt: connects the student's own Puter account so they can pick
 * Puter models. Optional: AI works without it through Apex Scholar's proxy.
 * Opens only when asked (the `apex:requestPuterAuth` event from ModelSelector).
 *
 * Connected means a live token (`puter.auth.token`, set by the SDK). A
 * never-cleared "authenticated" flag used to count too, so once a token
 * expired, "Connect Puter account" did nothing.
 */
function isPuterAuthenticated() {
  try {
    if (typeof window !== 'undefined' && window.puter && window.puter.authToken) return true;
    const token = localStorage.getItem('puter.auth.token');
    return !!(token && token.length > 10);
  } catch (e) {
    errorLogger.debug('isPuterAuthenticated check failed', { error: e?.message });
    return false;
  }
}

export default function PuterAuthPrompt() {
  const [visible, setVisible] = useState(false);
  const [authState, setAuthState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  // The SDK isn't on the page until someone asks to connect (public/index.html).
  const [sdk, setSdk] = useState('loading'); // loading | ready | blocked
  const visibleRef = useRef(false);
  const dialogRef = useRef(null);

  // Puter is opt-in premium now: the prompt NEVER auto-shows. It only opens
  // when the user explicitly clicks "Connect Puter" (the apex:requestPuterAuth
  // event below, fired from ModelSelector). The default AI path is the Gemini
  // proxy; Puter exists for power users who want unlimited premium models on
  // their own account — and it's the freemium seam later.

  // Listen for manual re-open requests (e.g. from ModelSelector "Connect Puter" button)
  useEffect(() => {
    const handleRequest = () => {
      if (isPuterAuthenticated()) return;
      visibleRef.current = true;
      setAuthState('idle');
      setErrorMsg('');
      setVisible(true);
      // Loaded now, while the student reads, because signIn() must run straight
      // from the button click or Safari blocks its popup.
      setSdk(window.__puterLoaded ? 'ready' : 'loading');
      Promise.resolve(window.__loadPuter ? window.__loadPuter() : false)
        .then((ok) => setSdk(ok ? 'ready' : 'blocked'));
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

  const close = useCallback(() => { visibleRef.current = false; setVisible(false); }, []);

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

      // signIn() opens the Puter popup; it MUST be called from a user-
      // initiated click so Safari doesn't block it.
      //
      // We race signIn() against a watchdog because the SDK can throw
      // synchronously into a setInterval it set up internally (e.g. when
      // window.open returns null and the SDK then reads `popup.closed`)
      // — that throw bypasses our promise chain entirely, leaving the
      // modal stuck on "Connecting…" forever. The watchdog also resolves
      // early if auth quietly succeeds via a different code path.
      let watchdogId = null;
      try {
        const signInPromise = window.puter.auth.signIn();
        const watchdog = new Promise((resolve, reject) => {
          const start = Date.now();
          watchdogId = setInterval(() => {
            if (isPuterAuthenticated()) {
              resolve();
            } else if (Date.now() - start > 90_000) {
              reject(new Error('Puter sign-in timed out — your popup may have been blocked. Try again, or skip for now.'));
            }
          }, 1000);
        });
        await Promise.race([signInPromise, watchdog]);
      } finally {
        if (watchdogId) clearInterval(watchdogId);
        // Re-suppress the SDK's built-in popup
        if (suppressed && ui) {
          ui.authenticateWithPuter = function() {
            return Promise.reject(new Error('Auth suppressed by Apex Scholar'));
          };
        }
      }

      setAuthState('success');
      // Reload model selector defaults after Puter becomes available
      window.dispatchEvent(new CustomEvent('apex:puterAuthComplete'));
      setTimeout(close, 1500);
    } catch (err) {
      // Safely extract a human-readable error string (avoid [object Object])
      let msg = '';
      if (err instanceof Error) {
        msg = err.message || '';
      } else if (typeof err === 'string') {
        msg = err;
      } else {
        try { msg = JSON.stringify(err); } catch (e) { msg = ''; }
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
  }, [close]);

  // A native modal <dialog>: focus stays inside, Escape closes, the page behind is inert.
  useEffect(() => {
    const d = dialogRef.current;
    if (visible && d && !d.open && d.showModal) d.showModal();
  }, [visible]);

  if (!visible) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="puter-connect-title"
      onCancel={(e) => { e.preventDefault(); if (authState !== 'loading') close(); }}
      className="bg-transparent p-4 w-full max-w-lg backdrop:bg-black/60"
    >
      <div className="bg-base-850 rounded-md w-full border border-border shadow-floating overflow-hidden">
        {/* Header */}
        <div className="bg-content-primary/10 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-content-primary/20">
                <Sparkles className="w-6 h-6 text-content-muted" strokeWidth={1.5} />
              </div>
              <div>
                <h2 id="puter-connect-title" className="text-lg font-bold text-content-primary">Connect a Puter account</h2>
                <p className="text-sm text-content-muted mt-0.5">Optional. The AI already works without it.</p>
              </div>
            </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {authState === 'success' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <CheckCircle className="w-12 h-12 text-success-400" strokeWidth={1.5} />
              <p className="text-success-300 font-semibold text-lg">You're all set!</p>
              <p className="text-content-muted text-sm">Pick a Puter model from the AI model menu.</p>
            </div>
          ) : (
            <>
              <p className="text-content-secondary text-sm leading-relaxed">
                <strong className="text-content-primary">Puter</strong> is a separate service with a free account.
                Connecting it lets you choose other AI models for the tutor and other tools.
              </p>

              <div className="space-y-2.5">
                <Benefit icon={Sparkles} text="Choose Claude, GPT or Gemini models" />
                <Benefit icon={Shield}   text="Runs on your Puter account's free allowance" />
                <Benefit icon={Clock}    text="When that runs out, Apex Scholar switches back to its own AI by itself" />
              </div>

              {/* Important note */}
              <div className="bg-warning-900/20 border border-warning-700/40 rounded-sm px-4 py-3 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm text-warning-200/90 leading-relaxed">
                  A Puter window opens to sign in or create the account. Keep it open until it finishes.
                  <br /><span className="text-warning-300/70 text-xs mt-1 block">Puter sign-in is per-device — you may need to connect again on other devices.</span>
                </div>
              </div>

              {sdk === 'blocked' && (
                <div className="bg-error-900/20 border border-error-700/40 rounded-sm px-4 py-3 text-sm text-error-300">
                  Puter couldn&apos;t load on this network (some school filters block it). You can keep using the standard AI.
                </div>
              )}
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
              type="button"
              onClick={close}
              disabled={authState === 'loading'}
              className="flex-1 px-4 py-2.5 bg-base-800 hover:bg-base-750 disabled:opacity-50 text-content-secondary rounded-sm text-sm font-medium transition-colors"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={authState === 'loading' || sdk !== 'ready'}
              className="flex-[2] px-4 py-2.5 bg-content-primary hover:opacity-90 disabled:opacity-70 text-base-950 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-raised"
            >
              {authState === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  Connecting…
                </>
              ) : sdk === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  Loading Puter…
                </>
              ) : authState === 'error' ? (
                <>Try Again</>
              ) : (
                <>
                  Connect Puter
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </dialog>
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
