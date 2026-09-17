// One source of truth for how scroll progress (0–1) maps onto the story.
// The HTML overlay timeline and every WebGL scene read from these ranges,
// so text, camera and objects can never drift out of sync.

export type SceneId = "arrival" | "websites" | "ai" | "automation" | "growth" | "reveal";

export const SCENE_RANGES: Record<SceneId, readonly [number, number]> = {
  arrival: [0, 0.15],
  websites: [0.15, 0.35],
  ai: [0.35, 0.55],
  automation: [0.55, 0.72],
  growth: [0.72, 0.88],
  reveal: [0.88, 1],
};

export const SCENE_ORDER: SceneId[] = [
  "arrival",
  "websites",
  "ai",
  "automation",
  "growth",
  "reveal",
];

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map progress into 0–1 across [start, end]. */
export const segment = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

/** 0 outside the window, ramps to 1 over `fade` at each edge. */
export function windowed(p: number, start: number, end: number, fade = 0.02) {
  if (p <= start - fade || p >= end + fade) return 0;
  const inT = segment(p, start - fade, start + fade);
  const outT = 1 - segment(p, end - fade, end + fade);
  return Math.min(inT, outT);
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Overshoot ease — used for the automation "snap". */
export function easeBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function sceneAt(p: number): SceneId {
  for (const id of SCENE_ORDER) {
    const [, end] = SCENE_RANGES[id];
    if (p < end) return id;
  }
  return "reveal";
}
