/**
 * Admin compose screen for email-broadcast.
 *
 * The function was curl-only, which meant the only way to mail users was to
 * hand-assemble a POST with a bearer token — easy to get wrong in the direction
 * that matters (sending for real when you meant to test).
 *
 * The flow here is deliberately staged and irreversible-last:
 *   1. Send test to one address   (nobody else is touched)
 *   2. Dry run                    (reports the audience size, sends nothing)
 *   3. Send for real              (typed confirmation, then no undo)
 *
 * Step 3 requires typing SEND because there is no unsend, the audience is
 * mostly minors, and a mistaken blast is the fastest way to burn the domain's
 * sending reputation permanently.
 */

import React, { useRef, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Loader2, AlertTriangle, CheckCircle, Bold, Italic, Link2, List, Heading, Eye, Image } from 'lucide-react';
import { Button, Input } from '../ui/UIComponents';
import { applyWrap, applyLinePrefix, applyLink, applyImage } from './emailFormatting';

const ENDPOINT = '/.netlify/functions/email-broadcast';

/**
 * Safety predicates, exported so they can be unit-tested without a rendering
 * library. The real-send gate is the one that matters — there is no unsend.
 */
export const isComposed = ({ subject, body }) =>
  Boolean(String(subject || '').trim() && String(body || '').trim());

/** Typed confirmation. Case-insensitive and trimmed, but nothing else passes. */
export const isArmed = (confirmText) =>
  String(confirmText || '').trim().toUpperCase() === 'SEND';

export const canSendForReal = ({ subject, body, confirmText, busy }) =>
  isComposed({ subject, body }) && isArmed(confirmText) && !busy;

export default function EmailBroadcast() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [testTo, setTestTo] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const bodyRef = useRef(null);

  /**
   * Applies a toolbar edit and restores the caret.
   *
   * Without the setSelectionRange the caret jumps to the end after every
   * button press, which makes the toolbar useless for anything but appending.
   */
  const edit = (fn) => {
    const el = bodyRef.current;
    if (!el) return;
    const next = fn(body, el.selectionStart, el.selectionEnd);
    setBody(next.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  const TOOLBAR = [
    { key: 'bold', label: 'Bold', Icon: Bold, run: () => edit((v, a, b) => applyWrap(v, a, b, '**', 'bold text')) },
    { key: 'italic', label: 'Italic', Icon: Italic, run: () => edit((v, a, b) => applyWrap(v, a, b, '*', 'italic text')) },
    { key: 'link', label: 'Link', Icon: Link2, run: () => edit(applyLink) },
    { key: 'image', label: 'Image', Icon: Image, run: () => edit(applyImage) },
    { key: 'heading', label: 'Heading', Icon: Heading, run: () => edit((v, a, b) => applyLinePrefix(v, a, b, '## ')) },
    { key: 'list', label: 'Bullet list', Icon: List, run: () => edit((v, a, b) => applyLinePrefix(v, a, b, '- ')) },
  ];
  const [error, setError] = useState('');

  const call = async (payload, mode) => {
    setBusy(mode);
    setError('');
    setResult(null);
    try {
      const current = getAuth().currentUser;
      if (!current) throw new Error('Not signed in.');
      const token = await current.getIdToken();
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, ...payload }),
      });
      // A 404 means the function isn't deployed — by far the most common
      // failure, and the least obvious from a raw fetch error.
      if (res.status === 404) {
        throw new Error(
          'email-broadcast returned 404 — the function is not deployed yet. Deploy the site (or run `netlify dev` locally) and try again.'
        );
      }
      // Netlify Functions don't run under `npm start`; CRA answers unknown paths
      // with index.html and a 200, so trusting res.ok yields a cryptic JSON
      // parse error instead of a usable message.
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Function not reachable — run `netlify dev`, or use the deployed site.');
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
      // The preview is the real rendered email, so it goes in an iframe rather
      // than into `result` (which is a one-line status strip).
      if (json.mode === 'preview') {
        setPreviewHtml(json.html || '');
        return;
      }
      setPreviewHtml('');
      setResult(json);
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setBusy('');
    }
  };

  const ready = isComposed({ subject, body });
  const armed = isArmed(confirmText);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="bc-subject" className="block text-sm font-medium text-content-secondary mb-2">
          Subject
        </label>
        <Input
          id="bc-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="AP exams are 3 weeks away"
          maxLength={140}
        />
      </div>

      <div>
        <label htmlFor="bc-body" className="block text-sm font-medium text-content-secondary mb-2">
          Message
        </label>
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {TOOLBAR.map(({ key, label, Icon, run }) => (
            <button
              key={key}
              type="button"
              onClick={run}
              title={label}
              aria-label={label}
              className="p-2 rounded-md border border-border text-content-secondary hover:bg-base-800 hover:text-content-primary"
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
            </button>
          ))}
          <span className="text-xs text-content-muted ml-1">
            **bold** · *italic* · [text](url) · ## heading · - bullet
          </span>
        </div>
        <textarea
          ref={bodyRef}
          id="bc-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          placeholder={'Plain text. An unsubscribe link is appended automatically.'}
          className="w-full bg-base-800 border border-border-strong rounded-lg p-3 text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-content-muted"
        />
        <p className="text-xs text-content-muted mt-1">
          Sent to opted-in users only. Every message gets a one-click unsubscribe link.
        </p>
      </div>

      <div className="border-t border-border-strong pt-4 space-y-3">
        <div>
          <p className="block text-sm font-medium text-content-secondary mb-2">
            Preview — renders the real email, sends nothing
          </p>
          <Button variant="outline" disabled={!ready || !!busy} onClick={() => call({ preview: true }, 'preview')}>
            {busy === 'preview'
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
              : <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />}
            Preview email
          </Button>
          {previewHtml && (
            <div className="mt-3 rounded-lg border border-border-strong overflow-hidden bg-white">
              {/* srcDoc + sandbox: the preview is email HTML with its own
                  <html>/<body>, and it must not inherit the app's CSS or be
                  able to run anything. */}
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                sandbox=""
                className="w-full h-[520px] border-0"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="bc-test" className="block text-sm font-medium text-content-secondary mb-2">
            1 · Send a test to one address
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="bc-test"
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
              className="flex-1"
            />
            <Button
              variant="secondary"
              disabled={!ready || !testTo.trim() || !!busy}
              onClick={() => call({ testTo: testTo.trim() }, 'test')}
            >
              {busy === 'test' && <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />}
              Send test
            </Button>
          </div>
        </div>

        <div>
          <p className="block text-sm font-medium text-content-secondary mb-2">
            2 · Dry run — counts the audience, sends nothing
          </p>
          <Button variant="outline" disabled={!ready || !!busy} onClick={() => call({ dryRun: true }, 'dry')}>
            {busy === 'dry' && <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />}
            Dry run
          </Button>
        </div>

        <div className="rounded-lg border border-error-500/40 bg-error-900/20 p-4">
          <p className="text-sm font-medium text-content-primary mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-error-400" strokeWidth={1.5} />
            3 · Send for real
          </p>
          <p className="text-xs text-content-muted mb-3">
            This cannot be undone. Type <strong>SEND</strong> to enable the button.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SEND"
              className="flex-1 font-mono"
            />
            <Button
              variant="destructive"
              disabled={!ready || !armed || !!busy}
              onClick={() => call({ dryRun: false }, 'send')}
            >
              {busy === 'send' && <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />}
              Send to all opted-in
            </Button>
          </div>
        </div>
      </div>

      {/* Explicit in-progress state — without it a slow send looks like a
          dead button, which invites a second click. */}
      {busy && (
        <div className="rounded-lg border border-border-strong bg-base-800 p-3">
          <p className="text-sm text-content-secondary flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
            {busy === 'test' && 'Sending test email…'}
            {busy === 'dry' && 'Counting opted-in users…'}
            {busy === 'send' && 'Sending to all opted-in users…'}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-error-500/40 bg-error-900/20 p-3">
          <p className="text-sm text-error-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span><strong>Failed.</strong> {error}</span>
          </p>
        </div>
      )}

      {result && (
        <div className={`rounded-lg border p-3 space-y-1 ${
          result.mode === 'sent' && result.failed > 0
            ? 'border-warning-500/40 bg-warning-900/20'
            : 'border-success-500/40 bg-success-900/20'
        }`}>
          <p className="text-sm text-content-primary flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success-400" strokeWidth={1.5} />
            {result.mode === 'dry-run' && `Dry run — would send to ${result.wouldSend} user(s). Nothing sent.`}
            {result.mode === 'test' && `Test email sent to ${result.to}. Check that inbox (and spam).`}
            {result.mode === 'sent' && `Sent ${result.sent}, failed ${result.failed}.`}
          </p>
          {Array.isArray(result.sample) && result.sample.length > 0 && (
            <p className="text-xs text-content-muted">Sample: {result.sample.join(', ')}</p>
          )}
          {Array.isArray(result.failures) && result.failures.length > 0 && (
            <p className="text-xs text-warning-400">
              First failures: {result.failures.map((f) => f.email).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
