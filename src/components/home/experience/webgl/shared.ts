import * as THREE from "three";

export const COLORS = {
  void: new THREE.Color("#050505"),
  red: new THREE.Color("#ff3333"),
  gold: new THREE.Color("#dfba73"),
  white: new THREE.Color("#ffffff"),
};

/** Soft radial sprite used for glows and data pulses — a cheap stand-in for bloom. */
export function createGlowTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGlowSprite(texture: THREE.Texture, color: THREE.Color, scale: number) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0,
    fog: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(scale);
  return sprite;
}

/** Deterministic PRNG so layouts are identical on every load. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface FrameContext {
  /** Global scroll progress, 0–1. */
  p: number;
  /** Seconds since the stage started. */
  t: number;
  /** 0→1 time-based entrance, so the first screen is never blank waiting for a scroll. */
  intro: number;
  /** Smoothed pointer, -1…1 on each axis (0 on touch devices). */
  pointer: { x: number; y: number };
  camera: THREE.PerspectiveCamera;
  labels: LabelLayer;
  quality: { tier: "high" | "low" };
}

export interface SceneModule {
  object: THREE.Object3D;
  update(ctx: FrameContext): void;
  dispose(): void;
}

const tmp = new THREE.Vector3();

/**
 * HTML labels pinned to 3D positions. Text stays crisp, selectable and
 * translatable; only its screen position comes from the camera.
 */
export class LabelLayer {
  private readonly nodes = new Map<string, HTMLElement>();
  private width = 1;
  private height = 1;

  constructor(private readonly host: HTMLElement) {}

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  ensure(id: string, text: string, variant: "tag" | "node" | "module" = "tag") {
    let el = this.nodes.get(id);
    if (!el) {
      el = document.createElement("span");
      el.className = `xp-label xp-label--${variant}`;
      el.textContent = text;
      el.style.opacity = "0";
      this.host.appendChild(el);
      this.nodes.set(id, el);
    }
    return el;
  }

  place(id: string, world: THREE.Vector3, camera: THREE.Camera, opacity: number, accent = "") {
    const el = this.nodes.get(id);
    if (!el) return;
    if (opacity <= 0.001) {
      if (el.style.opacity !== "0") el.style.opacity = "0";
      return;
    }
    tmp.copy(world).project(camera);
    if (tmp.z > 1 || tmp.z < -1) {
      el.style.opacity = "0";
      return;
    }
    const x = (tmp.x * 0.5 + 0.5) * this.width;
    const y = (-tmp.y * 0.5 + 0.5) * this.height;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    el.style.opacity = opacity.toFixed(3);
    if (el.dataset["accent"] !== accent) el.dataset["accent"] = accent;
  }

  dispose() {
    this.nodes.forEach((el) => el.remove());
    this.nodes.clear();
  }
}
