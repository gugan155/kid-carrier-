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
  serverTimestamp,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9s9v-O77PMqAipRKpYSQWqnubZi7PVeY",
  authDomain: "carrierlab-a5e2a.firebaseapp.com",
  databaseURL: "https://carrierlab-a5e2a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "carrierlab-a5e2a",
  storageBucket: "carrierlab-a5e2a.appspot.com",
  messagingSenderId: "104669318159",
  appId: "1:104669318159:web:5d83da2067e10dd763677a",
  measurementId: "G-C847DNT6W7"
};

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
  serverTimestamp as timestamp
};