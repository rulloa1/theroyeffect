import * as THREE from "three";
import marlowDesktop from "@/assets/cut-after.webp.asset.json";
import marlowMobile from "@/assets/marlow-mobile.webp.asset.json";
import { WEBSITE_LABELS } from "../../content";
import { clamp01, easeInOut, easeOut, segment, windowed } from "../timeline";
import { COLORS, createGlowSprite, seeded, type FrameContext, type SceneModule } from "./shared";

export const WEBSITE_Z = -12;

interface Piece {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  from: THREE.Vector3;
  delay: number;
  /** Which device the block belongs to: 0 monitor, 1 laptop, 2 phone. */
  order: number;
  material: THREE.MeshBasicMaterial;
  maxOpacity: number;
}

/** A real screenshot laid over a device screen once its wireframe has assembled. */
interface Shot {
  order: number;
  material: THREE.MeshBasicMaterial;
  texture: THREE.Texture;
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

// A finished site on the screens: the Marlow & Sons redesign (concept study 01),
// desktop on the monitor and laptop, its mobile layout on the phone.
// width / height are the source image sizes, used to crop "cover"-style to the screen.
const SCREENS = [
  { src: marlowDesktop.url, width: 1440, height: 900 },
  { src: marlowDesktop.url, width: 1440, height: 900 },
  { src: marlowMobile.url, width: 780, height: 1600 },
] as const;

// Each device's wireframe resolves into its real screen once it has assembled,
// monitor first, a beat apart.
const REVEAL_START = 0.222;
const REVEAL_LENGTH = 0.033;
const REVEAL_STAGGER = 0.006;

export function createWebsiteScene(glowTexture: THREE.Texture): SceneModule {
  const root = new THREE.Group();
  root.position.z = WEBSITE_Z;
  const rand = seeded(7);
  const pieces: Piece[] = [];
  const shots: Shot[] = [];
  const unitPlane = new THREE.PlaneGeometry(1, 1);
  const loader = new THREE.TextureLoader();

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
        order,
        material,
        maxOpacity: alpha,
      });
    });
  }

  /** Lay a screenshot over a screen of w × h, cropped to fill it and anchored to the top. */
  function addShot(parent: THREE.Object3D, order: 0 | 1 | 2, w: number, h: number, z: number) {
    const screen = SCREENS[order];
    const texture = loader.load(screen.src);
    texture.colorSpace = THREE.SRGBColorSpace;
    const imageAspect = screen.width / screen.height;
    const screenAspect = w / h;
    if (imageAspect < screenAspect) {
      // Image is taller than the screen: keep the full width, show the top.
      const ry = imageAspect / screenAspect;
      texture.repeat.set(1, ry);
      texture.offset.set(0, 1 - ry);
    } else {
      // Image is wider than the screen: keep the full height, centre it.
      const rx = screenAspect / imageAspect;
      texture.repeat.set(rx, 1);
      texture.offset.set((1 - rx) / 2, 0);
    }
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.z = z;
    parent.add(mesh);
    shots.push({ order, material, texture });
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
  addShot(monitor, 0, 3.14, 1.8, 0.09);

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
  addShot(lidPieces, 1, 1.78, 1.08, 0.06);
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
  addShot(phone, 2, 0.58, 1.2, 0.06);

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
  const reveals = [0, 0, 0];

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

      // Screen brightens as the camera dives into it, so entering reads as light.
      const dive = easeInOut(segment(p, 0.315, 0.35));
      flyInScreen.color.copy(dark).lerp(COLORS.white, dive * 0.85);

      // Wireframe → real site, one device at a time.
      for (let i = 0; i < reveals.length; i++) {
        const start = REVEAL_START + i * REVEAL_STAGGER;
        reveals[i] = easeInOut(segment(p, start, start + REVEAL_LENGTH));
      }

      // Assembly: every UI block flies in from depth to its slot, then hands over to the screenshot.
      const build = segment(p, 0.175, 0.28);
      for (const piece of pieces) {
        const local = easeOut(clamp01((build * 1.9 - piece.delay) / 0.55));
        piece.mesh.position.lerpVectors(piece.from, piece.rest, local);
        const handOver = 1 - (reveals[piece.order] ?? 0);
        piece.material.opacity = local * piece.maxOpacity * presence * handOver;
      }
      for (const shot of shots) {
        // The monitor's screenshot gives way to the brightening screen during the dive.
        const diveOut = shot.order === 0 ? 1 - dive : 1;
        shot.material.opacity = (reveals[shot.order] ?? 0) * presence * diveOut;
      }

      const float = 1 - easeInOut(segment(p, 0.3, 0.345));
      monitor.position.y = 0.45 + Math.sin(t * 0.7) * 0.04 * float;
      laptop.position.y = -0.85 + Math.sin(t * 0.8 + 1.2) * 0.06 * float;
      phone.position.y = -0.7 + Math.sin(t * 0.9 + 2.1) * 0.07 * float;
      root.rotation.y = (pointer.x * 0.06 + Math.sin(t * 0.2) * 0.03) * float;
      root.rotation.x = -pointer.y * 0.03 * float;

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
      shots.forEach((shot) => {
        shot.texture.dispose();
        shot.material.dispose();
      });
      frameMat.dispose();
      screenMat.dispose();
      flyInScreen.dispose();
      glow.material.dispose();
    },
  };
}
