export type QualityTier = "high" | "low";

export interface Quality {
  tier: QualityTier;
  /** Upper bound for renderer pixel ratio. */
  maxDpr: number;
  antialias: boolean;
  ambientParticles: number;
  networkNodes: number;
  growthPoints: number;
  pointerParallax: boolean;
}

const HIGH: Quality = {
  tier: "high",
  maxDpr: 1.75,
  antialias: true,
  ambientParticles: 1400,
  networkNodes: 64,
  growthPoints: 1100,
  pointerParallax: true,
};

const LOW: Quality = {
  tier: "low",
  maxDpr: 1.25,
  antialias: false,
  ambientParticles: 420,
  networkNodes: 26,
  growthPoints: 460,
  pointerParallax: false,
};

/**
 * Pick a render budget from coarse, cheap signals. Deliberately conservative:
 * a phone that could handle "high" still reads as premium on "low", while the
 * reverse stutters.
 */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return LOW;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  if (coarse || narrow || cores < 4 || memory < 4) return LOW;
  return HIGH;
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
