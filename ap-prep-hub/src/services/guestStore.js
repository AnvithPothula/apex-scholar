/**
 * guestStore — localStorage-backed AI Tutors chat for signed-out (guest) users.
 *
 * Guests get exactly ONE conversation per subject. No Firebase, no multi-session
 * management, no cross-device sync. This intentionally mirrors only the minimal
 * shape AITutors.js needs so we can route guest reads/writes through the same
 * call sites (saveMessage / loadConversationMessages) instead of forking the
 * whole 2300-line component.
 *
 * Storage shape (single localStorage key):
 *   {
 *     [subjectId]: {
 *       id, name, subject, messages: [...], lastMessage,
 *       createdAt (ISO), updatedAt (ISO)
 *     }
 *   }
 */

import errorLogger from '../utils/errorLogger';

const KEY = 'apex.guest.aitutors.v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch (e) {
    errorLogger.debug('guestStore read failed', { error: e?.message });
    return {};
  }
}

function writeAll(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch (e) {
    // Quota or private-mode write failure — chat still works in-memory for
    // the current session, it just won't survive a refresh. Non-fatal.
    errorLogger.debug('guestStore write failed', { error: e?.message });
  }
}

/** Synthetic, stable conversation id for a subject's guest thread. */
export function guestConversationId(subject) {
  return `guest-${subject}`;
}

/** True if an id belongs to the guest (localStorage) namespace. */
export function isGuestConversationId(id) {
  return typeof id === 'string' && id.startsWith('guest-');
}

/** Recover the subject from a guest conversation id. */
export function subjectFromGuestId(id) {
  return typeof id === 'string' && id.startsWith('guest-') ? id.slice('guest-'.length) : null;
}

/** Get the stored guest conversation for a subject, or null. */
export function getGuestConversation(subject) {
  return readAll()[subject] || null;
}

/**
 * Ensure a guest conversation exists for a subject. If creating it for the
 * first time, seed it with the provided welcome message (if any).
 * Returns the conversation record (timestamps are ISO strings).
 */
export function ensureGuestConversation(subject, name, welcomeMessage) {
  const all = readAll();
  if (!all[subject]) {
    const now = new Date().toISOString();
    all[subject] = {
      id: guestConversationId(subject),
      name: name || 'Guest session',
      subject,
      messages: welcomeMessage ? [serializeMessage(welcomeMessage)] : [],
      lastMessage: '',
      createdAt: now,
      updatedAt: now,
    };
    writeAll(all);
  }
  return all[subject];
}

/** Messages for a subject's guest thread, with timestamps revived to Date. */
export function getGuestMessages(subject) {
  const conv = getGuestConversation(subject);
  if (!conv) return [];
  return (conv.messages || []).map((m) => ({
    ...m,
    timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
  }));
}

function serializeMessage(message) {
  const serial = {
    ...message,
    timestamp:
      message.timestamp instanceof Date
        ? message.timestamp.toISOString()
        : message.timestamp || new Date().toISOString(),
  };
  // Strip heavy base64 file payloads — mirror the Firestore sanitization so
  // guest localStorage doesn't blow past quota with image data.
  if (Array.isArray(serial.files) && serial.files.length > 0) {
    serial.files = serial.files.map((f) => {
      const meta = {
        id: f.id,
        name: f.name,
        size: typeof f.size === 'number' ? f.size : undefined,
        mimeType: f.mimeType || f.type || undefined,
        category: f.category || undefined,
      };
      Object.keys(meta).forEach((k) => meta[k] === undefined && delete meta[k]);
      return meta;
    });
  }
  return serial;
}

/**
 * Append a message to a subject's guest thread. Creates the thread if needed.
 * Returns the message id (the flow checks for a truthy id to proceed).
 */
export function appendGuestMessage(subject, message) {
  const all = readAll();
  if (!all[subject]) {
    ensureGuestConversation(subject);
    return appendGuestMessage(subject, message);
  }
  const conv = all[subject];
  const serial = serializeMessage(message);
  conv.messages = [...(conv.messages || []), serial];
  const content = String(message.content || '');
  conv.lastMessage = content.slice(0, 50) + (content.length > 50 ? '...' : '');
  conv.updatedAt = new Date().toISOString();
  writeAll(all);
  return serial.id;
}

/* ------------------------------------------------------------------ *
 * Guest usage cap
 *
 * Guests share the app's client-side Gemini keys, so anonymous usage is
 * rate-limited per browser per day. This is a conversion nudge + casual-
 * abuse bound, NOT real security: clearing site data / incognito resets
 * it. Real protection requires a server-side AI proxy.
 * ------------------------------------------------------------------ */

export const GUEST_MESSAGE_LIMIT = 20; // AI messages per browser per day

const USAGE_KEY = 'apex.guest.usage.v1';

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (local-ish, fine for a soft cap)
}

/** Current day's usage. Auto-resets when the date rolls over. */
export function getGuestUsage() {
  try {
    const raw = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    if (raw.day !== todayStr()) return { count: 0, day: todayStr() };
    return { count: raw.count || 0, day: raw.day };
  } catch (e) {
    errorLogger.debug('guest usage read failed', { error: e?.message });
    return { count: 0, day: todayStr() };
  }
}

/** How many AI messages the guest has left today (never negative). */
export function guestMessagesRemaining() {
  return Math.max(0, GUEST_MESSAGE_LIMIT - getGuestUsage().count);
}

/** Record one AI message against today's quota. Returns the new count. */
export function incrementGuestUsage() {
  const u = getGuestUsage();
  const next = { count: u.count + 1, day: todayStr() };
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(next));
  } catch (e) {
    errorLogger.debug('guest usage write failed', { error: e?.message });
  }
  return next.count;
}

/** Wipe a subject's guest thread (used when a guest starts a fresh chat). */
export function clearGuestConversation(subject) {
  const all = readAll();
  if (all[subject]) {
    delete all[subject];
    writeAll(all);
  }
}
