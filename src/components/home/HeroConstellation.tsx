import { useEffect, useRef } from "react";
import { useMotionPaused } from "@/lib/motion-preference";

type Node = { x: number; y: number; vx: number; vy: number };

/** Decorative node constellation. Never captures pointer input. */
export default function HeroConstellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const paused = useMotionPaused();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData || navigator.webdriver) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#ff3333";
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let visible = true;
    let pulse = { a: -1, b: -1, t: 0 };
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    const tick = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      const max = 130;
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          const d = Math.sqrt(d2) || 1;
          n.vx += (dx / d) * 0.05;
          n.vy += (dy / d) * 0.05;
        }
        n.vx *= 0.985;
        n.vy *= 0.985;
        n.x += n.vx + (Math.random() - 0.5) * 0.04;
        n.y += n.vy + (Math.random() - 0.5) * 0.04;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.strokeStyle = accent;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < max) {
            ctx.globalAlpha = (1 - d / max) * 0.18;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      if (pulse.t <= 0 && Math.random() < 0.006) {
        const a = Math.floor(Math.random() * nodes.length);
        let best = -1;
        let bd = max;
        nodes.forEach((n, k) => {
          const d = Math.hypot(n.x - nodes[a]!.x, n.y - nodes[a]!.y);
          if (k !== a && d < bd) {
            bd = d;
            best = k;
          }
        });
        if (best >= 0) pulse = { a, b: best, t: 1 };
      }
      if (pulse.t > 0) {
        const a = nodes[pulse.a]!;
        const b = nodes[pulse.b]!;
        const p = 1 - pulse.t;
        ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p, 2, 0, Math.PI * 2);
        ctx.fill();
        pulse.t -= 0.02;
      }
      ctx.fillStyle = accent;
      for (const n of nodes) {
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden) start();
    };
    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused]);

  return <canvas ref={ref} className="hh-canvas" aria-hidden="true" />;
}
