import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * Mouse-tracked 3D tilt wrapper with a moving glare highlight.
 *
 * Rotation and glare position are written as CSS custom properties so the
 * transform itself lives in CSS (see `.tilt-3d` in styles.css). Touch pointers
 * are ignored and reduced-motion users get a flat card via the media query.
 */
export function Tilt3D({
  children,
  className = "",
  max = 7,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees on each axis. */
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const set = (rx: number, ry: number, gx: number, gy: number) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--gx", `${gx.toFixed(1)}%`);
      el.style.setProperty("--gy", `${gy.toFixed(1)}%`);
    });
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    set(-py * max, px * max, (px + 0.5) * 100, (py + 0.5) * 100);
  };

  const onPointerLeave = () => set(0, 0, 50, 50);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`tilt-3d ${className}`}
    >
      {children}
      {glare ? <span aria-hidden="true" className="tilt-glare" /> : null}
    </div>
  );
}
