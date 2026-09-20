import { useEffect, useRef, useState, type ReactNode } from "react";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";
import { useMotionPaused } from "@/lib/motion-preference";

export function ScrollReveal({
  children,
  className = "",
  respectEffectsGuard = false,
}: {
  children: ReactNode;
  className?: string;
  respectEffectsGuard?: boolean;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [staticReveal, setStaticReveal] = useState(false);
  const paused = useMotionPaused();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      reduceMotion ||
      paused ||
      (respectEffectsGuard && !shouldRunHeavyEffects()) ||
      typeof IntersectionObserver === "undefined"
    ) {
      setStaticReveal(true);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [paused, respectEffectsGuard]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${staticReveal ? "scroll-reveal-static" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
