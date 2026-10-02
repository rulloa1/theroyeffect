import { useEffect, useRef } from "react";
import { useMotionPaused } from "@/lib/motion-preference";

type NeuralCanvasProps = {
  className?: string;
  /** Any CSS color. Defaults to the site's `--primary` token. */
  accentColor?: string;
};

type Particle = { x: number; y: number; vx: number; vy: number; dx: number; dy: number };
type Pulse = { a: number; b: number; t: number; speed: number; active: boolean };

const LINK = 190;
const LINK2 = LINK * LINK;
const REPEL = 250;
const REPEL2 = REPEL * REPEL;
const MAX_SPEED = 60; // px/s
const DRIFT = 12; // px/s base drift
const MAX_PULSES = 3;
const MAX_DT = 0.05; // s

/**
 * Decorative constellation that sits over the hero media and behind its
 * content. Pointer input is observed on the hero element; the canvas itself
 * never receives pointer events.
 */
export default function NeuralCanvas({ className = "hh-canvas", accentColor }: NeuralCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paused = useMotionPaused();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent =
      accentColor ||
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() ||
      "#ff3333";
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const pulses: Pulse[] = Array.from({ length: MAX_PULSES }, () => ({
      a: 0,
      b: 0,
      t: 0,
      speed: 0,
      active: false,
    }));
    let raf = 0;
    let last = 0;
    let visible = true;
    let still = paused || motionQuery.matches;
    let pointerX = 0;
    let pointerY = 0;
    let pointerOn = false;
    let rect = host.getBoundingClientRect();

    const seed = () => {
      const area = w * h;
      const desktop = w >= 768;
      const target = desktop ? 90 : 35;
      const scale = Math.min(1, area / (desktop ? 1440 * 900 : 390 * 800));
      const count = Math.max(18, Math.round(target * Math.max(0.5, scale)));
      particles = Array.from({ length: count }, () => {
        const ang = Math.random() * Math.PI * 2;
        const sp = DRIFT * (0.4 + Math.random() * 0.6);
        const dx = Math.cos(ang) * sp;
        const dy = Math.sin(ang) * sp;
        return { x: Math.random() * w, y: Math.random() * h, vx: dx, vy: dy, dx, dy };
      });
      pulses.forEach((p) => (p.active = false));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (!nw || !nh) return;
      const reseed = Math.abs(nw - w) > 80 || Math.abs(nh - h) > 160 || !particles.length;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rect = host.getBoundingClientRect();
      if (reseed) seed();
      else
        for (const p of particles) {
          p.x = Math.min(p.x, w);
          p.y = Math.min(p.y, h);
        }
      if (still) draw();
    };

    const spawnPulse = () => {
      const slot = pulses.find((p) => !p.active);
      if (!slot || !particles.length) return;
      const a = (Math.random() * particles.length) | 0;
      const pa = particles[a]!;
      for (let k = 0; k < particles.length; k++) {
        if (k === a) continue;
        const pb = particles[k]!;
        const ddx = pa.x - pb.x;
        const ddy = pa.y - pb.y;
        if (ddx * ddx + ddy * ddy < LINK2 * 0.6) {
          slot.a = a;
          slot.b = k;
          slot.t = 0;
          slot.speed = 0.6 + Math.random() * 0.5;
          slot.active = true;
          return;
        }
      }
    };

    const step = (dt: number) => {
      const repel = pointerOn && !coarse;
      for (const p of particles) {
        if (repel) {
          const ex = p.x - pointerX;
          const ey = p.y - pointerY;
          const d2 = ex * ex + ey * ey;
          if (d2 < REPEL2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / REPEL) * 220;
            p.vx += (ex / d) * force * dt;
            p.vy += (ey / d) * force * dt;
          }
        }
        // Ease back toward the particle's own drift velocity.
        const ease = Math.min(1, dt * 1.6);
        p.vx += (p.dx - p.vx) * ease;
        p.vy += (p.dy - p.vy) * ease;
        const sp2 = p.vx * p.vx + p.vy * p.vy;
        if (sp2 > MAX_SPEED * MAX_SPEED) {
          const k = MAX_SPEED / Math.sqrt(sp2);
          p.vx *= k;
          p.vy *= k;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
          p.dx = Math.abs(p.dx);
        } else if (p.x > w) {
          p.x = w;
          p.vx = -Math.abs(p.vx);
          p.dx = -Math.abs(p.dx);
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
          p.dy = Math.abs(p.dy);
        } else if (p.y > h) {
          p.y = h;
          p.vy = -Math.abs(p.vy);
          p.dy = -Math.abs(p.dy);
        }
      }
      if (Math.random() < dt * 0.35) spawnPulse();
      for (const pl of pulses) {
        if (!pl.active) continue;
        pl.t += dt * pl.speed;
        if (pl.t >= 1) pl.active = false;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 0.6;
      const n = particles.length;
      for (let i = 0; i < n; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < n; j++) {
          const b = particles[j]!;
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 >= LINK2) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (const p of particles) {
        ctx.moveTo(p.x + 1.3, p.y);
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
      }
      ctx.fill();
      if (!still) {
        for (const pl of pulses) {
          if (!pl.active) continue;
          const a = particles[pl.a];
          const b = particles[pl.b];
          if (!a || !b) continue;
          const x = a.x + (b.x - a.x) * pl.t;
          const y = a.y + (b.y - a.y) * pl.t;
          const fade = Math.sin(pl.t * Math.PI);
          ctx.globalAlpha = fade * 0.18;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = fade * 0.85;
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      if (still || !visible || document.hidden) return;
      const dt = last ? Math.min((now - last) / 1000, MAX_DT) : 0;
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (still) {
        draw();
        return;
      }
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerOn = true;
    };
    const clearPointer = () => {
      pointerOn = false;
    };
    const refreshRect = () => {
      rect = host.getBoundingClientRect();
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionChange = () => {
      still = paused || motionQuery.matches;
      stop();
      start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) {
        refreshRect();
        start();
      } else stop();
    });
    io.observe(host);

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", clearPointer, { passive: true });
    host.addEventListener("pointercancel", clearPointer, { passive: true });
    host.addEventListener("touchend", clearPointer, { passive: true });
    window.addEventListener("scroll", refreshRect, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", clearPointer);
      host.removeEventListener("pointercancel", clearPointer);
      host.removeEventListener("touchend", clearPointer);
      window.removeEventListener("scroll", refreshRect);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [paused, accentColor]);

  return <canvas ref={ref} className={className} aria-hidden="true" tabIndex={-1} />;
}
