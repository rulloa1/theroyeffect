import { useEffect, useRef, type ReactNode } from "react";
import { useClientReducedMotion } from "@/components/cinematic/useClientReducedMotion";
import { useMotionPaused } from "@/lib/motion-preference";

type MagneticProps = {
  children: ReactNode;
  className?: string;
};

export function Magnetic({ children, className = "" }: MagneticProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const latestPointer = useRef({ x: 0, y: 0 });
  const reduceMotion = useClientReducedMotion();
  const paused = useMotionPaused();

  useEffect(() => {
    const root = rootRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!root || !finePointer || reduceMotion || paused) {
      root?.style.removeProperty("--magnetic-x");
      root?.style.removeProperty("--magnetic-y");
      root?.style.removeProperty("--magnetic-label-x");
      root?.style.removeProperty("--magnetic-label-y");
      return;
    }

    const update = () => {
      frameRef.current = 0;
      const bounds = root.getBoundingClientRect();
      const pointer = latestPointer.current;
      const closestX = Math.max(bounds.left, Math.min(pointer.x, bounds.right));
      const closestY = Math.max(bounds.top, Math.min(pointer.y, bounds.bottom));
      const distance = Math.hypot(pointer.x - closestX, pointer.y - closestY);
      if (distance > 60) {
        root.dataset["magneticActive"] = "false";
        return;
      }

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const x = Math.max(-6, Math.min(6, (pointer.x - centerX) * 0.08));
      const y = Math.max(-6, Math.min(6, (pointer.y - centerY) * 0.08));
      root.style.setProperty("--magnetic-x", `${x}px`);
      root.style.setProperty("--magnetic-y", `${y}px`);
      root.style.setProperty("--magnetic-label-x", `${x / 2}px`);
      root.style.setProperty("--magnetic-label-y", `${y / 2}px`);
      root.dataset["magneticActive"] = "true";
    };

    const onPointerMove = (event: PointerEvent) => {
      latestPointer.current = { x: event.clientX, y: event.clientY };
      if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
    };
    const onPointerLeave = () => {
      root.dataset["magneticActive"] = "false";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, [paused, reduceMotion]);

  return (
    <span ref={rootRef} className={`magnetic inline-flex ${className}`} data-magnetic-active="false">
      {children}
    </span>
  );
}