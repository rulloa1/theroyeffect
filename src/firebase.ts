import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "mock-api-key",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "mock-app.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "mock-project",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "mock-app.appspot.com",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "000000000000",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:000000000000:web:000000000000",
  ...(import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"]
    ? { measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] }
    : {}),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export default app;
