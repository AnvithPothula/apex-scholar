/**
 * Shared firebase-admin bootstrap for the Netlify functions.
 *
 * Written because three functions each had their own copy that collapsed every
 * possible failure into one misleading message ("Server is missing Firebase
 * admin credentials") — including the case where the variables were all present
 * and it was the *private key* that wouldn't parse. That sent debugging in
 * exactly the wrong direction.
 *
 * `admin.credential.cert()` throws on a bad key:
 *   Failed to parse private key: error:1E08010C:DECODER routines::unsupported
 * so the distinction matters.
 */

/**
 * Normalise a PEM private key that has been round-tripped through an env var.
 *
 * Env UIs mangle these in predictable ways:
 *   - real newlines replaced with the two characters \ and n
 *   - the whole value wrapped in single or double quotes
 *   - CRLF line endings
 *   - a trailing literal \n that should be a real newline
 */
function normalizePrivateKey(raw) {
  if (typeof raw !== 'string') return '';
  let key = raw.trim();

  // Strip one layer of surrounding quotes — a very common paste artefact, and
  // one that makes cert() fail with an opaque decoder error.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  key = key
    .replace(/\\r\\n/g, '\n')  // escaped CRLF
    .replace(/\\n/g, '\n')     // escaped LF (the usual case)
    .replace(/\r\n/g, '\n');   // real CRLF

  // OpenSSL requires a trailing newline after the footer.
  if (!key.endsWith('\n')) key += '\n';
  return key;
}

/** Cheap shape check so we can report a useful reason before cert() throws. */
function describeKeyProblem(key) {
  if (!key) return 'FIREBASE_PRIVATE_KEY is empty.';
  if (!key.includes('-----BEGIN')) {
    return 'FIREBASE_PRIVATE_KEY has no "-----BEGIN PRIVATE KEY-----" header — it may be truncated or the wrong value.';
  }
  if (!key.includes('-----END')) {
    return 'FIREBASE_PRIVATE_KEY has no "-----END PRIVATE KEY-----" footer — it looks truncated.';
  }
  if (!key.includes('\n')) {
    return 'FIREBASE_PRIVATE_KEY contains no newlines, so OpenSSL cannot parse it. Store the key with real newlines or with \\n escapes.';
  }
  return null;
}

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawKey) {
    return { creds: { projectId, clientEmail, privateKey: normalizePrivateKey(rawKey) }, source: 'split' };
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.private_key) parsed.privateKey = normalizePrivateKey(parsed.private_key);
      if (parsed.privateKey) parsed.privateKey = normalizePrivateKey(parsed.privateKey);
      if (parsed.client_email) parsed.clientEmail = parsed.client_email;
      if (parsed.project_id) parsed.projectId = parsed.project_id;
      return { creds: parsed, source: 'json' };
    } catch (e) {
      return { creds: null, error: `FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${e.message}` };
    }
  }

  const missing = [
    !projectId && 'FIREBASE_PROJECT_ID',
    !clientEmail && 'FIREBASE_CLIENT_EMAIL',
    !rawKey && 'FIREBASE_PRIVATE_KEY',
  ].filter(Boolean);
  return { creds: null, error: `Missing environment variable(s): ${missing.join(', ')}.` };
}

let _cached = null;

/**
 * @returns {{ app: object|null, error: string|null }} — `error` names the actual
 *   failure so callers can surface it instead of guessing.
 */
function getAdminApp() {
  if (_cached) return _cached;

  const { creds, error } = loadServiceAccount();
  if (!creds) {
    _cached = { app: null, error: error || 'No Firebase admin credentials configured.' };
    return _cached;
  }

  const keyProblem = describeKeyProblem(creds.privateKey);
  if (keyProblem) {
    _cached = { app: null, error: keyProblem };
    return _cached;
  }

  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    _cached = { app: null, error: `firebase-admin is not installed in the function bundle: ${e.message}` };
    return _cached;
  }

  try {
    const app = (admin.apps && admin.apps.length)
      ? admin.app()
      : admin.initializeApp({ credential: admin.credential.cert(creds) });
    app.__admin = admin;
    _cached = { app, error: null };
  } catch (e) {
    // The common one: "Failed to parse private key: ... DECODER routines::unsupported"
    _cached = { app: null, error: `Firebase admin init failed: ${e.message}` };
  }
  return _cached;
}

module.exports = { getAdminApp, normalizePrivateKey, describeKeyProblem, loadServiceAccount };
