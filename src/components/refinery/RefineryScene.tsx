import { useEffect, useRef } from "react";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";
import { useMotionPaused } from "@/lib/motion-preference";

const DUST_COUNT = 600;
const ORE_X = 1.25;
const ORE_Y = 0.35;
const CAMERA_Z = 9.5;
const CHAPTERS = ["hero", "cut", "work", "services", "promise", "about", "finale"] as const;
type Chapter = (typeof CHAPTERS)[number];

type Target = {
  x: number;
  y: number;
  scale: number;
  dim: number;
  refine: number;
  spin: number;
  key: number;
  furnace: number;
  cameraZ: number;
};

type SceneController = {
  syncPaused: () => void;
};

const TARGETS: Record<Chapter, Target> = {
  hero: {
    x: ORE_X,
    y: ORE_Y,
    scale: 1,
    dim: 1,
    refine: 0,
    spin: 0.03,
    key: 2.2,
    furnace: 4.5,
    cameraZ: CAMERA_Z,
  },
  cut: {
    x: ORE_X,
    y: ORE_Y,
    scale: 0.8,
    dim: 0.35,
    refine: 0.5,
    spin: 0.01,
    key: 2,
    furnace: 3,
    cameraZ: CAMERA_Z,
  },
  work: {
    x: ORE_X + 0.3,
    y: ORE_Y,
    scale: 0.7,
    dim: 0.2,
    refine: 0.15,
    spin: 0.03,
    key: 0.9,
    furnace: 3,
    cameraZ: CAMERA_Z + 1.5,
  },
  services: {
    x: ORE_X,
    y: ORE_Y,
    scale: 0.9,
    dim: 0.55,
    refine: 0.35,
    spin: 0,
    key: 2.2,
    furnace: 2,
    cameraZ: CAMERA_Z,
  },
  promise: {
    x: 0.8,
    y: ORE_Y,
    scale: 1,
    dim: 0.9,
    refine: 0.55,
    spin: 0,
    key: 2.2,
    furnace: 2,
    cameraZ: CAMERA_Z,
  },
  about: {
    x: ORE_X,
    y: ORE_Y - 0.6,
    scale: 0.85,
    dim: 0.6,
    refine: 0.8,
    spin: 0.015,
    key: 1.6,
    furnace: 1,
    cameraZ: CAMERA_Z,
  },
  finale: {
    x: ORE_X,
    y: ORE_Y + 0.2,
    scale: 1,
    dim: 1,
    refine: 1,
    spin: 0.02,
    key: 2.6,
    furnace: 0,
    cameraZ: CAMERA_Z,
  },
};

function hash3(x: number, y: number, z: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function valueNoise3(x: number, y: number, z: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const fz = smooth(z - iz);
  const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
  const x00 = mix(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), fx);
  const x10 = mix(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), fx);
  const x01 = mix(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), fx);
  const x11 = mix(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), fx);
  return mix(mix(x00, x10, fy), mix(x01, x11, fy), fz) * 2 - 1;
}

export function RefineryScene() {
  const holder = useRef<HTMLDivElement | null>(null);
  const controller = useRef<SceneController | null>(null);
  const paused = useMotionPaused();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    controller.current?.syncPaused();
  }, [paused]);

  useEffect(() => {
    const mount = holder.current;
    if (!mount || window.innerWidth < 768 || !shouldRunHeavyEffects()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const initialise = async () => {
      const [THREE, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
      ]);
      if (disposed || !holder.current) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, -0.4, CAMERA_Z);
      camera.lookAt(0, ORE_Y, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.pointerEvents = "none";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      mount.appendChild(renderer.domElement);
      mount.classList.add("refinery-scene-webgl");
      document.documentElement.classList.add("refinery-webgl-active");

      const room = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environmentTarget = pmrem.fromScene(room);
      scene.environment = environmentTarget.texture;
      room.dispose();

      const oreGeometry = new THREE.IcosahedronGeometry(1.2, 6);
      const orePositions = oreGeometry.getAttribute("position");
      const normal = new THREE.Vector3();
      for (let index = 0; index < orePositions.count; index += 1) {
        normal
          .set(orePositions.getX(index), orePositions.getY(index), orePositions.getZ(index))
          .normalize();
        const octaveA = valueNoise3(normal.x * 2.4, normal.y * 2.4, normal.z * 2.4);
        const octaveB = valueNoise3(normal.x * 5.1 + 8, normal.y * 5.1, normal.z * 5.1) * 0.5;
        const displacement = (octaveA + octaveB) * 0.12;
        orePositions.setXYZ(
          index,
          orePositions.getX(index) + normal.x * displacement,
          orePositions.getY(index) + normal.y * displacement,
          orePositions.getZ(index) + normal.z * displacement,
        );
      }
      orePositions.needsUpdate = true;
      oreGeometry.computeVertexNormals();

      const oreUniforms = {
        uTime: { value: 0 },
        uRefine: { value: 0 },
        uVeinGlow: { value: 0.08 },
        uDim: { value: 1 },
      };
      const oreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1714,
        roughness: 0.85,
        metalness: 0,
        envMapIntensity: 1.15,
        clearcoat: 0.08,
      });
      oreMaterial.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, oreUniforms);
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vOrePosition;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOrePosition = position;");
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
uniform float uTime;
uniform float uRefine;
uniform float uVeinGlow;
uniform float uDim;
varying vec3 vOrePosition;
float oreHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float oreNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(oreHash(i), oreHash(i + vec3(1,0,0)), f.x), mix(oreHash(i + vec3(0,1,0)), oreHash(i + vec3(1,1,0)), f.x), f.y), mix(mix(oreHash(i + vec3(0,0,1)), oreHash(i + vec3(1,0,1)), f.x), mix(oreHash(i + vec3(0,1,1)), oreHash(i + vec3(1,1,1)), f.x), f.y), f.z) * 2.0 - 1.0;
}
float oreVeinMask() {
  float n = oreNoise(vOrePosition * 2.2) * 0.72 + oreNoise(vOrePosition * 4.4 + 7.3) * 0.28;
  float width = mix(0.035, 0.7, uRefine);
  float vein = 1.0 - smoothstep(width, width + 0.045, abs(n));
  return max(vein, smoothstep(0.72, 1.0, uRefine));
}`,
          )
          .replace(
            "#include <color_fragment>",
            `#include <color_fragment>
float oreMask = oreVeinMask();
diffuseColor.rgb = mix(vec3(0.0103, 0.0086, 0.0069), vec3(0.738, 0.491, 0.171), oreMask);`,
          )
          .replace(
            "#include <roughnessmap_fragment>",
            "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.85, 0.25, oreVeinMask());",
          )
          .replace(
            "#include <metalnessmap_fragment>",
            "#include <metalnessmap_fragment>\nmetalnessFactor = mix(0.0, 1.0, oreVeinMask());",
          )
          .replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.738, 0.491, 0.171) * oreVeinMask() * uVeinGlow;",
          )
          .replace(
            "#include <opaque_fragment>",
            "outgoingLight *= uDim;\n#include <opaque_fragment>",
          );
      };
      oreMaterial.customProgramCacheKey = () => "refinery-ore-v2-dim";

      const ore = new THREE.Mesh(oreGeometry, oreMaterial);
      ore.position.set(ORE_X, ORE_Y, 0);
      ore.rotation.set(-0.12, 0.35, -0.08);
      scene.add(ore);

      const keyLight = new THREE.DirectionalLight(0xffd9a0, 2.2);
      keyLight.position.set(-3, 4, 4);
      const furnaceLight = new THREE.PointLight(0xff3333, 4.5, 8, 2);
      furnaceLight.position.set(ORE_X, ORE_Y - 2.2, 1.1);
      const hemisphere = new THREE.HemisphereLight(0xf2eee6, 0x0a0a0a, 0.16);
      scene.add(keyLight, furnaceLight, hemisphere);

      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = 128;
      glowCanvas.height = 128;
      const glowContext = glowCanvas.getContext("2d");
      if (glowContext) {
        const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, "rgba(223,186,115,0.42)");
        gradient.addColorStop(0.35, "rgba(223,186,115,0.16)");
        gradient.addColorStop(1, "rgba(223,186,115,0)");
        glowContext.fillStyle = gradient;
        glowContext.fillRect(0, 0, 128, 128);
      }
      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      glowTexture.colorSpace = THREE.SRGBColorSpace;
      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xdfba73,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Sprite(glowMaterial);
      glow.position.set(ORE_X, ORE_Y, -1);
      glow.scale.set(4.7, 4.7, 1);
      scene.add(glow);

      const dustPositions = new Float32Array(DUST_COUNT * 3);
      const dustSeeds = new Float32Array(DUST_COUNT);
      for (let index = 0; index < DUST_COUNT; index += 1) {
        const index3 = index * 3;
        dustPositions[index3] = ORE_X + (Math.random() - 0.5) * 5.8;
        dustPositions[index3 + 1] = ORE_Y + (Math.random() - 0.5) * 4.4;
        dustPositions[index3 + 2] = (Math.random() - 0.5) * 3.2;
        dustSeeds[index] = Math.random();
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(dustSeeds, 1));
      const dustUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uDim: { value: 1 },
      };
      const dustMaterial = new THREE.ShaderMaterial({
        uniforms: dustUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `uniform float uTime; uniform float uPixelRatio; attribute float aSeed; varying float vAlpha; void main() { vec3 moved = position; moved.y += mod(uTime * (0.035 + aSeed * 0.08) + aSeed * 4.4, 4.4) - 2.2; moved.x += sin(uTime * 0.2 + aSeed * 31.4) * 0.12; vec4 mvPosition = modelViewMatrix * vec4(moved, 1.0); gl_PointSize = (1.0 + aSeed * 1.5) * uPixelRatio * (6.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition; vAlpha = 0.16 + aSeed * 0.19; }`,
        fragmentShader: `uniform float uDim; varying float vAlpha; void main() { float distanceToCentre = length(gl_PointCoord - vec2(0.5)); float alpha = (1.0 - smoothstep(0.12, 0.5, distanceToCentre)) * vAlpha * uDim; gl_FragColor = vec4(0.874, 0.729, 0.451, alpha); }`,
      });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);

      let framedOffset = 0;
      const resize = () => {
        const { width, height } = mount.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        framedOffset = width < 600 ? 0.5 - ORE_X : 0;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      let targetTiltX = 0;
      let targetTiltY = 0;
      const maxTilt = THREE.MathUtils.degToRad(2);
      const onPointerMove = (event: PointerEvent) => {
        targetTiltY = THREE.MathUtils.clamp(
          (event.clientX / window.innerWidth - 0.5) * maxTilt * 2,
          -maxTilt,
          maxTilt,
        );
        targetTiltX = THREE.MathUtils.clamp(
          (event.clientY / window.innerHeight - 0.5) * maxTilt * 2,
          -maxTilt,
          maxTilt,
        );
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      let activeChapter: Chapter = "hero";
      let seamRefine = 0.5;
      let serviceRotation: number | null = null;
      let serviceVelocity = 0;
      let footerVisible = false;
      let pressStartedAt: number | null = null;
      let elapsed = 0;
      let previousTime = performance.now();
      let frame = 0;
      let running = false;
      const current = { ...TARGETS.hero };

      const targetForChapter = () => TARGETS[activeChapter];
      const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
      const pressScale = (now: number) => {
        if (pressStartedAt === null) return 1;
        const progress = Math.min((now - pressStartedAt) / 420, 1);
        if (progress >= 1) {
          pressStartedAt = null;
          return 1;
        }
        return progress < 0.5 ? lerp(1, 0.96, progress * 2) : lerp(0.96, 1, (progress - 0.5) * 2);
      };

      const applyScene = (now: number, delta: number, snap = false) => {
        const target = targetForChapter();
        const targetRefine = activeChapter === "cut" ? seamRefine : target.refine;
        const amount = snap ? 1 : 1 - Math.pow(1 - 0.08, delta * 60);
        for (const key of [
          "x",
          "y",
          "scale",
          "dim",
          "spin",
          "key",
          "furnace",
          "cameraZ",
        ] as const)
          current[key] = lerp(current[key], target[key], amount);
        current.refine = lerp(current.refine, targetRefine, amount);
        const effectiveDim = footerVisible ? 0 : current.dim;
        ore.position.set(current.x + framedOffset, current.y, 0);
        ore.scale.setScalar(current.scale * pressScale(now));
        glow.position.set(current.x + framedOffset, current.y, -1);
        const glowSize = 4.7 * current.scale * effectiveDim;
        glow.scale.set(glowSize, glowSize, 1);
        glowMaterial.opacity = 0.42 * effectiveDim;
        furnaceLight.position.set(current.x + framedOffset, current.y - 2.2, 1.1);
        keyLight.intensity = current.key;
        furnaceLight.intensity = current.furnace;
        camera.position.z = current.cameraZ;
        camera.lookAt(0, ORE_Y, 0);
        oreUniforms.uRefine.value = current.refine;
        oreUniforms.uDim.value = effectiveDim;
        dustUniforms.uDim.value = effectiveDim;
        if (!snap) ore.rotation.y += delta * current.spin;
        if (activeChapter === "services" && serviceRotation !== null) {
          if (snap) ore.rotation.y = serviceRotation;
          else {
            const difference = Math.atan2(
              Math.sin(serviceRotation - ore.rotation.y),
              Math.cos(serviceRotation - ore.rotation.y),
            );
            serviceVelocity =
              (serviceVelocity + difference * Math.min(delta * 18, 1)) * Math.pow(0.6, delta * 60);
            ore.rotation.y += serviceVelocity;
          }
        }
        ore.rotation.x += (targetTiltX - ore.rotation.x) * (snap ? 1 : amount);
        ore.rotation.z += (-targetTiltY - ore.rotation.z) * (snap ? 1 : amount);
        oreUniforms.uTime.value = elapsed;
        oreUniforms.uVeinGlow.value =
          (0.07 + (Math.sin((elapsed / 6) * Math.PI * 2) * 0.5 + 0.5) * 0.08) * effectiveDim;
        dustUniforms.uTime.value = elapsed;
      };

      const renderStill = () => {
        applyScene(performance.now(), 0, true);
        renderer.render(scene, camera);
      };
      const render = (now: number) => {
        if (!running) return;
        const delta = Math.min((now - previousTime) / 1000, 0.05);
        previousTime = now;
        elapsed += delta;
        applyScene(now, delta);
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      const syncAnimation = () => {
        const shouldAnimate = !footerVisible && !document.hidden && !pausedRef.current;
        if (shouldAnimate && !running) {
          running = true;
          previousTime = performance.now();
          frame = requestAnimationFrame(render);
        } else if (!shouldAnimate && running) {
          running = false;
          cancelAnimationFrame(frame);
          renderStill();
        } else if (!shouldAnimate) renderStill();
      };
      controller.current = { syncPaused: syncAnimation };

      const setChapter = (chapter: Chapter) => {
        if (chapter === activeChapter) return;
        activeChapter = chapter;
        if (chapter === "finale") pressStartedAt = performance.now();
        if (pausedRef.current) renderStill();
        else syncAnimation();
      };
      const chapterElements = [
        ...document.querySelectorAll<HTMLElement>("[data-refinery-chapter]"),
      ];
      const detectChapter = () => {
        const centre = window.innerHeight / 2;
        const centred = chapterElements.find((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top <= centre && rect.bottom >= centre;
        });
        const chapter = centred?.dataset["refineryChapter"];
        if (chapter && CHAPTERS.includes(chapter as Chapter)) setChapter(chapter as Chapter);
      };
      let chapterDetectionFrame = 0;
      const scheduleChapterDetection = () => {
        if (chapterDetectionFrame) return;
        chapterDetectionFrame = requestAnimationFrame(() => {
          chapterDetectionFrame = 0;
          detectChapter();
        });
      };
      const chapterObserver = new IntersectionObserver(scheduleChapterDetection, {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      });
      chapterElements.forEach((element) => chapterObserver.observe(element));
      window.addEventListener("scroll", scheduleChapterDetection, { passive: true });

      const services = document.querySelector<HTMLElement>("#services");
      const updateServiceRotation = (event: Event) => {
        const row = (event.target as Element | null)?.closest<HTMLElement>("[data-refinery-row]");
        if (!row || !services?.contains(row)) return;
        const index = Number(row.dataset["refineryRow"] ?? 0);
        serviceRotation = index * ((Math.PI * 2) / 7);
        if (pausedRef.current) renderStill();
      };
      services?.addEventListener("pointerover", updateServiceRotation);

      const updateSeamRefine = (event: Event) => {
        const value = (event as CustomEvent<{ value?: number }>).detail?.value;
        if (typeof value !== "number" || !Number.isFinite(value)) return;
        seamRefine = THREE.MathUtils.clamp(value / 100, 0, 1);
        if (activeChapter === "cut" && pausedRef.current) renderStill();
      };
      window.addEventListener("refinery:seam", updateSeamRefine);

      const footer = document.querySelector<HTMLElement>("footer");
      const footerObserver = footer
        ? new IntersectionObserver(
            ([entry]) => {
              footerVisible = entry?.isIntersecting ?? false;
              syncAnimation();
            },
            { threshold: 0.01 },
          )
        : null;
      if (footer && footerObserver) footerObserver.observe(footer);
      const onVisibilityChange = () => syncAnimation();
      document.addEventListener("visibilitychange", onVisibilityChange);

      detectChapter();
      renderStill();
      syncAnimation();
      mount.classList.add("refinery-scene-ready");

      cleanup = () => {
        running = false;
        cancelAnimationFrame(frame);
        controller.current = null;
        cancelAnimationFrame(chapterDetectionFrame);
        chapterObserver.disconnect();
        footerObserver?.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener("scroll", scheduleChapterDetection);
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        services?.removeEventListener("pointerover", updateServiceRotation);
        window.removeEventListener("refinery:seam", updateSeamRefine);
        oreGeometry.dispose();
        oreMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        glowMaterial.dispose();
        glowTexture.dispose();
        environmentTarget.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
        mount.classList.remove("refinery-scene-ready", "refinery-scene-webgl");
        document.documentElement.classList.remove("refinery-webgl-active");
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === "function")
      idleHandle = idleWindow.requestIdleCallback(() => void initialise());
    else timeoutHandle = globalThis.setTimeout(() => void initialise(), 200);

    return () => {
      disposed = true;
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={holder}
      aria-hidden
      className="refinery-scene refinery-fixed-layer pointer-events-none fixed inset-0"
    />
  );
}
