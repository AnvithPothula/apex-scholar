import { ADMIN_UIDS } from './admins';

/**
 * Accounts exempt from AI usage caps — WITHOUT granting admin rights.
 *
 * Deliberately separate from ADMIN_UIDS. Admin gates Developer Settings, site
 * statistics, the email broadcaster and (via firestore.rules) read access to
 * other people's data. "Never hits a rate limit" is a much smaller privilege
 * than that, and conflating the two would hand a tester the whole admin surface
 * just to let them run more practice tests.
 *
 * Admins are unlimited as well, so this is the union — but membership here
 * confers no admin capability. Mirrored in netlify/lib/unlimitedUsers.js
 * because Netlify functions cannot import from src/; a drift test keeps the two
 * in step.
 */
export const UNLIMITED_UIDS = [
  'n6hJheORnphPh2UmzZnfwvBOH5z2', // tester
];

/** True when this uid should never be metered. Admins included. */
export function hasUnlimitedUsage(uid) {
  if (!uid) return false;
  return UNLIMITED_UIDS.includes(uid) || ADMIN_UIDS.includes(uid);
}
