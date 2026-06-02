import React, { useEffect, useState, useCallback } from 'react';
import { Info } from 'lucide-react';

const NOTICE_KEY = 'apex.ai.downgradeNoticeShown';

/**
 * Centered modal shown once when premium AI runs out of free usage for this
 * browser (geminiService fires the `apex:ai-downgraded` event). Styled like the
 * "Connect Puter" prompt (PuterAuthPrompt) and shown in the middle of the
 * screen, replacing the old corner toast. In our own words — no mention of
 * Puter or buying credits.
 */
export default function AiDowngradeNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onDowngrade = () => {
      try {
        if (localStorage.getItem(NOTICE_KEY)) return; // already shown once
        localStorage.setItem(NOTICE_KEY, String(Date.now()));
      } catch (e) { /* localStorage blocked — show anyway */ }
      setVisible(true);
    };
    window.addEventListener('apex:ai-downgraded', onDowngrade);
    return () => window.removeEventListener('apex:ai-downgraded', onDowngrade);
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  if (!visible) return null;

  // Intentionally NOT dismissible by backdrop click or Escape — the user must
  // acknowledge via the "Got it" button so they see the message.
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI model update"
        className="bg-base-850 rounded-md max-w-lg w-full border border-border shadow-floating overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-content-primary/10 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-content-primary/20">
              <Info className="w-6 h-6 text-content-muted" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">You're on our standard AI model</h2>
              <p className="text-sm text-content-muted mt-0.5">Nothing you need to do</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-content-secondary text-sm leading-relaxed">
            Premium AI is no longer available for this account, so all AI features now use
            Apex Scholar's <strong className="text-content-primary">standard AI model</strong> from here on.
            Everything keeps working as normal — your tutors, practice, flashcards, and solver are unaffected.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={dismiss}
            className="w-full px-4 py-2.5 bg-content-primary hover:opacity-90 text-base-950 rounded-sm text-sm font-semibold transition-all shadow-raised"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
