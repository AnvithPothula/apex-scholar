/**
 * On-demand Firestore loader for modules in the EAGER bundle.
 *
 * This file deliberately has NO static firebase imports. Importing
 * ./firestore (or firebase/firestore) at module scope from an eager module —
 * AuthContext, Layout, or anything they statically import — would pull the
 * whole Firestore SDK back into main.js and undo the code split.
 *
 * Usage inside an async function:
 *   const { db, doc, getDoc } = await loadFirestore();
 */
export async function loadFirestore() {
  const [{ db }, fns] = await Promise.all([
    import('./firestore'),
    import('firebase/firestore'),
  ]);
  return { db, ...fns };
}

export default loadFirestore;
