import * as THREE from "three";
import { AI_WORKFLOW } from "../../content";
import { clamp01, easeInOut, easeOut, lerp, segment, windowed } from "../timeline";
import { COLORS, seeded, type FrameContext, type SceneModule } from "./shared";

export const NETWORK_Z = -30;

/**
 * Scene 03 — AI. A lead travels a six-step path; each step lights as it is
 * reached. Behind it, a quiet network gains connections and settles into
 * order — capability being organised, not a hacker screensaver.
 */
export function createAIScene(glowTexture: THREE.Texture, nodeCount: number): SceneModule {
  const root = new THREE.Group();
  root.position.z = NETWORK_Z;
  const rand = seeded(31);

  // Workflow path — a gentle diagonal S, read top-left to bottom-right.
  const stepPositions = AI_WORKFLOW.map((_, i) => {
    const u = i / (AI_WORKFLOW.length - 1);
    return new THREE.Vector3(
      lerp(-3.4, 3.4, u),
      lerp(1.55, -1.55, u) + Math.sin(u * Math.PI * 2) * 0.35,
      Math.sin(u * 5) * 0.4,
    );
  });
  const curve = new THREE.CatmullRomCurve3(stepPositions, false, "centripetal");
  const curvePoints = curve.getPoints(180);
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const basePath = new THREE.Line(
    pathGeometry,
    new THREE.LineBasicMaterial({ color: COLORS.white, transparent: true, opacity: 0 }),
  );
  const livePath = new THREE.Line(
    pathGeometry.clone(),
    new THREE.LineBasicMaterial({ color: COLORS.red, transparent: true, opacity: 0 }),
  );
  root.add(basePath, livePath);

  const nodeGeometry = new THREE.IcosahedronGeometry(0.12, 2);
  const haloGeometry = new THREE.RingGeometry(0.2, 0.216, 64);
  const steps = stepPositions.map((position, i) => {
    const isFinal = i === stepPositions.length - 1;
    const core = new THREE.Mesh(
      nodeGeometry,
      new THREE.MeshBasicMaterial({ color: COLORS.white, transparent: true, opacity: 0 }),
    );
    const halo = new THREE.Mesh(
      haloGeometry,
      new THREE.MeshBasicMaterial({
        color: isFinal ? COLORS.gold : COLORS.red,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    core.position.copy(position);
    halo.position.copy(position);
    root.add(core, halo);
    return { core, halo, isFinal };
  });

  // Data pulses riding the lit portion of the path.
  const pulses = Array.from({ length: 5 }, () => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: COLORS.red,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      }),
    );
    sprite.scale.setScalar(0.34);
    root.add(sprite);
    return sprite;
  });

  // Background network: scattered at first, organising into layered columns.
  const scattered: THREE.Vector3[] = [];
  const organised: THREE.Vector3[] = [];
  const columns = 7;
  for (let i = 0; i < nodeCount; i++) {
    scattered.push(new THREE.Vector3((rand() - 0.5) * 12, (rand() - 0.5) * 6.5, -1.5 - rand() * 4));
    const col = i % columns;
    const row = Math.floor(i / columns);
    const rows = Math.ceil(nodeCount / columns);
    organised.push(
      new THREE.Vector3(
        lerp(-5.4, 5.4, col / (columns - 1)),
        lerp(2.6, -2.6, rows > 1 ? row / (rows - 1) : 0.5),
        -3.2,
      ),
    );
  }
  const pairs: [number, number][] = [];
  for (let a = 0; a < nodeCount; a++) {
    for (let b = a + 1; b < nodeCount; b++) {
      const pa = organised[a];
      const pb = organised[b];
      if (pa && pb && pa.distanceTo(pb) < 2.3) pairs.push([a, b]);
    }
  }
  // Shuffle so connections appear across the whole field, not row by row.
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = pairs[i];
    const other = pairs[j];
    if (tmp && other) {
      pairs[i] = other;
      pairs[j] = tmp;
    }
  }

  const nodePositions = new Float32Array(nodeCount * 3);
  const netPoints = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(nodePositions, 3),
    ),
    new THREE.PointsMaterial({
      color: COLORS.white,
      size: 0.07,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  const linkPositions = new Float32Array(pairs.length * 6);
  const linkGeometry = new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.BufferAttribute(linkPositions, 3),
  );
  const links = new THREE.LineSegments(
    linkGeometry,
    new THREE.LineBasicMaterial({
      color: COLORS.white,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  root.add(netPoints, links);

  const current = scattered.map((v) => v.clone());
  const world = new THREE.Vector3();

  return {
    object: root,
    update({ p, t, camera, labels }: FrameContext) {
      // Visible through AI, then handed over to the automation scene.
      const presence = windowed(p, 0.35, 0.585, 0.025);
      root.visible = presence > 0;
      AI_WORKFLOW.forEach((step) => labels.ensure(`ai-${step}`, step, "node"));
      if (!root.visible) {
        AI_WORKFLOW.forEach((step) => labels.place(`ai-${step}`, world, camera, 0));
        return;
      }
      const k = segment(p, 0.36, 0.54);

      // Path draws itself as the lead progresses.
      const draw = easeInOut(segment(p, 0.37, 0.52));
      const drawn = Math.max(2, Math.floor(curvePoints.length * draw));
      livePath.geometry.setDrawRange(0, drawn);
      (basePath.material as THREE.LineBasicMaterial).opacity = 0.14 * presence;
      (livePath.material as THREE.LineBasicMaterial).opacity = 0.9 * presence;

      steps.forEach((step, i) => {
        const reachedAt = i / (steps.length - 1);
        const reached = draw >= reachedAt - 0.001;
        const pop = easeOut(clamp01((draw - reachedAt + 0.08) / 0.08));
        const coreMat = step.core.material as THREE.MeshBasicMaterial;
        const haloMat = step.halo.material as THREE.MeshBasicMaterial;
        coreMat.opacity = presence * (0.35 + 0.65 * pop);
        coreMat.color.copy(reached ? (step.isFinal ? COLORS.gold : COLORS.red) : COLORS.white);
        const pulse = reached ? 1 + Math.sin(t * 2.4 + i) * 0.08 : 1;
        step.halo.scale.setScalar((0.6 + 0.4 * pop) * pulse * (step.isFinal && reached ? 1.25 : 1));
        haloMat.opacity = presence * pop * (step.isFinal ? 0.95 : 0.7);
        step.halo.quaternion.copy(camera.quaternion);

        world.copy(step.core.position).applyMatrix4(root.matrixWorld);
        world.y += 0.36;
        const labelOpacity = presence * windowed(p, 0.375, 0.545, 0.015) * (0.45 + 0.55 * pop);
        labels.place(
          `ai-${AI_WORKFLOW[i]}`,
          world,
          camera,
          labelOpacity,
          reached ? (step.isFinal ? "gold" : "red") : "",
        );
      });

      pulses.forEach((sprite, i) => {
        const u = ((t * 0.16 + i / pulses.length) % 1) * draw;
        curve.getPointAt(Math.min(0.999, u), sprite.position);
        sprite.material.opacity = presence * (draw > 0.04 ? 0.85 : 0);
      });

      // Network: organise and multiply.
      const organise = easeInOut(segment(p, 0.4, 0.54));
      for (let i = 0; i < nodeCount; i++) {
        const s = scattered[i];
        const o = organised[i];
        const c = current[i];
        if (!s || !o || !c) continue;
        c.lerpVectors(s, o, organise);
        c.y += Math.sin(t * 0.5 + i) * 0.03;
        nodePositions[i * 3] = c.x;
        nodePositions[i * 3 + 1] = c.y;
        nodePositions[i * 3 + 2] = c.z;
      }
      netPoints.geometry.attributes["position"]!.needsUpdate = true;
      (netPoints.material as THREE.PointsMaterial).opacity = 0.55 * presence;

      const visibleLinks = Math.floor(pairs.length * easeOut(segment(p, 0.38, 0.55)));
      for (let n = 0; n < visibleLinks; n++) {
        const pair = pairs[n];
        if (!pair) continue;
        const a = current[pair[0]];
        const b = current[pair[1]];
        if (!a || !b) continue;
        const o = n * 6;
        linkPositions[o] = a.x;
        linkPositions[o + 1] = a.y;
        linkPositions[o + 2] = a.z;
        linkPositions[o + 3] = b.x;
        linkPositions[o + 4] = b.y;
        linkPositions[o + 5] = b.z;
      }
      links.geometry.setDrawRange(0, visibleLinks * 2);
      links.geometry.attributes["position"]!.needsUpdate = true;
      (links.material as THREE.LineBasicMaterial).opacity = (0.05 + 0.08 * k) * presence;
    },
    dispose() {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose();
      });
      nodeGeometry.dispose();
      haloGeometry.dispose();
    },
  };
}
