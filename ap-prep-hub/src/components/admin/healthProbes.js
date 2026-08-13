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
export function interpretProbe({ status, contentType, payload }, healthy, key) {
  if (!String(contentType || '').includes('application/json')) {
    return { ok: false, detail: 'Not running — use `netlify dev` or the deployed site.' };
  }
  if (healthy.includes(status)) return { ok: true, detail: `HTTP ${status}` };
  const reason = payload && (payload.error || payload.message);
  const diagnosis = diagnose(key, status, reason);
  return { ok: false, detail: reason || `HTTP ${status}`, ...(diagnosis ? { diagnosis } : {}) };
}

/**
 * The per-probe `hint` above names the variables a function needs, which is the
 * right answer when it is unconfigured and the WRONG answer when it is
 * configured and rejecting us. A live 401 from ai-proxy was shown next to
 * "Needs GEMINI_API_KEYS", which sends debugging in the wrong direction — the
 * keys were fine.
 */
export function diagnose(key, status, reason = '') {
  const text = String(reason || '');

  if (status === 401 && key === 'ai-proxy') {
    if (/authentication required/i.test(text)) {
      return 'The proxy requires a signed-in user (REQUIRE_AUTH) and no valid Firebase ID token was sent.';
    }
    // The app-token gate. Note this fires for the PROBE's own credentials, and
    // says nothing about whether real AI traffic works — that goes to
    // REACT_APP_AI_PROXY_URL (the Cloudflare worker), not this function.
    return 'App-token gate rejected the probe. REACT_APP_AI_PROXY_APP_TOKEN must match AI_PROXY_APP_TOKEN '
      + 'and is inlined at BUILD time, so it has to be scoped to Builds and the site rebuilt. '
      + 'This does not affect live AI traffic, which uses REACT_APP_AI_PROXY_URL.';
  }
  if (status === 401) return 'The function rejected our credentials rather than reporting missing config.';
  if (status === 403) return 'Forbidden — the caller is authenticated but not an admin.';
  if (status === 404) return 'Function not deployed at this path. Check the build published netlify/functions.';
  if (status === 429) return 'Rate limited by the function itself, not by Google.';
  if (status >= 500 && /private_key|private key/i.test(text)) {
    return 'The credentials are present but unparseable — see the key fingerprint below.';
  }
  return null;
}
