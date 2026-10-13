import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, X, Send } from 'lucide-react';
import { overlayVariants, modalVariants } from '../utils/animations';
import errorLogger from '../utils/errorLogger';
import { CONTACT_EMAIL } from '../constants/contact';
import { FREQUENCY, SEVERITY, collectDiagnostics, formatBugReport } from '../utils/bugReport';

const field = 'w-full bg-base-800 border border-border-strong rounded-sm px-3 py-2 text-content-primary focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-all placeholder:text-content-disabled';
const labelCls = 'block text-sm font-medium text-content-secondary mb-1.5';

/**
 * "Report bug" from the account menu: the questions a bug needs answered
 * (where, steps, expected vs actual, how often, how bad) plus browser details
 * and recent errors, which the student can see and leave out.
 */
export default function BugReportModal({ user, page, onClose }) {
  const [f, setF] = useState({ title: '', page, steps: '', expected: '', actual: '', frequency: '', severity: '' });
  const [includeDetails, setIncludeDetails] = useState(true);
  const [status, setStatus] = useState(null); // null | sending | sent | failed | missing
  const diag = useMemo(() => collectDiagnostics({ errors: errorLogger.recentErrors() }), []);
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const body = formatBugReport(f, includeDetails ? diag : null);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Bug: ${f.title}`)}&body=${encodeURIComponent(body.slice(0, 1800))}`;

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim() || !f.actual.trim()) { setStatus('missing'); return; }
    setStatus('sending');
    try {
      const { default: emailService } = await import('../services/emailService');
      const result = await emailService.sendFeedback({ feedbackType: 'bug', title: `[Bug] ${f.title.trim()}`, message: body }, user);
      // demo means EmailJS isn't configured or failed: nothing reached us.
      setStatus(result?.demo ? 'failed' : 'sent');
      if (!result?.demo) setTimeout(onClose, 2500);
    } catch (err) {
      errorLogger.warn('bug report send failed', { error: err?.message });
      setStatus('failed');
    }
  };

  return (
    <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" role="dialog" aria-modal="true" aria-labelledby="bug-title"
        className="bg-base-850 rounded-md p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border shadow-floating">
        <div className="flex items-center justify-between mb-4">
          <h2 id="bug-title" className="flex items-center gap-2 text-base font-display font-semibold text-content-primary">
            <Bug strokeWidth={1.5} className="w-5 h-5 text-error-400" /> Report a bug
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-content-muted hover:text-content-primary transition-colors">
            <X strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="bug-summary" className={labelCls}>What went wrong? *</label>
            <input id="bug-summary" value={f.title} onChange={set('title')} className={field} placeholder="e.g. Practice test froze on question 12" maxLength={140} required />
          </div>
          <div>
            <label htmlFor="bug-page" className={labelCls}>Where did it happen?</label>
            <input id="bug-page" value={f.page} onChange={set('page')} className={field} />
          </div>
          <div>
            <label htmlFor="bug-steps" className={labelCls}>Steps to make it happen</label>
            <textarea id="bug-steps" value={f.steps} onChange={set('steps')} rows={4} className={`${field} resize-y`}
              placeholder={'e.g.\n1. Opened Practice Tests\n2. Chose AP Biology, 20 questions\n3. Clicked Next on question 12'} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bug-expected" className={labelCls}>What should have happened?</label>
              <textarea id="bug-expected" value={f.expected} onChange={set('expected')} rows={2} className={`${field} resize-y`} />
            </div>
            <div>
              <label htmlFor="bug-actual" className={labelCls}>What happened instead? *</label>
              <textarea id="bug-actual" value={f.actual} onChange={set('actual')} rows={2} className={`${field} resize-y`} required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bug-frequency" className={labelCls}>How often?</label>
              <select id="bug-frequency" value={f.frequency} onChange={set('frequency')} className={field}>
                <option value="">Choose…</option>
                {FREQUENCY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bug-severity" className={labelCls}>How bad is it?</label>
              <select id="bug-severity" value={f.severity} onChange={set('severity')} className={field}>
                <option value="">Choose…</option>
                {SEVERITY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-sm border border-border p-3">
            <label className="flex items-start gap-2 text-sm text-content-secondary">
              <input type="checkbox" checked={includeDetails} onChange={(e) => setIncludeDetails(e.target.checked)} className="mt-0.5 accent-primary-500" />
              Include technical details (browser, screen size, app version, recent errors). No answers, chats or passwords.
            </label>
            {includeDetails && (
              <details className="mt-2 text-xs text-content-muted">
                <summary className="cursor-pointer">See exactly what's sent</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono">{formatBugReport({}, diag).split('--- Technical details ---')[1].trim()}</pre>
              </details>
            )}
          </div>
          {user?.email && <p className="text-xs text-content-muted">We'll reply to {user.email} if we need more.</p>}

          {status === 'missing' && (
            <p role="alert" className="p-3 rounded-lg text-sm bg-error-900/30 border border-error-600 text-error-300">Fill in what went wrong and what happened instead.</p>
          )}
          {status === 'sent' && (
            <p role="status" className="p-3 rounded-lg text-sm bg-success-900/30 border border-success-600 text-success-300">Thanks, your report was sent. We read every one.</p>
          )}
          {status === 'failed' && (
            <p role="alert" className="p-3 rounded-lg text-sm bg-warning-900/30 border border-warning-500 text-content-secondary">
              It couldn't be sent from here. <a href={mailto} className="underline text-primary-400">Email it to {CONTACT_EMAIL}</a> instead (the report is filled in for you).
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-base-800 hover:bg-base-750 text-content-secondary rounded-sm transition-colors">Cancel</button>
            <button type="submit" disabled={status === 'sending' || status === 'sent'}
              className="flex-1 px-4 py-2 bg-content-primary text-base-950 rounded-sm transition-colors hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Send strokeWidth={1.5} className="w-4 h-4" />{status === 'sending' ? 'Sending…' : 'Send report'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
