import { useSyncExternalStore } from "react";

const STORAGE_KEY = "tre:motion-paused";
const listeners = new Set<() => void>();

function readStoredPreference() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

let paused = false;
let hydrated = false;

function syncDocumentAttribute() {
  if (typeof document === "undefined") return;
  if (paused) document.documentElement.dataset["motion"] = "paused";
  else delete document.documentElement.dataset["motion"];
}

function hydratePreference() {
  if (hydrated || typeof window === "undefined") return false;
  hydrated = true;
  const previous = paused;
  paused = readStoredPreference();
  syncDocumentAttribute();
  return previous !== paused;
}

export function getMotionPaused() {
  hydratePreference();
  return paused;
}

export function subscribeMotionPreference(listener: () => void) {
  listeners.add(listener);
  hydratePreference();
  queueMicrotask(listener);
  return () => listeners.delete(listener);
}

export function setMotionPaused(nextPaused: boolean) {
  hydratePreference();
  if (paused === nextPaused) return;
  paused = nextPaused;
  syncDocumentAttribute();
  try {
    window.localStorage.setItem(STORAGE_KEY, String(nextPaused));
  } catch {
    // Storage may be unavailable in privacy-restricted browsing contexts.
  }
  listeners.forEach((listener) => listener());
}

export function useMotionPaused() {
  return useSyncExternalStore(subscribeMotionPreference, getMotionPaused, () => false);
}
