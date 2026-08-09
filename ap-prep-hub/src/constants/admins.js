/**
 * Admin identity — deliberately a standalone module with NO imports.
 *
 * `isAdmin` used to live in components/DeveloperSettings.jsx. Because Layout,
 * AuthContext and others import it, that pulled the entire Developer Settings
 * panel — and through it firebase/firestore — into the eager bundle, purely to
 * evaluate a 2-element array lookup. Keeping it dependency-free lets the panel
 * itself be lazy-loaded.
 *
 * Mirrored by isAdmin() in firestore.rules — update both together.
 */
export const ADMIN_UIDS = [
  'b0eUycwZDHcmrkoeSEiD69QSbK32',
  'A0yRGP86ZTahByzS0ALYeKAXOn52',
];

export function isAdmin(uid) {
  return ADMIN_UIDS.includes(uid);
}
