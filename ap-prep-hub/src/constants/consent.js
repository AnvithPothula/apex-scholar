/**
 * Consent captured on the login screen, held across a Google redirect.
 *
 * Google sign-in creates the Firestore user document in AuthContext *after*
 * auth resolves — and the production flow is `signInWithRedirect`, which
 * navigates the page away and back. So the checkbox values cannot simply be
 * passed as arguments; they have to survive a full page load. localStorage is
 * the only store that does.
 *
 * Nothing sensitive lives here: two booleans and a timestamp.
 */

const KEY = 'apex.pendingConsent';

/** Stash the login-screen choices before a sign-in that may navigate away. */
export function stashPendingConsent({ acceptedTerms, emailOptIn }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      acceptedTerms: acceptedTerms === true,
      emailOptIn: emailOptIn === true,
      at: new Date().toISOString(),
    }));
  } catch {
    // Private mode — the account still gets created, just without a recorded
    // acceptance timestamp. Not worth blocking sign-in over.
  }
}

/** Read the stashed choices. Returns null when there are none. */
export function readPendingConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      acceptedTerms: parsed.acceptedTerms === true,
      emailOptIn: parsed.emailOptIn === true,
      at: typeof parsed.at === 'string' ? parsed.at : null,
    };
  } catch {
    return null;
  }
}

export function clearPendingConsent() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

const consent = { stashPendingConsent, readPendingConsent, clearPendingConsent };
export default consent;
