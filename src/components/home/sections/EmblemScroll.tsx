import { useEffect, useRef, useState } from "react";
import frames from "@/assets/emblem-frames/frames.json";
import { useMotionPaused } from "@/lib/motion-preference";

const LAYERS = [
  { n: "01", t: "Strategy", d: "Every build starts with what your customers need to hear." },
  { n: "02", t: "Websites", d: "A site designed to be remembered and built to convert." },
  { n: "03", t: "AI", d: "Voice and chat agents that answer when you can't." },
  { n: "04", t: "Automation", d: "Follow-up that runs itself, so no lead goes cold." },
];

const FRAMES = frames as string[];

export function EmblemScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paused = useMotionPaused();
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const still = paused || reduced;

  useEffect(() => {
    if (still) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgs = FRAMES.map((src) => {
      const i = new Image();
      i.decoding = "async";
      i.src = src;
      return i;
    });
    let current = -1;
    let raf = 0;
    let lastActive = -1;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      current = -1;
    };

    const draw = (idx: number) => {
      const img = imgs[idx];
      if (!img || !img.complete || !img.naturalWidth) return false;
      const cw = canvas.width;
      const ch = canvas.height;
      const mobile = canvas.clientWidth < 768;
      const s = mobile
        ? Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * 1.35
        : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      return true;
    };

    const tick = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
      const idx = Math.round(p * (imgs.length - 1));
      if (idx !== current && draw(idx)) current = idx;
      const a = Math.min(LAYERS.length - 1, Math.floor(p * LAYERS.length));
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    imgs[0]!.onload = schedule;
    imgs.forEach((i) => i.addEventListener("load", () => current === -1 && schedule()));
    size();
    const ro = new ResizeObserver(() => {
      size();
      schedule();
    });
    ro.observe(canvas);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [still]);

  return (
    <section
      ref={sectionRef}
      className={`emblem-scroll${still ? " is-still" : ""}`}
      aria-labelledby="emblem-scroll-title"
    >
      <div className="emblem-scroll__stage">
        {still ? (
          <img
            className="emblem-scroll__canvas"
            src={FRAMES[FRAMES.length - 1]}
            alt="The Roy Effect emblem separated into its layers"
            loading="lazy"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="emblem-scroll__canvas"
            role="img"
            aria-label="The Roy Effect emblem separating into its layers as you scroll"
          />
        )}
        <div className="emblem-scroll__head">
          <p className="emblem-scroll__kicker">How it fits together</p>
          <h2 id="emblem-scroll-title">The Effect, layer by layer</h2>
        </div>
        <ol className="emblem-scroll__cards">
          {LAYERS.map((l, i) => (
            <li key={l.n} className={still || i === active ? "is-active" : undefined}>
              <span className="emblem-scroll__num">{l.n}</span>
              <strong>{l.t}</strong>
              <span className="emblem-scroll__desc">{l.d}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
