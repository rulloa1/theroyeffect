import * as THREE from "three";
import { easeInOut, easeOut, lerp, segment } from "../timeline";
import { createEmblem } from "./emblem";
import { EMBLEM_ANCHOR } from "./GrowthScene";
import { COLORS, type FrameContext, type SceneModule } from "./shared";

/**
 * Scene 06 — the reveal. The complete emblem resolves where the R formed,
 * a red light sweeps across its machined edge, and everything else is dark.
 */
export function createRevealScene(
  emblemTexture: THREE.Texture,
  glowTexture: THREE.Texture,
): SceneModule {
  const root = new THREE.Group();
  root.position.copy(EMBLEM_ANCHOR);
  const emblem = createEmblem(emblemTexture, glowTexture);
  root.add(emblem.group);

  const sweep = new THREE.PointLight(COLORS.red, 0, 14, 2);
  sweep.position.set(-6, 0.6, 2.2);
  const gold = new THREE.PointLight(COLORS.gold, 0, 12, 2);
  gold.position.set(2.5, -2, 3);
  root.add(sweep, gold);

  return {
    object: root,
    update({ p, t, pointer }: FrameContext) {
      const appear = easeOut(segment(p, 0.81, 0.875));
      root.visible = appear > 0.001;
      if (!root.visible) return;

      emblem.setOpacity(appear);
      emblem.setGlow(appear * (0.6 + 0.4 * easeInOut(segment(p, 0.9, 0.97))));

      const sweepT = easeInOut(segment(p, 0.895, 0.95));
      sweep.position.x = lerp(-6, 6, sweepT);
      sweep.intensity = 70 * Math.sin(Math.PI * sweepT) + 14 * appear;
      gold.intensity = 7 * appear;

      const settle = segment(p, 0.9, 1);
      emblem.body.rotation.y = Math.sin(t * 0.3) * 0.12 * (0.4 + 0.6 * settle) + pointer.x * 0.1;
      emblem.body.rotation.x = -pointer.y * 0.06;
      emblem.group.position.y = Math.sin(t * 0.55) * 0.03;
      emblem.portal.material.opacity = 0;
    },
    dispose() {
      emblem.dispose();
    },
  };
}
