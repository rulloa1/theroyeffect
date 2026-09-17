import * as THREE from "three";
import { createAIScene } from "./AIScene";
import { createAutomationScene } from "./AutomationScene";
import { createGrowthScene } from "./GrowthScene";
import { createLogoScene } from "./LogoScene";
import { createRevealScene } from "./RevealScene";
import { createWebsiteScene } from "./WebsiteScene";
import {
  COLORS,
  LabelLayer,
  createGlowTexture,
  seeded,
  type FrameContext,
  type SceneModule,
} from "./shared";
import type { Quality } from "./quality";
import {
  SCENE_ORDER,
  SCENE_RANGES,
  clamp01,
  easeInOut,
  lerp,
  segment,
  windowed,
  type SceneId,
} from "../timeline";

export interface StageOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  labelHost: HTMLElement;
  quality: Quality;
  emblemUrl: string;
}

export interface Stage {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  setActive(active: boolean): void;
  dispose(): void;
}

interface Keyframe {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
}

// The single camera path the whole story rides on. Cuts at 0.166→0.172 and
// 0.35→0.356 are hidden behind the portal and screen flashes in the HTML layer.
const CAMERA_PATH: Keyframe[] = [
  { p: 0, pos: [0, 0, 7.8], look: [0, 0, 0] },
  { p: 0.06, pos: [0, 0, 6.7], look: [0, 0, 0] },
  { p: 0.13, pos: [0, 0.02, 2.4], look: [0, 0.02, 0] },
  { p: 0.166, pos: [0, 0.02, 0.18], look: [0, 0.02, -1] },
  { p: 0.172, pos: [0, 0.6, -3.1], look: [0, 0.2, -12] },
  { p: 0.3, pos: [0.75, 0.45, -5.4], look: [0, 0.25, -12] },
  { p: 0.35, pos: [0, 0.45, -11.56], look: [0, 0.45, -12] },
  { p: 0.356, pos: [0, 0.25, -20.2], look: [0, 0, -30] },
  { p: 0.55, pos: [1.25, 0.35, -21.6], look: [0, 0, -30] },
  { p: 0.72, pos: [-1.1, 0.5, -20.4], look: [0, 0.3, -30] },
  { p: 0.87, pos: [0, 0.55, -17.4], look: [0, 0.55, -30] },
  { p: 1, pos: [0, 0.55, -17], look: [0, 0.55, -30] },
];

// Per-scene composition. Panning camera + target together moves the 3D subject
// on screen without changing its angle — this is what keeps objects clear of
// the headline. Desktop pushes subjects sideways; portrait pushes them down.
const FRAMING: Record<SceneId, { wide: [number, number]; tall: [number, number] }> = {
  arrival: { wide: [-1.1, -0.55], tall: [0, -1.25] },
  websites: { wide: [-1.2, 0.1], tall: [0, 1.9] },
  ai: { wide: [-0.7, -0.55], tall: [0, 1.7] },
  automation: { wide: [-2.15, 0.1], tall: [0, 1.45] },
  growth: { wide: [-2.4, 0], tall: [0, 1.9] },
  reveal: { wide: [0, -1.2], tall: [0, -2.2] },
};

// Extra camera distance on portrait screens for wide compositions (the AI
// workflow and the automation ring are laid out horizontally).
const TALL_ZOOM: Record<SceneId, number> = {
  arrival: 1,
  websites: 1,
  ai: 1.45,
  automation: 1.5,
  growth: 1,
  reveal: 1,
};

function sampleTallZoom(p: number) {
  let sum = 0;
  let total = 0;
  for (const id of SCENE_ORDER) {
    const [s, e] = SCENE_RANGES[id];
    const w = windowed(p, s, e, 0.03);
    if (w <= 0) continue;
    sum += TALL_ZOOM[id] * w;
    total += w;
  }
  return total > 0 ? sum / total : 1;
}

function sampleFraming(p: number, tall: boolean, out: THREE.Vector2) {
  out.set(0, 0);
  let total = 0;
  for (const id of SCENE_ORDER) {
    const [s, e] = SCENE_RANGES[id];
    const w = windowed(p, s, e, 0.03);
    if (w <= 0) continue;
    const [x, y] = FRAMING[id][tall ? "tall" : "wide"];
    out.x += x * w;
    out.y += y * w;
    total += w;
  }
  if (total > 0) out.multiplyScalar(1 / total);
}

const framing = new THREE.Vector2();
const posA = new THREE.Vector3();
const posB = new THREE.Vector3();
const lookA = new THREE.Vector3();
const lookB = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const offset = new THREE.Vector3();

function sampleCamera(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0;
  while (i < CAMERA_PATH.length - 2 && p > (CAMERA_PATH[i + 1]?.p ?? 1)) i++;
  const a = CAMERA_PATH[i]!;
  const b = CAMERA_PATH[i + 1] ?? a;
  const t = b.p === a.p ? 1 : easeInOut(clamp01((p - a.p) / (b.p - a.p)));
  posA.set(...a.pos);
  posB.set(...b.pos);
  lookA.set(...a.look);
  lookB.set(...b.look);
  outPos.lerpVectors(posA, posB, t);
  outLook.lerpVectors(lookA, lookB, t);
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

function createAmbientParticles(count: number) {
  const rand = seeded(11);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 30;
    positions[i * 3 + 1] = (rand() - 0.5) * 16;
    positions[i * 3 + 2] = 9 - rand() * 52;
    const roll = rand();
    const c = roll > 0.965 ? COLORS.gold : roll > 0.78 ? COLORS.red : COLORS.white;
    const dim = 0.35 + rand() * 0.65;
    colors[i * 3] = c.r * dim;
    colors[i * 3 + 1] = c.g * dim;
    colors[i * 3 + 2] = c.b * dim;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(geometry, material);
}

export async function createStage(options: StageOptions): Promise<Stage> {
  const { canvas, host, labelHost, quality, emblemUrl } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(COLORS.void, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.void, 0.03);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 80);
  scene.add(new THREE.AmbientLight(COLORS.white, 0.35));

  const image = await loadImage(emblemUrl);
  const emblemTexture = new THREE.Texture(image);
  emblemTexture.colorSpace = THREE.SRGBColorSpace;
  emblemTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  emblemTexture.needsUpdate = true;
  const glowTexture = createGlowTexture();

  const labels = new LabelLayer(labelHost);
  const ambient = createAmbientParticles(quality.ambientParticles);
  scene.add(ambient);

  const modules: SceneModule[] = [
    createLogoScene(emblemTexture, glowTexture),
    createWebsiteScene(glowTexture),
    createAIScene(glowTexture, quality.networkNodes),
    createAutomationScene(glowTexture),
    createGrowthScene(image, quality.growthPoints),
    createRevealScene(emblemTexture, glowTexture),
  ];
  modules.forEach((m) => scene.add(m.object));

  let dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
  let width = 1;
  let height = 1;

  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    labels.resize(width, height);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  let progress = 0;
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  let active = false;
  let raf = 0;
  let startTime = -1;
  let last = 0;
  let frameAccum = 0;
  let frameCount = 0;
  let avgFrame = 16;

  const ctx: FrameContext = {
    p: 0,
    t: 0,
    intro: 0,
    pointer,
    camera,
    labels,
    quality: { tier: quality.tier },
  };

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (startTime < 0) startTime = now;
    const t = (now - startTime) / 1000;
    const dt = last ? now - last : 16;
    last = now;

    // Adaptive resolution: if the GPU is struggling, trade pixels for frames.
    frameAccum += dt;
    frameCount++;
    if (frameCount >= 90) {
      avgFrame = frameAccum / frameCount;
      frameAccum = 0;
      frameCount = 0;
      if (avgFrame > 26 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        resize();
      }
    }

    const ease = Math.min(1, dt / 120);
    pointer.x += (pointerTarget.x - pointer.x) * ease;
    pointer.y += (pointerTarget.y - pointer.y) * ease;

    sampleCamera(progress, camera.position, lookTarget);
    // Portrait screens are narrower: back the camera off along its own line of sight.
    const aspect = camera.aspect;
    if (aspect < 1) {
      const narrow = clamp01((1 - aspect) / 0.5);
      const fit = lerp(1, 1.9, narrow) * lerp(1, sampleTallZoom(progress), narrow);
      offset.subVectors(camera.position, lookTarget).multiplyScalar(fit);
      camera.position.copy(lookTarget).add(offset);
    }
    sampleFraming(progress, aspect < 1, framing);
    // Keep portrait offsets proportional when the camera has been pulled back.
    if (aspect < 1) framing.multiplyScalar(sampleTallZoom(progress));
    // Recentre while flying *through* the R and the monitor, or the camera misses them.
    const dive = Math.max(
      easeInOut(segment(progress, 0.11, 0.155)) * (1 - segment(progress, 0.172, 0.2)),
      easeInOut(segment(progress, 0.3, 0.34)) * (1 - segment(progress, 0.356, 0.39)),
    );
    framing.multiplyScalar(1 - dive);
    camera.position.x += framing.x;
    camera.position.y += framing.y;
    lookTarget.x += framing.x;
    lookTarget.y += framing.y;
    if (quality.pointerParallax) {
      camera.position.x += pointer.x * 0.22;
      camera.position.y += pointer.y * 0.12;
    }
    camera.lookAt(lookTarget);
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();

    ctx.p = progress;
    ctx.t = t;
    ctx.intro = clamp01(t / 2.4);
    for (const m of modules) m.update(ctx);

    const particleMat = ambient.material as THREE.PointsMaterial;
    const dimForReveal = 1 - 0.7 * segment(progress, 0.86, 0.92);
    particleMat.opacity = 0.7 * ctx.intro * dimForReveal;
    ambient.rotation.z = t * 0.012;

    renderer.render(scene, camera);
  }

  function onVisibility() {
    setActiveInternal(active);
  }
  document.addEventListener("visibilitychange", onVisibility);

  function setActiveInternal(next: boolean) {
    active = next;
    const shouldRun = active && !document.hidden;
    if (shouldRun && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  return {
    setProgress(p) {
      progress = clamp01(p);
    },
    setPointer(x, y) {
      pointerTarget.x = x;
      pointerTarget.y = y;
    },
    setActive: setActiveInternal,
    dispose() {
      setActiveInternal(false);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      modules.forEach((m) => m.dispose());
      ambient.geometry.dispose();
      (ambient.material as THREE.Material).dispose();
      emblemTexture.dispose();
      glowTexture.dispose();
      labels.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
