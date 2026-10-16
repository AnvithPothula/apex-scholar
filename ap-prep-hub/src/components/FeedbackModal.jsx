import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Send, Bug } from 'lucide-react';
import errorLogger from '../utils/errorLogger';
import { CONTACT_EMAIL } from '../constants/contact';
import { collectDiagnostics } from '../utils/bugReport';
import { shortSubjectName } from '../constants/subjects';
import {
  FEEDBACK_TYPES, TYPE_DETAILS, MESSAGE_PLACEHOLDER, AREAS, ROLES, GRADES, RATING_LABELS,
  areaForPath, formatFeedback,
} from '../utils/feedback';

const field = 'w-full bg-base-800 border border-border-strong rounded-sm px-3 py-2 text-content-primary focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-all placeholder:text-content-disabled';
const labelCls = 'block text-sm font-medium text-content-secondary mb-1.5';
const chip = (on) => `px-3 py-1.5 rounded-full text-sm border transition-colors ${on
  ? 'bg-content-primary text-base-950 border-content-primary'
  : 'border-border-strong text-content-secondary hover:text-content-primary hover:border-content-muted'}`;

/**
 * "Feedback" from the account menu (and the guest header). Only the kind of
 * feedback and a message are required; everything else is optional context.
 * Each response is saved (netlify/functions/feedback) and emailed (EmailJS);
 * it counts as sent if either works, and offers a pre-filled email if both fail.
 */
export default function FeedbackModal({ user, page, onClose, onReportBug }) {
  const [f, setF] = useState(() => ({
    type: '', area: areaForPath(page), rating: null, summary: '', message: '', details: '',
    role: '', grade: '',
    subjects: (user?.subjects || []).map(shortSubjectName).join(', '),
    contactOk: false, email: '',
  }));
  const [includeDevice, setIncludeDevice] = useState(true);
  const [status, setStatus] = useState(null); // null | missing | sending | sent | failed
  const device = useMemo(() => {
    const d = collectDiagnostics();
    return { page: d.page, appVersion: d.appVersion, browser: d.browser, viewport: d.viewport, theme: d.theme };
  }, []);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // A native modal <dialog>: focus stays inside, Escape closes, the page behind is inert.
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; if (d && !d.open && d.showModal) d.showModal(); }, []);

  const email = user?.email || f.email.trim();
  const payload = { ...f, email: f.contactOk ? email : '', page: device.page, device: includeDevice ? device : null };
  const body = formatFeedback(payload, includeDevice ? device : null);
  const subject = `Feedback: ${f.summary.trim() || FEEDBACK_TYPES.find((t) => t.value === f.type)?.label || 'Apex Scholar'}`;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`;

  const submit = async (e) => {
    e.preventDefault();
    if (!f.type || !f.message.trim()) { setStatus('missing'); return; }
    setStatus('sending');
    const save = (async () => {
      const headers = { 'Content-Type': 'application/json' };
      try {
        const { auth } = await import('../config/firebase');
        const token = await auth?.currentUser?.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch (err) { /* guest */ }
      const res = await fetch('/.netlify/functions/feedback', { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`feedback ${res.status}`);
    })();
    const mail = (async () => {
      const { default: emailService } = await import('../services/emailService');
      const result = await emailService.sendFeedback({ feedbackType: f.type, title: subject, message: body }, user);
      // demo means EmailJS isn't configured or failed: nothing reached us.
      if (result?.demo) throw new Error('email not sent');
    })();
    const results = await Promise.allSettled([save, mail]);
    results.filter((r) => r.status === 'rejected').forEach((r) => errorLogger.warn('feedback channel failed', { error: r.reason?.message }));
    if (results.some((r) => r.status === 'fulfilled')) {
      setStatus('sent');
      setTimeout(onClose, 2500);
    } else {
      setStatus('failed');
    }
  };

  const detail = TYPE_DETAILS[f.type];

  return (
    <dialog
      ref={ref}
      aria-labelledby="feedback-title"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      className="bg-transparent p-4 w-full max-w-lg max-h-full backdrop:bg-black/60"
    >
      <div className="bg-base-850 rounded-md p-6 w-full max-h-[90vh] overflow-y-auto border border-border shadow-floating">
        <div className="flex items-center justify-between mb-4">
          <h2 id="feedback-title" className="flex items-center gap-2 text-base font-display font-semibold text-content-primary">
            <MessageSquare strokeWidth={1.5} className="w-5 h-5" /> Send feedback
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-content-muted hover:text-content-primary transition-colors">
            <X strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <fieldset>
            <legend className={labelCls}>What kind of feedback? *</legend>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TYPES.map((t) => (
                <button key={t.value} type="button" aria-pressed={f.type === t.value} onClick={() => setF((p) => ({ ...p, type: t.value }))} className={chip(f.type === t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-content-muted">
              Something broken?{' '}
              <button type="button" onClick={onReportBug} className="inline-flex items-center gap-1 underline text-primary-400">
                <Bug strokeWidth={1.5} className="w-3.5 h-3.5" />Report a bug
              </button>{' '}instead. It asks what we need to fix it.
            </p>
          </fieldset>

          <div>
            <label htmlFor="fb-area" className={labelCls}>Which part of Apex Scholar?</label>
            <select id="fb-area" value={f.area} onChange={set('area')} className={field}>
              {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          <fieldset>
            <legend className={labelCls}>How is Apex Scholar working for you? <span className="font-normal text-content-muted">(optional)</span></legend>
            <div className="flex gap-1.5" role="group">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-pressed={f.rating === n} aria-label={`${n} of 5: ${RATING_LABELS[n]}`}
                  onClick={() => setF((p) => ({ ...p, rating: p.rating === n ? null : n }))}
                  className={`w-10 h-10 rounded-sm text-sm font-medium border transition-colors ${f.rating === n ? 'bg-content-primary text-base-950 border-content-primary' : 'border-border-strong text-content-secondary hover:border-content-muted'}`}>
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-content-muted" aria-live="polite">{f.rating ? RATING_LABELS[f.rating] : '1 = not working for me, 5 = great'}</p>
          </fieldset>

          <div>
            <label htmlFor="fb-summary" className={labelCls}>Summary <span className="font-normal text-content-muted">(optional)</span></label>
            <input id="fb-summary" value={f.summary} onChange={set('summary')} maxLength={140} className={field} placeholder="One line" />
          </div>

          <div>
            <label htmlFor="fb-message" className={labelCls}>Your feedback *</label>
            <textarea id="fb-message" value={f.message} onChange={set('message')} rows={4} maxLength={4000} required
              className={`${field} resize-y`} placeholder={MESSAGE_PLACEHOLDER[f.type] || 'Tell us what you think.'} />
          </div>

          {detail && (
            <div>
              <label htmlFor="fb-details" className={labelCls}>{detail.label} <span className="font-normal text-content-muted">(optional)</span></label>
              <textarea id="fb-details" value={f.details} onChange={set('details')} rows={2} maxLength={2000} className={`${field} resize-y`} placeholder={detail.placeholder} />
            </div>
          )}

          <details className="rounded-sm border border-border p-3">
            <summary className="cursor-pointer text-sm text-content-secondary">About you <span className="text-content-muted">(optional, helps us weigh feedback)</span></summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fb-role" className={labelCls}>I&apos;m a</label>
                  <select id="fb-role" value={f.role} onChange={set('role')} className={field}>
                    <option value="">Choose…</option>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="fb-grade" className={labelCls}>Grade</label>
                  <select id="fb-grade" value={f.grade} onChange={set('grade')} className={field}>
                    <option value="">Choose…</option>
                    {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="fb-subjects" className={labelCls}>AP classes</label>
                <input id="fb-subjects" value={f.subjects} onChange={set('subjects')} maxLength={300} className={field} placeholder="e.g. AP Biology, AP U.S. History" />
              </div>
            </div>
          </details>

          <div className="space-y-2">
            {!user?.email && (
              <div>
                <label htmlFor="fb-email" className={labelCls}>Your email <span className="font-normal text-content-muted">(optional, only if you want a reply)</span></label>
                <input id="fb-email" type="email" value={f.email} onChange={set('email')} maxLength={254} className={field} placeholder="you@example.com" />
              </div>
            )}
            <label className="flex items-start gap-2 text-sm text-content-secondary">
              <input type="checkbox" checked={f.contactOk} onChange={set('contactOk')} disabled={!email} className="mt-0.5 accent-primary-500" />
              {email ? <>You can email me about this at {email}</> : <>Add an email above if you&apos;d like a reply</>}
            </label>
            <label className="flex items-start gap-2 text-sm text-content-secondary">
              <input type="checkbox" checked={includeDevice} onChange={(e) => setIncludeDevice(e.target.checked)} className="mt-0.5 accent-primary-500" />
              Include this page and basic device info (browser, screen size, app version)
            </label>
            {includeDevice && (
              <details className="text-xs text-content-muted">
                <summary className="cursor-pointer">See exactly what&apos;s sent</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono">{body.split('--- Page and device ---')[1]?.trim()}</pre>
              </details>
            )}
          </div>

          {status === 'missing' && (
            <p role="alert" className="p-3 rounded-lg text-sm bg-error-900/30 border border-error-600 text-error-300">Choose what kind of feedback this is and write a message.</p>
          )}
          {status === 'sent' && (
            <p role="status" className="p-3 rounded-lg text-sm bg-success-900/30 border border-success-600 text-success-300">Thanks, your feedback was sent. We read all of it.</p>
          )}
          {status === 'failed' && (
            <p role="alert" className="p-3 rounded-lg text-sm bg-warning-900/30 border border-warning-500 text-content-secondary">
              It couldn&apos;t be sent from here. <a href={mailto} className="underline text-primary-400">Email it to {CONTACT_EMAIL}</a> instead (it&apos;s filled in for you).
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-base-800 hover:bg-base-750 text-content-secondary rounded-sm transition-colors">Cancel</button>
            <button type="submit" disabled={status === 'sending' || status === 'sent'}
              className="flex-1 px-4 py-2 bg-content-primary text-base-950 rounded-sm transition-colors hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Send strokeWidth={1.5} className="w-4 h-4" />{status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
