/**
 * Single source of truth for public contact addresses.
 *
 * These are Cloudflare Email Routing aliases on apex-scholar.com that forward
 * to the real inbox — so the address on the site never has to change if the
 * destination mailbox does, and the personal Gmail is never published.
 *
 * ⚠️ These only work once Email Routing is enabled on the zone with a verified
 * destination. Until then mail to them bounces.
 */
export const CONTACT_EMAIL = 'help@apex-scholar.com';
export const PRIVACY_EMAIL = 'privacy@apex-scholar.com';
// Outbound only (SMTP2GO). Deliberately has NO routing rule, so replies bounce
// instead of landing silently in an inbox nobody reads.
export const NOREPLY_EMAIL = 'no-reply@apex-scholar.com';

export default CONTACT_EMAIL;
