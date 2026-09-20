import { useEffect, useRef } from "react";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";

const DUST_COUNT = 600;
const ORE_X = 1.25;
const ORE_Y = 0.35;

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

  useEffect(() => {
    const mount = holder.current;
    if (!mount || window.innerWidth < 768 || !shouldRunHeavyEffects()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const initialise = async () => {
      const [THREE, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
      ]);
      if (disposed || !holder.current) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08);

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(ORE_X, -0.4, 6);
      camera.lookAt(ORE_X, ORE_Y, 0);

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
      holder.current.appendChild(renderer.domElement);

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
          .replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nvOrePosition = position;",
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
uniform float uTime;
uniform float uRefine;
uniform float uVeinGlow;
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
  return mix(mix(mix(oreHash(i), oreHash(i + vec3(1,0,0)), f.x),
                 mix(oreHash(i + vec3(0,1,0)), oreHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(oreHash(i + vec3(0,0,1)), oreHash(i + vec3(1,0,1)), f.x),
                 mix(oreHash(i + vec3(0,1,1)), oreHash(i + vec3(1,1,1)), f.x), f.y), f.z) * 2.0 - 1.0;
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
            "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.85, 0.25, oreMask);",
          )
          .replace(
            "#include <metalnessmap_fragment>",
            "#include <metalnessmap_fragment>\nmetalnessFactor = mix(0.0, 1.0, oreMask);",
          )
          .replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.738, 0.491, 0.171) * oreMask * uVeinGlow;",
          );
      };
      oreMaterial.customProgramCacheKey = () => "refinery-ore-v1";

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
      const dustUniforms = { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } };
      const dustMaterial = new THREE.ShaderMaterial({
        uniforms: dustUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uPixelRatio;
          attribute float aSeed;
          varying float vAlpha;
          void main() {
            vec3 moved = position;
            moved.y += mod(uTime * (0.035 + aSeed * 0.08) + aSeed * 4.4, 4.4) - 2.2;
            moved.x += sin(uTime * 0.2 + aSeed * 31.4) * 0.12;
            vec4 mvPosition = modelViewMatrix * vec4(moved, 1.0);
            gl_PointSize = (1.0 + aSeed * 1.5) * uPixelRatio * (6.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = 0.16 + aSeed * 0.19;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          void main() {
            float distanceToCentre = length(gl_PointCoord - vec2(0.5));
            float alpha = (1.0 - smoothstep(0.12, 0.5, distanceToCentre)) * vAlpha;
            gl_FragColor = vec4(0.874, 0.729, 0.451, alpha);
          }
        `,
      });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);

      const resize = () => {
        const { width, height } = mount.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
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
        targetTiltY = THREE.MathUtils.clamp((event.clientX / window.innerWidth - 0.5) * maxTilt * 2, -maxTilt, maxTilt);
        targetTiltX = THREE.MathUtils.clamp((event.clientY / window.innerHeight - 0.5) * maxTilt * 2, -maxTilt, maxTilt);
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      let frame = 0;
      let running = false;
      let heroVisible = true;
      let elapsed = 0;
      let previousTime = performance.now();
      const render = (now: number) => {
        if (!running) return;
        const delta = Math.min((now - previousTime) / 1000, 0.05);
        previousTime = now;
        elapsed += delta;
        ore.rotation.y += delta * 0.03;
        ore.rotation.x += (targetTiltX - ore.rotation.x) * 0.06;
        ore.rotation.z += (-targetTiltY - ore.rotation.z) * 0.06;
        oreUniforms.uTime.value = elapsed;
        oreUniforms.uVeinGlow.value = 0.07 + (Math.sin((elapsed / 6) * Math.PI * 2) * 0.5 + 0.5) * 0.08;
        dustUniforms.uTime.value = elapsed;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      const syncAnimation = () => {
        const shouldAnimate = heroVisible && !document.hidden;
        if (shouldAnimate && !running) {
          running = true;
          previousTime = performance.now();
          frame = requestAnimationFrame(render);
        } else if (!shouldAnimate && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      };
      const hero = document.querySelector<HTMLElement>("[data-home-hero]");
      const intersectionObserver = hero
        ? new IntersectionObserver(([entry]) => {
            heroVisible = entry?.isIntersecting ?? false;
            syncAnimation();
          }, { threshold: 0.01 })
        : null;
      if (hero && intersectionObserver) intersectionObserver.observe(hero);
      const onVisibilityChange = () => syncAnimation();
      document.addEventListener("visibilitychange", onVisibilityChange);
      syncAnimation();
      requestAnimationFrame(() => mount.classList.add("refinery-scene-ready"));

      cleanup = () => {
        running = false;
        cancelAnimationFrame(frame);
        intersectionObserver?.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pointermove", onPointerMove);
        oreGeometry.dispose();
        oreMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        glowMaterial.dispose();
        glowTexture.dispose();
        environmentTarget.dispose();
        pmrem.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    };

    if ("requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(() => void initialise());
    } else {
      timeoutHandle = window.setTimeout(() => void initialise(), 200);
    }

    return () => {
      disposed = true;
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={holder} aria-hidden className="refinery-scene pointer-events-none absolute inset-0">
      <div className="refinery-ember absolute inset-0" />
    </div>
  );
}