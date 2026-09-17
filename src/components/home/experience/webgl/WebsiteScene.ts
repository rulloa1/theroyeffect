import * as THREE from "three";
import { WEBSITE_LABELS } from "../../content";
import { clamp01, easeInOut, easeOut, segment, windowed } from "../timeline";
import { COLORS, createGlowSprite, seeded, type FrameContext, type SceneModule } from "./shared";

export const WEBSITE_Z = -12;

interface Piece {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  from: THREE.Vector3;
  delay: number;
  material: THREE.MeshBasicMaterial;
  maxOpacity: number;
}

type Block = [
  x: number,
  y: number,
  w: number,
  h: number,
  tone: "white" | "grey" | "red" | "gold" | "panel",
  alpha?: number,
];

// Layouts in screen-normalised units (-0.5…0.5). One website, three breakpoints.
const DESKTOP: Block[] = [
  [0, 0.43, 1, 0.08, "panel", 0.9],
  [-0.44, 0.43, 0.035, 0.035, "red"],
  [0.3, 0.43, 0.26, 0.022, "grey", 0.5],
  [-0.2, 0.2, 0.52, 0.075, "white"],
  [-0.23, 0.1, 0.46, 0.075, "white"],
  [-0.26, -0.01, 0.4, 0.028, "grey", 0.6],
  [-0.36, -0.1, 0.2, 0.06, "red"],
  [0.26, 0.08, 0.36, 0.42, "gold", 0.28],
  [-0.31, -0.33, 0.28, 0.18, "panel", 0.85],
  [0, -0.33, 0.28, 0.18, "panel", 0.85],
  [0.31, -0.33, 0.28, 0.18, "panel", 0.85],
];

const LAPTOP: Block[] = [
  [0, 0.42, 1, 0.1, "panel", 0.9],
  [-0.42, 0.42, 0.045, 0.045, "red"],
  [-0.25, 0.2, 0.42, 0.09, "white"],
  [-0.28, 0.07, 0.36, 0.03, "grey", 0.6],
  [-0.35, -0.05, 0.22, 0.075, "red"],
  [0.25, 0.1, 0.4, 0.4, "gold", 0.26],
  [-0.25, -0.32, 0.42, 0.22, "panel", 0.85],
  [0.25, -0.32, 0.42, 0.22, "panel", 0.85],
];

const PHONE: Block[] = [
  [0, 0.44, 1, 0.07, "panel", 0.9],
  [-0.36, 0.44, 0.1, 0.035, "red"],
  [0, 0.26, 0.82, 0.06, "white"],
  [0, 0.18, 0.7, 0.06, "white"],
  [0, 0.09, 0.62, 0.025, "grey", 0.6],
  [0, -0.02, 0.6, 0.06, "red"],
  [0, -0.22, 0.86, 0.26, "gold", 0.28],
  [0, -0.42, 0.86, 0.08, "panel", 0.85],
];

const TONES = {
  white: new THREE.Color("#f4f4f4"),
  grey: new THREE.Color("#8a8a8a"),
  red: COLORS.red,
  gold: COLORS.gold,
  panel: new THREE.Color("#1a1a1d"),
};

export function createWebsiteScene(glowTexture: THREE.Texture): SceneModule {
  const root = new THREE.Group();
  root.position.z = WEBSITE_Z;
  const rand = seeded(7);
  const pieces: Piece[] = [];
  const unitPlane = new THREE.PlaneGeometry(1, 1);

  const frameMat = new THREE.MeshStandardMaterial({
    color: "#121214",
    metalness: 0.75,
    roughness: 0.32,
  });
  const screenMat = new THREE.MeshBasicMaterial({ color: "#070708" });

  function addPieces(
    parent: THREE.Object3D,
    blocks: Block[],
    w: number,
    h: number,
    z: number,
    order: number,
  ) {
    blocks.forEach(([x, y, bw, bh, tone, alpha = 1], i) => {
      const material = new THREE.MeshBasicMaterial({
        color: TONES[tone],
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(unitPlane, material);
      mesh.scale.set(bw * w, bh * h, 1);
      const rest = new THREE.Vector3(x * w, y * h, z + 0.002 * i);
      const from = rest
        .clone()
        .add(new THREE.Vector3((rand() - 0.5) * 2.2, (rand() - 0.5) * 1.6, 0.6 + rand() * 1.4));
      mesh.position.copy(from);
      parent.add(mesh);
      pieces.push({
        mesh,
        rest,
        from,
        delay: order * 0.06 + i * 0.035,
        material,
        maxOpacity: alpha,
      });
    });
  }

  // Monitor
  const monitor = new THREE.Group();
  monitor.position.set(0, 0.45, 0);
  monitor.add(new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.95, 0.08), frameMat));
  const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 1.8), screenMat.clone());
  monitorScreen.position.z = 0.042;
  monitor.add(monitorScreen);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.08), frameMat);
  neck.position.set(0, -1.2, -0.08);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.55), frameMat);
  foot.position.set(0, -1.5, 0);
  monitor.add(neck, foot);
  addPieces(monitor, DESKTOP, 3.14, 1.8, 0.05, 0);

  // Laptop
  const laptop = new THREE.Group();
  laptop.position.set(2.35, -0.85, 0.75);
  laptop.rotation.y = -0.46;
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 1.25), frameMat);
  laptop.add(base);
  const lid = new THREE.Group();
  lid.position.set(0, 0.025, -0.62);
  lid.rotation.x = -0.18;
  const lidBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, 0.04), frameMat);
  lidBody.position.y = 0.6;
  const lidScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.08), screenMat);
  lidScreen.position.set(0, 0.6, 0.021);
  lid.add(lidBody, lidScreen);
  const lidPieces = new THREE.Group();
  lidPieces.position.y = 0.6;
  lid.add(lidPieces);
  addPieces(lidPieces, LAPTOP, 1.78, 1.08, 0.03, 1);
  laptop.add(lid);

  // Phone
  const phone = new THREE.Group();
  phone.position.set(-0.3, -0.7, 2.05);
  phone.rotation.y = 0.12;
  phone.add(new THREE.Mesh(new THREE.BoxGeometry(0.64, 1.3, 0.06), frameMat));
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 1.2), screenMat);
  phoneScreen.position.z = 0.031;
  phone.add(phoneScreen);
  addPieces(phone, PHONE, 0.58, 1.2, 0.04, 2);

  root.add(monitor, laptop, phone);

  const glow = createGlowSprite(glowTexture, COLORS.red, 9);
  glow.position.set(0, 0.3, -1.4);
  root.add(glow);

  const key = new THREE.PointLight(COLORS.white, 0, 20, 2);
  key.position.set(1.5, 3, 4);
  const rim = new THREE.PointLight(COLORS.red, 0, 20, 2);
  rim.position.set(-3.5, 1, -1.5);
  root.add(key, rim);

  // Anchor points for the floating HTML labels.
  const anchors = [
    new THREE.Vector3(-0.7, 1.72, 0.3),
    new THREE.Vector3(1.85, 1.5, 0.4),
    new THREE.Vector3(-0.95, -1.55, 2.2),
    new THREE.Vector3(2.45, 0.35, 0.9),
  ];
  const world = new THREE.Vector3();
  const flyInScreen = monitorScreen.material as THREE.MeshBasicMaterial;
  const dark = new THREE.Color("#070708");

  return {
    object: root,
    update({ p, t, camera, labels, pointer }: FrameContext) {
      const presence = windowed(p, 0.15, 0.36, 0.02);
      root.visible = presence > 0;
      WEBSITE_LABELS.forEach((label) => labels.ensure(`web-${label}`, label, "tag"));
      if (!root.visible) {
        WEBSITE_LABELS.forEach((label) => labels.place(`web-${label}`, world, camera, 0));
        return;
      }

      const k = segment(p, 0.17, 0.34);
      key.intensity = 30 * presence;
      rim.intensity = 42 * presence;
      glow.material.opacity = 0.32 * presence;

      // Assembly: every UI block flies in from depth to its slot.
      const build = segment(p, 0.175, 0.28);
      for (const piece of pieces) {
        const local = easeOut(clamp01((build * 1.9 - piece.delay) / 0.55));
        piece.mesh.position.lerpVectors(piece.from, piece.rest, local);
        piece.material.opacity = local * piece.maxOpacity * presence;
      }

      const float = 1 - easeInOut(segment(p, 0.3, 0.345));
      monitor.position.y = 0.45 + Math.sin(t * 0.7) * 0.04 * float;
      laptop.position.y = -0.85 + Math.sin(t * 0.8 + 1.2) * 0.06 * float;
      phone.position.y = -0.7 + Math.sin(t * 0.9 + 2.1) * 0.07 * float;
      root.rotation.y = (pointer.x * 0.06 + Math.sin(t * 0.2) * 0.03) * float;
      root.rotation.x = -pointer.y * 0.03 * float;

      // Screen brightens as the camera dives into it, so entering reads as light.
      const dive = easeInOut(segment(p, 0.315, 0.35));
      flyInScreen.color.copy(dark).lerp(COLORS.white, dive * 0.85);

      const labelIn = windowed(p, 0.2, 0.31, 0.02) * (0.5 + 0.5 * k);
      WEBSITE_LABELS.forEach((label, i) => {
        const anchor = anchors[i];
        if (!anchor) return;
        world.copy(anchor).applyMatrix4(root.matrixWorld);
        const stagger = clamp01((segment(p, 0.2, 0.26) - i * 0.12) * 2.2);
        labels.place(`web-${label}`, world, camera, labelIn * stagger, i === 2 ? "red" : "");
      });
    },
    dispose() {
      unitPlane.dispose();
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry && mesh.geometry !== unitPlane) mesh.geometry.dispose();
      });
      pieces.forEach((piece) => piece.material.dispose());
      frameMat.dispose();
      screenMat.dispose();
      flyInScreen.dispose();
      glow.material.dispose();
    },
  };
}
