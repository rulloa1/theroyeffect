import * as THREE from "three";
import { easeInOut, lerp, segment, windowed } from "../timeline";
import { NETWORK_Z } from "./AIScene";
import { sampleEmblemR } from "./emblem";
import { seeded, type FrameContext, type SceneModule } from "./shared";

/** Where the finished emblem sits for the growth + reveal sequence. */
export const EMBLEM_ANCHOR = new THREE.Vector3(0, 0.95, NETWORK_Z);

/**
 * Scene 05 — growth. The network we've been travelling through contracts into
 * the brand's own R, sampled from the logo artwork.
 */
export function createGrowthScene(emblemImage: HTMLImageElement, count: number): SceneModule {
  const root = new THREE.Group();
  root.position.copy(EMBLEM_ANCHOR);
  const rand = seeded(97);

  const target = sampleEmblemR(emblemImage, count, rand);
  const n = target.positions.length / 3;
  const start = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // A loose shell — the same airy field the automation scene dissolves into.
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 3 + rand() * 3.5;
    start[i * 3] = Math.sin(phi) * Math.cos(theta) * r * 1.6;
    start[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.8;
    start[i * 3 + 2] = Math.cos(phi) * r * 0.7;
  }
  const delays = new Float32Array(n);
  for (let i = 0; i < n; i++) delays[i] = rand() * 0.35;

  const positions = new Float32Array(start);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(target.colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  root.add(points);

  return {
    object: root,
    update({ p, t }: FrameContext) {
      const presence = windowed(p, 0.71, 0.9, 0.02);
      root.visible = presence > 0 && n > 0;
      if (!root.visible) return;

      const form = segment(p, 0.73, 0.83);
      for (let i = 0; i < n; i++) {
        const local = easeInOut(Math.min(1, Math.max(0, (form - (delays[i] ?? 0)) / 0.65)));
        const o = i * 3;
        const wobble = (1 - local) * 0.12;
        positions[o] =
          lerp(start[o] ?? 0, target.positions[o] ?? 0, local) + Math.sin(t + i) * wobble;
        positions[o + 1] =
          lerp(start[o + 1] ?? 0, target.positions[o + 1] ?? 0, local) +
          Math.cos(t * 0.8 + i) * wobble;
        positions[o + 2] = lerp(start[o + 2] ?? 0, target.positions[o + 2] ?? 0, local);
      }
      geometry.attributes["position"]!.needsUpdate = true;

      // The formed R starts oversized and settles to the emblem's exact scale,
      // so it registers perfectly when the artwork fades in behind it.
      const settle = easeInOut(segment(p, 0.76, 0.86));
      root.scale.setScalar(lerp(1.9, 1, settle));
      // Collapse to darkness as the reveal takes over.
      material.opacity = presence * (1 - segment(p, 0.855, 0.895)) * 0.95;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
