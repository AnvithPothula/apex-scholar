/**
 * Firestore, split out of config/firebase.js so it stays off the critical path.
 *
 * config/firebase.js is imported by AuthContext and therefore lands in the eager
 * bundle. When Firestore was initialized there too, the whole
 * @firebase/firestore SDK shipped in main.js — roughly 35 KB gzipped — even
 * though the first paint (guest landing on AI Tutors) never reads the database.
 *
 * Anything that only needs the DB after a user action or after auth resolves
 * should import from here; because every page is already lazy-loaded, that puts
 * Firestore in a route chunk instead of the initial download.
 *
 * Modules in the EAGER graph (AuthContext, Layout and their static imports)
 * must not import this at module scope — use loadFirestore() below.
 */

import { initializeFirestore } from 'firebase/firestore';
import { app } from './firebase';

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true, // Helps Safari / restricted networks
});

export default db;
