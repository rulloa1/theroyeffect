import * as THREE from "three";
import { AUTOMATION_MODULES } from "../../content";
import { clamp01, easeBack, easeInOut, segment, windowed } from "../timeline";
import { NETWORK_Z } from "./AIScene";
import { COLORS, seeded, type FrameContext, type SceneModule } from "./shared";

type ModuleName = (typeof AUTOMATION_MODULES)[number];

// AI sits at the centre as the hub; everything else rings around it.
const LAYOUT: Record<ModuleName, [number, number]> = {
  AI: [0, 0],
  Website: [-3.3, 0.05],
  CRM: [-2.35, 1.75],
  Email: [0, 2.35],
  SMS: [2.35, 1.75],
  Calendar: [3.3, 0.05],
  Payments: [2.35, -1.75],
  Reviews: [0, -2.35],
  Reporting: [-2.35, -1.75],
};

// The order information moves: a website lead all the way to repeat business.
const FLOW: [ModuleName, ModuleName][] = [
  ["Website", "CRM"],
  ["CRM", "AI"],
  ["AI", "SMS"],
  ["SMS", "Calendar"],
  ["Calendar", "Email"],
  ["Calendar", "Payments"],
  ["Payments", "Reviews"],
  ["Reviews", "Reporting"],
  ["Reporting", "CRM"],
];

// Ring is scaled to sit in half the viewport, clear of the headline column.
const RING_SCALE = 0.74;
const PANEL_W = 1.14;
const PANEL_H = 0.52;

export function createAutomationScene(glowTexture: THREE.Texture): SceneModule {
  const root = new THREE.Group();
  root.position.z = NETWORK_Z;
  const rand = seeded(53);

  const panelGeometry = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
  const edgeGeometry = new THREE.EdgesGeometry(panelGeometry);

  const modules = AUTOMATION_MODULES.map((name, i) => {
    const [x, y] = LAYOUT[name];
    const group = new THREE.Group();
    const fill = new THREE.Mesh(
      panelGeometry,
      new THREE.MeshBasicMaterial({
        color: "#0d0d10",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    const border = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: COLORS.white, transparent: true, opacity: 0 }),
    );
    group.add(fill, border);
    root.add(group);
    const rest = new THREE.Vector3(x * RING_SCALE, y * RING_SCALE, 0);
    const from = new THREE.Vector3((rand() - 0.5) * 16, (rand() - 0.5) * 9, -2 - rand() * 6);
    const spin = new THREE.Euler((rand() - 0.5) * 1.6, (rand() - 0.5) * 2.2, (rand() - 0.5) * 1.2);
    return { name, group, fill, border, rest, from, spin, delay: i * 0.07 };
  });
  const byName = new Map(modules.map((m) => [m.name, m]));

  const edges = FLOW.map(([a, b]) => {
    const pa = byName.get(a)!.rest;
    const pb = byName.get(b)!.rest;
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    // Bow each connection gently toward the viewer so paths read as 3D.
    const control = mid
      .clone()
      .multiplyScalar(0.82)
      .add(new THREE.Vector3(0, 0, 0.9));
    const curve = new THREE.QuadraticBezierCurve3(pa, control, pb);
    const points = curve.getPoints(32);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: COLORS.red, transparent: true, opacity: 0 }),
    );
    root.add(line);
    return { from: a, to: b, curve, line, count: points.length };
  });

  const pulses = Array.from({ length: 6 }, () => {
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
    sprite.scale.setScalar(0.3);
    root.add(sprite);
    return sprite;
  });

  const world = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const grey = new THREE.Color("#5a5a60");
  const connected = new Set<ModuleName>();

  return {
    object: root,
    update({ p, t, camera, labels }: FrameContext) {
      const presence = windowed(p, 0.55, 0.745, 0.025);
      root.visible = presence > 0;
      AUTOMATION_MODULES.forEach((name) => labels.ensure(`auto-${name}`, name, "module"));
      if (!root.visible) {
        AUTOMATION_MODULES.forEach((name) => labels.place(`auto-${name}`, world, camera, 0));
        return;
      }

      // Disconnected systems SNAP into formation, staggered, with overshoot.
      const snap = segment(p, 0.56, 0.62);
      const connect = easeInOut(segment(p, 0.615, 0.69));
      const drawnEdges = connect * edges.length;

      connected.clear();
      edges.forEach((edge, i) => {
        const local = clamp01(drawnEdges - i);
        edge.line.geometry.setDrawRange(0, Math.max(2, Math.floor(edge.count * local)));
        (edge.line.material as THREE.LineBasicMaterial).opacity = local > 0 ? 0.85 * presence : 0;
        if (local > 0.98) {
          connected.add(edge.from);
          connected.add(edge.to);
        }
      });

      modules.forEach((m, i) => {
        const local = clamp01((snap * 1.65 - m.delay) / 0.45);
        const eased = easeBack(local);
        m.group.position.lerpVectors(m.from, m.rest, eased);
        m.group.position.y += Math.sin(t * 0.6 + i) * 0.03 * local;
        m.group.rotation.set(
          m.spin.x * (1 - eased),
          m.spin.y * (1 - eased),
          m.spin.z * (1 - eased),
        );

        const fillMat = m.fill.material as THREE.MeshBasicMaterial;
        const borderMat = m.border.material as THREE.LineBasicMaterial;
        fillMat.opacity = 0.92 * presence * clamp01(local * 1.5);
        // A brief flash the instant a module locks in.
        const landFlash = Math.max(0, 1 - Math.abs(local - 1) * 12) * (local >= 1 ? 1 : 0);
        const isOn = connected.has(m.name);
        const success = m.name === "Calendar" && isOn;
        borderMat.color.copy(success ? COLORS.gold : isOn ? COLORS.red : grey);
        borderMat.opacity = presence * clamp01(local) * (isOn ? 1 : 0.5) + landFlash * 0.4;

        world.copy(m.group.position).applyMatrix4(root.matrixWorld);
        labels.place(
          `auto-${m.name}`,
          world,
          camera,
          presence * windowed(p, 0.565, 0.72, 0.012) * clamp01(local * 1.4),
          success ? "gold" : isOn ? "red" : "",
        );
      });

      // Pulses follow the chain in order, only across edges already built.
      pulses.forEach((sprite, i) => {
        if (drawnEdges < 0.2) {
          sprite.material.opacity = 0;
          return;
        }
        const along = (t * 0.55 + (i * edges.length) / pulses.length) % Math.max(0.001, drawnEdges);
        const edge = edges[Math.floor(along)];
        if (!edge) return;
        edge.curve.getPoint(clamp01(along - Math.floor(along)), tmp);
        sprite.position.copy(tmp);
        sprite.material.opacity = 0.9 * presence;
      });
    },
    dispose() {
      panelGeometry.dispose();
      edgeGeometry.dispose();
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry !== panelGeometry && mesh.geometry !== edgeGeometry)
          mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose();
      });
    },
  };
}
