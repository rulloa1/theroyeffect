import { useEffect, useRef, type ReactNode } from "react";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";
import { getMotionPaused, subscribeMotionPreference } from "@/lib/motion-preference";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  max?: number;
  /** How far inner `[data-tilt-layer]` content lifts toward the viewer, in px. */
  lift?: number;
}

/**
 * Pointer-driven 3D tilt. The wrapper gets the perspective; the inner element
 * rotates, and any descendant marked `data-tilt-layer` lifts on the Z axis so
 * the card reads as layered depth rather than a flat spinning plane.
 *
 * Inert for bots/headless, coarse pointers, reduced-motion users, and whenever
 * the visitor has paused motion — the card simply renders flat.
 */
export function Tilt3D({ children, className, max = 7, lift = 18 }: Tilt3DProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!shouldRunHeavyEffects()) return;

    const inner = root.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-tilt-layer]"));

    let enabled = !getMotionPaused();
    let raf = 0;
    let hovering = false;
    const target = { rx: 0, ry: 0 };
    const current = { rx: 0, ry: 0 };

    const apply = () => {
      raf = 0;
      current.rx += (target.rx - current.rx) * 0.14;
      current.ry += (target.ry - current.ry) * 0.14;
      const settled =
        Math.abs(current.rx - target.rx) < 0.02 && Math.abs(current.ry - target.ry) < 0.02;
      // Easing only approaches the target, so snap once close — otherwise a
      // released card never reaches exactly 0 and keeps its lift forever.
      if (settled) {
        current.rx = target.rx;
        current.ry = target.ry;
      }
      if (!enabled || (!hovering && settled && current.rx === 0 && current.ry === 0)) {
        inner.style.transform = "";
        for (const layer of layers) layer.style.transform = "";
        return;
      }
      inner.style.transform = `rotateX(${current.rx.toFixed(3)}deg) rotateY(${current.ry.toFixed(3)}deg)`;
      for (const layer of layers) {
        layer.style.transform = `translateZ(${lift}px)`;
      }
      if (!settled) raf = requestAnimationFrame(apply);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      if (!enabled) return;
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      target.ry = px * max * 2;
      target.rx = -py * max * 2;
      hovering = true;
      schedule();
    };
    const onLeave = () => {
      hovering = false;
      target.rx = 0;
      target.ry = 0;
      schedule();
    };

    const unsubscribe = subscribeMotionPreference(() => {
      enabled = !getMotionPaused();
      if (!enabled) {
        target.rx = 0;
        target.ry = 0;
        current.rx = 0;
        current.ry = 0;
        inner.style.transform = "";
        for (const layer of layers) layer.style.transform = "";
      }
    });

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      unsubscribe();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max, lift]);

  return (
    <div ref={rootRef} className={`tilt3d ${className ?? ""}`}>
      {children}
    </div>
  );
}
