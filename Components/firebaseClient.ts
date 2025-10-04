// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration.
// Prefer environment variables (NEXT_PUBLIC_FIREBASE_*). If they are not present
// we fall back to the inline values (useful for quick local testing).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCiWLUDY6NjN8_63p1Zh8t-tT2qCxSddpo',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'mj2-studios.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? 'https://mj2-studios-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'mj2-studios',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'mj2-studios.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID ?? '297252916911',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:297252916911:web:b1e39547fbe37da8c78e5a',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-90R9PZRVQB',
};

// Initialize (or reuse) the Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize analytics only in environments that support it. Wrap in try/catch
// because getAnalytics will throw in SSR or non-browser contexts.
let analytics;
try {
  // Only attempt analytics if window is available
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch {
  // Non-fatal: analytics isn't critical and may not be supported in some envs
  analytics = undefined;
}

// Firestore is always available client-side once app is initialized
export const db = getFirestore(app);

// Realtime Database: prefer explicit DATABASE_URL env var, otherwise use the
// databaseURL from the config. If initialization fails, export null so callers
// can fall back to Firestore.
let _rtdb = null;
const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? firebaseConfig.databaseURL;
if (dbUrl) {
  try {
    _rtdb = getDatabase(app, dbUrl);
  } catch {
    // leave _rtdb null on failure; callers should handle fallback
    _rtdb = null;
  }
}
export const rtdb = _rtdb;

// Also export the app and analytics if callers need them
export { app, analytics };
// Export Firebase Auth
export const auth = getAuth(app);