import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

import { getFirebaseConfig } from "./config";

/**
 * Analytics-only entry point for the root FirebaseProvider.
 *
 * Imports just `firebase/app` + `firebase/analytics` so every page view doesn't
 * lazy-load the auth, Firestore and storage SDKs that only `./client` needs.
 */
export async function startFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;

  const config = getFirebaseConfig();
  if (!config) return null;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const { measurementId, ...options } = config;
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({ ...options, ...(measurementId ? { measurementId } : {}) });
  return getAnalytics(app);
}
