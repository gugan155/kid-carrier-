// firebase.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ⚠️  SECURITY: Never commit real keys here.
// Copy firebase.config.example.js → firebase.config.js and fill in your values.
// firebase.config.js is gitignored and must NOT be deployed as source.
//
// For static hosting (GitHub Pages / Vercel / Netlify) inject via:
//   - Netlify: Site settings → Environment variables
//   - Vercel:  Project settings → Environment variables
//   - Or use a build step that writes firebase.config.js from env vars at deploy time.

import { FIREBASE_CONFIG } from "./firebase.config.js";
const firebaseConfig = FIREBASE_CONFIG;

// Guard: only initialize once (safe for hot-reload / module re-evaluation)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);

// Enable offline persistence so reads/writes survive network blips
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open — persistence only works in one tab at a time
    console.warn("[Firebase] Offline persistence unavailable (multiple tabs)");
  } else if (err.code === "unimplemented") {
    // Browser doesn't support it
    console.warn("[Firebase] Offline persistence not supported in this browser");
  }
});

export {
  db,
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp as timestamp
};