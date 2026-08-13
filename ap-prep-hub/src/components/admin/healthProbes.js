/**
 * Health probes for the Netlify functions whose configuration has actually
 * broken in production: Firebase admin creds, SMTP creds, and Gemini keys.
 *
 * Every probe is side-effect-free by construction, not by convention:
 *  - admin-stats     is a read.
 *  - email-broadcast checks SMTP/admin env BEFORE parsing the body, and its
 *    dryRun flag defaults to true — an empty POST can never send mail.
 *  - ai-proxy        checks for keys BEFORE validating `contents`, so an empty
 *    POST distinguishes "no keys" (503) from "keys present" (400) for free,
 *    without spending a single AI token.
 *
 * Lives apart from DeveloperSettings.jsx so it can be tested without pulling
 * firebase (and the rest of the admin panel) into jsdom.
 */

/**
 * `healthy` lists the statuses that prove the function is configured. A 400 is
 * a pass where it means "your request was empty" — we sent an empty request.
 */
export const HEALTH_PROBES = [
  {
    key: 'admin-stats',
    label: 'Admin stats',
    hint: 'FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY',
    method: 'GET',
    healthy: [200],
  },
  {
    key: 'email-broadcast',
    label: 'Email broadcast',
    hint: 'SMTP2GO_API_KEY, MAIL_FROM, UNSUBSCRIBE_SECRET',
    method: 'POST',
    body: '{}',
    healthy: [200, 400],
  },
  {
    key: 'ai-proxy',
    label: 'AI proxy',
    hint: 'GEMINI_API_KEYS',
    method: 'POST',
    body: '{}',
    healthy: [400], // 400 = keys present, body empty. 503 = no keys.
  },
];

/**
 * Turn a probe response into a verdict.
 *
 * The CRA dev server answers unknown paths with index.html and a 200, so a
 * bare `res.ok` reports every function as healthy under `npm start`. Content
 * type is the only reliable signal that a function actually ran.
 */
export function interpretProbe({ status, contentType, payload }, healthy) {
  if (!String(contentType || '').includes('application/json')) {
    return { ok: false, detail: 'Not running — use `netlify dev` or the deployed site.' };
  }
  if (healthy.includes(status)) return { ok: true, detail: `HTTP ${status}` };
  const reason = payload && (payload.error || payload.message);
  return { ok: false, detail: reason || `HTTP ${status}` };
}
