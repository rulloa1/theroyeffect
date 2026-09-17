import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], [data-cursor='hover']";

/**
 * Desktop-only cursor: a dot that tracks exactly and a ring that trails.
 * Expands over interactive elements; `[data-magnetic]` elements lean toward
 * the pointer. Disabled for touch, coarse pointers and reduced motion.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.documentElement.classList.add("has-home-cursor");
    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    let magnet: HTMLElement | null = null;

    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      const settled = Math.abs(target.x - ringPos.x) < 0.1 && Math.abs(target.y - ringPos.y) < 0.1;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const releaseMagnet = () => {
      if (magnet) {
        magnet.style.transform = "";
        magnet = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      root.dataset["visible"] = "true";
      if (!raf) raf = requestAnimationFrame(tick);

      const el = e.target instanceof Element ? e.target : null;
      root.dataset["state"] = el?.closest(INTERACTIVE) ? "hover" : "default";

      const magnetic = el?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnetic !== magnet) releaseMagnet();
      if (magnetic) {
        magnet = magnetic;
        const r = magnetic.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        magnetic.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    };
    const onLeave = () => {
      root.dataset["visible"] = "false";
      releaseMagnet();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      releaseMagnet();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-home-cursor");
    };
  }, []);

  return (
    <div ref={rootRef} className="home-cursor" aria-hidden="true" data-visible="false">
      <div ref={dotRef} className="home-cursor-dot" />
      <div ref={ringRef} className="home-cursor-ring" />
    </div>
  );
}
