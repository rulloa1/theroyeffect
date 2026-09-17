import * as THREE from "three";
import { createEmblem } from "./emblem";
import { COLORS, type FrameContext, type SceneModule } from "./shared";
import { easeInOut, easeOut, segment } from "../timeline";

/**
 * Scene 01 — the arrival. The emblem emerges from darkness, holds, then the
 * camera commits to the R and the R opens into a portal.
 */
export function createLogoScene(
  emblemTexture: THREE.Texture,
  glowTexture: THREE.Texture,
): SceneModule {
  const root = new THREE.Group();
  const emblem = createEmblem(emblemTexture, glowTexture);
  root.add(emblem.group);

  const redRim = new THREE.PointLight(COLORS.red, 0, 12, 2);
  redRim.position.set(-2.6, 1.4, -1.2);
  const goldKey = new THREE.PointLight(COLORS.gold, 0, 12, 2);
  goldKey.position.set(2.8, -1.8, 2.8);
  const fill = new THREE.PointLight(COLORS.white, 0, 10, 2);
  fill.position.set(0, 2.5, 4);
  root.add(redRim, goldKey, fill);

  return {
    object: root,
    update({ p, t, intro, pointer }: FrameContext) {
      const visible = p < 0.2;
      root.visible = visible;
      if (!visible) return;

      const emerge = easeOut(intro) * (1 - segment(p, 0.155, 0.172));
      emblem.setOpacity(emerge);
      emblem.setGlow(emerge * (0.75 + 0.25 * Math.sin(t * 1.3)));

      // Idle drift settles to face-on as the camera commits to the portal.
      const commit = easeInOut(segment(p, 0.07, 0.14));
      const drift = 1 - commit;
      emblem.body.rotation.y = (Math.sin(t * 0.32) * 0.2 + pointer.x * 0.18) * drift;
      emblem.body.rotation.x = (Math.sin(t * 0.23) * 0.08 - pointer.y * 0.12) * drift;
      emblem.group.position.y = Math.sin(t * 0.6) * 0.04 * drift;

      redRim.intensity = 38 * emerge;
      goldKey.intensity = 9 * emerge;
      fill.intensity = 5 * emerge;
      // A slow orbit of the red light makes the machined edge read as metal.
      redRim.position.x = -2.6 + Math.sin(t * 0.4) * 0.8;

      const portal = easeInOut(segment(p, 0.118, 0.166));
      emblem.portal.material.opacity = portal * 0.95;
      emblem.portal.scale.setScalar(0.35 + portal * 3.4);
      emblem.portal.rotation.z = t * 0.6;
    },
    dispose() {
      emblem.dispose();
    },
  };
}
