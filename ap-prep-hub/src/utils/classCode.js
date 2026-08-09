/**
 * Join codes for classes / clubs.
 *
 * The code IS the Firestore document id. That's deliberate: joining is then a
 * single document `get` by id, so the security rules never have to permit a
 * query across the classes collection — which would let anyone enumerate every
 * class name in the app. The id is the secret; `list` stays denied.
 *
 * Alphabet excludes 0/O/1/I/L, which students mistype constantly when a code is
 * read off a whiteboard or a projector.
 */

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE_LENGTH = 8;

// Deliberately NO lookalike auto-correction. 0/O/1/I/L are never issued, so any
// input containing one is a misread — and there is no unambiguous character to
// map it to (O is not in the alphabet either). Guessing would silently send a
// student to the wrong class, which is worse than telling them to re-check the
// code. Reject instead.
const NEVER_ISSUED = /[01OIL]/;

/**
 * Cryptographically-random join code. 31^8 ≈ 8.5e11 combinations, so a
 * collision is a non-event — but createClass still checks before writing,
 * because "non-event" is not "impossible".
 */
export function generateClassCode(length = CODE_LENGTH) {
  const bytes = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Node/jsdom fallback. Only reachable in tests; Math.random is fine there
    // because no real code is ever issued from this path.
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 0xffffffff);
  }
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Normalise whatever the student typed or pasted into a canonical code.
 * Accepts lowercase, spaces, dashes, a pasted full URL, and the usual
 * 0/O and 1/I mix-ups. Returns '' when it can't be a valid code.
 */
export function normalizeClassCode(input) {
  if (input === null || input === undefined) return '';
  let s = String(input).trim();
  if (!s) return '';

  // Accept a pasted join link: take the last non-empty path segment.
  if (s.includes('/')) {
    const segments = s.split('?')[0].split('#')[0].split('/').filter(Boolean);
    s = segments.length ? segments[segments.length - 1] : '';
  }

  s = s.toUpperCase().replace(/[\s-]/g, '');

  if (NEVER_ISSUED.test(s)) return '';
  if (s.length !== CODE_LENGTH) return '';
  for (const ch of s) if (!ALPHABET.includes(ch)) return '';
  return s;
}

/** True when `code` is exactly a well-formed, canonical join code. */
export function isValidClassCode(code) {
  return typeof code === 'string' && normalizeClassCode(code) === code;
}

/** Trim a user-supplied class name to something safe to store and display. */
export function sanitizeClassName(name, fallback = 'Untitled class') {
  const s = String(name === null || name === undefined ? '' : name)
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return fallback;
  return s.slice(0, 60);
}

/**
 * Display name shown on the leaderboard.
 *
 * Never derive this from an email address — these are mostly minors, and an
 * email local part is usually their real full name. Callers pass the account
 * display name; anything falsy becomes an anonymous label.
 */
export function sanitizeDisplayName(name, fallback = 'Anonymous') {
  const s = String(name === null || name === undefined ? '' : name)
    .replace(/\s+/g, ' ')
    .trim();
  if (!s || s.includes('@')) return fallback;
  return s.slice(0, 32);
}

export { ALPHABET };
