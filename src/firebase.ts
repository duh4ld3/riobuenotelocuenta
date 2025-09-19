// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore /* o initializeFirestore */, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId es opcional
});

export const auth = getAuth(app);

// Si estás detrás de proxy/firewall y te daba problemas de streaming:
// import { initializeFirestore } from "firebase/firestore";
// export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const db = getFirestore(app);

export const storage = getStorage(app);

// (si usabas serverTimestamp aquí, solo recuerda importarlo donde lo necesites)
export { serverTimestamp };
