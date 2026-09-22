import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_COUNT = 96;
const framePath = (n: number) => `/hero-frames/frame-${String(n).padStart(4, "0")}.jpg`;
const POSTER = "/hero-frames/poster.jpg";

/** Share of the viewport height the frame is lifted by, leaving a band for the copy. */
const FRAME_LIFT = 0.025;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Phones and save-data users get every other frame: half the bytes, same scrub. */
const isLowPower = () => {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth < 900 ||
    Boolean(nav.connection?.saveData)
  );
};

/**
 * A pinned, scroll-scrubbed frame sequence: the R forging out of light.
 * The poster is server-rendered, so the section reads correctly before any
 * script runs, and stays as the only visual for reduced-motion visitors.
 */
export function ForgeSequence() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || prefersReducedMotion()) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset["motion"] = "on";

    const stride = isLowPower() ? 2 : 1;
    const indices: number[] = [];
    for (let n = 1; n <= FRAME_COUNT; n += stride) indices.push(n);

    const frames: HTMLImageElement[] = [];
    let disposed = false;
    let started = false;
    let current = 0;
    let scrollCtx: gsap.Context | null = null;

    // Explicit pixel + style sizing (no DPR scaling, no CSS 100%) so the
    // cover-fit maths and the drawn bitmap never disagree.
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      draw(current);
    };

    function draw(idx: number) {
      const img = frames[idx];
      if (!img || !img.complete || !img.naturalWidth || !ctx2d || !canvas) return;
      // Cover-fit, lifted so the mark clears the copy band below it. The frame only
      // scales up when the viewport is too tall to lift into (16:9 and narrower);
      // wider windows already crop enough vertically.
      const lift = canvas.height * FRAME_LIFT;
      const r = Math.max(
        canvas.width / img.naturalWidth,
        (canvas.height + lift * 2) / img.naturalHeight,
      );
      const w = img.naturalWidth * r;
      const h = img.naturalHeight * r;
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2 - lift, w, h);
    }

    const start = () => {
      if (started || disposed) return;
      started = true;

      let loaded = 0;
      for (const n of indices) {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          loaded += 1;
          if (disposed) return;
          if (loaded === 1) root.dataset["frames"] = "ready";
          draw(current);
        };
        img.src = framePath(n);
        frames.push(img);
      }

      resize();
      window.addEventListener("resize", resize);

      scrollCtx = gsap.context(() => {
        const state = { frame: 0 };
        gsap.to(state, {
          frame: indices.length - 1,
          snap: "frame",
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
          onUpdate() {
            const next = Math.round(state.frame);
            if (next !== current) {
              current = next;
              draw(current);
            }
          },
        });

        // Copy arrives once the light has settled into the finished mark. Positions
        // are fractions of the scrubbable range (section height minus one screen),
        // not of the section's height, or the copy would never finish appearing.
        const at = (fraction: number) => () =>
          root.getBoundingClientRect().top +
          window.scrollY +
          (root.offsetHeight - window.innerHeight) * fraction;
        // Hidden state is set explicitly: a staggered fromTo under scrub only
        // applies it to the first element, leaving the headline visible early.
        gsap.set(".forge-copy > *", { opacity: 0, y: 24 });
        gsap.to(".forge-copy > *", {
          opacity: 1,
          y: 0,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: {
            trigger: root,
            start: at(0.62),
            end: at(0.86),
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }, root);
    };

    // Load nothing until the section is nearly on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(root);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", resize);
      scrollCtx?.revert();
      for (const img of frames) img.onload = null;
      frames.length = 0;
      delete root.dataset["frames"];
      delete root.dataset["motion"];
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="forge"
      className="forge"
      aria-label="The Roy Effect mark forging out of light"
    >
      <div className="forge-sticky">
        <img
          className="forge-poster"
          src={POSTER}
          width={1280}
          height={720}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <canvas ref={canvasRef} className="forge-canvas" aria-hidden="true" />
        <div className="forge-copy">
          <p className="forge-label">The Effect</p>
          <h2 className="forge-title">Built to leave a mark.</h2>
        </div>
      </div>
    </section>
  );
}
