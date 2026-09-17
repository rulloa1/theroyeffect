import * as THREE from "three";
import { COLORS, createGlowSprite } from "./shared";

export const EMBLEM_RADIUS = 1.6;

export interface Emblem {
  group: THREE.Group;
  /** Rotating body — kept separate so glow and portal ring stay camera-facing. */
  body: THREE.Group;
  portal: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  setOpacity(value: number): void;
  setGlow(value: number): void;
  dispose(): void;
}

/**
 * A dimensional version of the round Roy Effect logo: the real artwork on the
 * face, a machined black edge that catches red and gold light, and a red rim.
 * Swap `texture` for a baked GLB later without touching the scenes.
 */
export function createEmblem(texture: THREE.Texture, glowTexture: THREE.Texture): Emblem {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(EMBLEM_RADIUS, 128),
    // Fog off so brand colours stay exact at the reveal distance.
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: false }),
  );
  face.position.z = 0.071;
  body.add(face);

  const back = new THREE.Mesh(
    new THREE.CircleGeometry(EMBLEM_RADIUS, 128),
    new THREE.MeshStandardMaterial({ color: "#0b0b0b", metalness: 0.8, roughness: 0.4 }),
  );
  back.rotation.y = Math.PI;
  back.position.z = -0.071;
  body.add(back);

  const edge = new THREE.Mesh(
    new THREE.CylinderGeometry(EMBLEM_RADIUS, EMBLEM_RADIUS, 0.14, 128, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#141414",
      metalness: 0.95,
      roughness: 0.28,
      side: THREE.DoubleSide,
    }),
  );
  edge.rotation.x = Math.PI / 2;
  body.add(edge);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(EMBLEM_RADIUS + 0.035, 0.016, 12, 180),
    new THREE.MeshBasicMaterial({ color: COLORS.red, transparent: true, fog: false }),
  );
  body.add(rim);

  const goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(EMBLEM_RADIUS + 0.2, 0.005, 8, 200),
    new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      metalness: 1,
      roughness: 0.25,
      emissive: COLORS.gold,
      emissiveIntensity: 0.12,
      transparent: true,
    }),
  );
  body.add(goldRing);

  const glow = createGlowSprite(glowTexture, COLORS.red, EMBLEM_RADIUS * 4.6);
  glow.position.z = -0.4;
  group.add(glow);

  // The portal: a red ring that grows out of the R as the camera commits to it.
  const portal = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.02, 12, 160),
    new THREE.MeshBasicMaterial({
      color: COLORS.red,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  portal.position.z = 0.12;
  group.add(portal);

  const fadeables = [face, rim, goldRing].map(
    (m) => m.material as THREE.Material & { opacity: number },
  );
  const lit = [back, edge].map((m) => m.material as THREE.MeshStandardMaterial);
  lit.forEach((m) => (m.transparent = true));

  return {
    group,
    body,
    portal,
    setOpacity(value) {
      const v = Math.max(0, Math.min(1, value));
      fadeables.forEach((m) => (m.opacity = v));
      lit.forEach((m) => (m.opacity = v));
      group.visible = v > 0.002;
    },
    setGlow(value) {
      glow.material.opacity = Math.max(0, value) * 0.42;
    },
    dispose() {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | undefined;
        mat?.dispose();
      });
    },
  };
}

/**
 * Sample the artwork's R into 3D points by reading pixel colour, so the growth
 * scene forms the *actual* brand letterform rather than an approximation.
 */
export function sampleEmblemR(
  image: HTMLImageElement | ImageBitmap,
  count: number,
  seed: () => number,
) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const positions: number[] = [];
  const colors: number[] = [];
  if (!ctx) return { positions: new Float32Array(), colors: new Float32Array() };
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const candidates: { x: number; y: number; red: boolean }[] = [];
  // The R occupies roughly the central third of the badge; outer lettering is excluded.
  for (let y = Math.floor(size * 0.26); y < size * 0.72; y++) {
    for (let x = Math.floor(size * 0.32); x < size * 0.7; x++) {
      const i = (y * size + x) * 4;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = data[i + 3] ?? 0;
      if (a < 200) continue;
      const isRed = r > 170 && g < 80 && b < 80;
      const isWhite = r > 205 && g > 205 && b > 205;
      if (isRed || isWhite) candidates.push({ x, y, red: isRed });
    }
  }
  if (candidates.length === 0) return { positions: new Float32Array(), colors: new Float32Array() };

  for (let n = 0; n < count; n++) {
    const c = candidates[Math.floor(seed() * candidates.length)];
    if (!c) continue;
    const u = c.x / size - 0.5;
    const v = 0.5 - c.y / size;
    positions.push(u * EMBLEM_RADIUS * 2, v * EMBLEM_RADIUS * 2, (seed() - 0.5) * 0.06);
    const col = c.red ? COLORS.red : COLORS.white;
    colors.push(col.r, col.g, col.b);
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
}
