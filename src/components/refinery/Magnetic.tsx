import { useEffect, useRef, type ReactNode } from "react";
import { useClientReducedMotion } from "@/components/cinematic/useClientReducedMotion";
import { useMotionPaused } from "@/lib/motion-preference";

type MagneticProps = {
  children: ReactNode;
  className?: string;
};

type PointerPosition = { x: number; y: number };
type PointerSubscriber = (pointer: PointerPosition | null) => void;

const pointerSubscribers = new Set<PointerSubscriber>();
let sharedFrame = 0;
let latestPointer: PointerPosition = { x: 0, y: 0 };

function notifyPointerSubscribers() {
  sharedFrame = 0;
  pointerSubscribers.forEach((subscriber) => subscriber(latestPointer));
}

function onSharedPointerMove(event: PointerEvent) {
  latestPointer = { x: event.clientX, y: event.clientY };
  if (!sharedFrame) sharedFrame = requestAnimationFrame(notifyPointerSubscribers);
}

function onSharedPointerLeave() {
  pointerSubscribers.forEach((subscriber) => subscriber(null));
}

function subscribeToPointer(subscriber: PointerSubscriber) {
  if (pointerSubscribers.size === 0) {
    window.addEventListener("pointermove", onSharedPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onSharedPointerLeave);
  }
  pointerSubscribers.add(subscriber);
  return () => {
    pointerSubscribers.delete(subscriber);
    if (pointerSubscribers.size === 0) {
      window.removeEventListener("pointermove", onSharedPointerMove);
      document.documentElement.removeEventListener("pointerleave", onSharedPointerLeave);
      cancelAnimationFrame(sharedFrame);
      sharedFrame = 0;
    }
  };
}

export function Magnetic({ children, className = "" }: MagneticProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
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

    const reset = () => {
      root.style.setProperty("--magnetic-x", "0px");
      root.style.setProperty("--magnetic-y", "0px");
      root.style.setProperty("--magnetic-label-x", "0px");
      root.style.setProperty("--magnetic-label-y", "0px");
      root.dataset["magneticActive"] = "false";
    };
    const update = (pointer: PointerPosition | null) => {
      if (!pointer) {
        reset();
        return;
      }
      const bounds = root.getBoundingClientRect();
      const closestX = Math.max(bounds.left, Math.min(pointer.x, bounds.right));
      const closestY = Math.max(bounds.top, Math.min(pointer.y, bounds.bottom));
      const distance = Math.hypot(pointer.x - closestX, pointer.y - closestY);
      if (distance > 60) {
        reset();
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

    return subscribeToPointer(update);
  }, [paused, reduceMotion]);

  return (
    <span
      ref={rootRef}
      className={`magnetic inline-flex ${className}`}
      data-magnetic-active="false"
    >
      {children}
    </span>
  );
}
