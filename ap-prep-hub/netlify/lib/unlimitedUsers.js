/**
 * Server-side copy of the usage-exempt uid list.
 *
 * Netlify functions cannot import from src/, so this mirrors
 * src/constants/unlimitedUsers.js. A client-only exemption would be worthless:
 * ai-proxy enforces the tamper-proof per-user quota, so the bypass has to exist
 * here too or the cap still fires on the server.
 *
 * These uids are exempt from METERING only. They get no admin capability —
 * admin lives in ADMIN_UIDS / firestore.rules and is checked separately.
 *
 * Kept in step with the client list by src/constants/unlimitedUsers.test.js.
 */
const UNLIMITED_UIDS = [
  'n6hJheORnphPh2UmzZnfwvBOH5z2', // tester
];

const ADMIN_UIDS = [
  'b0eUycwZDHcmrkoeSEiD69QSbK32',
  'A0yRGP86ZTahByzS0ALYeKAXOn52',
];

function hasUnlimitedUsage(uid) {
  if (!uid) return false;
  return UNLIMITED_UIDS.includes(uid) || ADMIN_UIDS.includes(uid);
}

module.exports = { UNLIMITED_UIDS, ADMIN_UIDS, hasUnlimitedUsage };
