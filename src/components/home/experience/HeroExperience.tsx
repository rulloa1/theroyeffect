import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneText } from "./SceneText";
import { SCENE_ORDER, SCENE_RANGES, sceneAt, type SceneId } from "./timeline";
import { SCENES } from "../content";

const EMBLEM_SRC = "/brand/roy-effect-emblem.webp";
const EMBLEM_SRC_SMALL = "/brand/roy-effect-emblem-512.webp";

type Stage = import("./webgl/stage").Stage;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The pinned, scroll-controlled opening. Layout mode is decided in CSS
 * (`prefers-reduced-motion`), so the server-rendered HTML is already correct
 * before any JavaScript runs; this component only adds motion and WebGL.
 */
export function HeroExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Keyboard users tabbing into the final CTAs are carried to the end of the
  // sequence so the focused control is actually on screen.
  const handleRevealFocus = useCallback(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const end = root.offsetTop + root.offsetHeight - window.innerHeight;
    if (window.scrollY < end - 4) window.scrollTo({ top: end, behavior: "auto" });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const labelHost = labelsRef.current;
    if (!root || !viewport || !canvas || !labelHost) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset["motion"] = "on";
    let stage: Stage | null = null;
    let disposed = false;
    let currentScene: SceneId | null = null;

    const lowPower = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900;
    const blur = lowPower ? "blur(0px)" : "blur(10px)";

    const ctx = gsap.context(() => {
      // ---- Time-based entrance: the first screen is never an empty black box.
      gsap
        .timeline({ delay: 0.15 })
        .fromTo(
          "[data-intro-char]",
          { yPercent: 110, opacity: 0, filter: blur },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.045,
          },
        )
        .fromTo(
          "[data-intro]",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 },
          "-=0.6",
        )
        .fromTo(".xp-scroll-cue", { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.4");

      // ---- One master timeline. Its length is exactly 1, so timeline positions
      // ARE scroll progress and line up with SCENE_RANGES used by the 3D stage.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: lowPower ? 0.4 : 0.8,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          // The stage reads the *smoothed* timeline, not raw scroll, so 3D and
          // typography share one clock.
          const p = tl.progress();
          stage?.setProgress(p);
          const scene = sceneAt(p);
          if (scene !== currentScene) {
            currentScene = scene;
            const copy = SCENES.find((s) => s.id === scene);
            if (indexRef.current && copy) indexRef.current.textContent = copy.index;
            if (labelRef.current && copy) labelRef.current.textContent = copy.label;
            root.dataset["scene"] = scene;
          }
          root.classList.toggle("xp-cta-live", p > 0.955);
        },
      });
      tl.to({}, { duration: 0.001 }, 0.999);

      // Arrival hands over to the camera: copy recedes as we approach the R.
      tl.to(".xp-scroll-cue", { opacity: 0, duration: 0.02 }, 0.008);
      tl.to(
        ".xp-scene--arrival",
        { opacity: 0, y: -60, scale: 1.04, filter: blur, duration: 0.035 },
        0.075,
      );

      for (const id of SCENE_ORDER) {
        if (id === "arrival") continue;
        const [start, end] = SCENE_RANGES[id];
        const scene = `.xp-scene--${id}`;
        tl.fromTo(scene, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.004 }, start + 0.012);
        tl.fromTo(
          `${scene} .xp-line-inner`,
          { yPercent: 115, filter: blur },
          { yPercent: 0, filter: "blur(0px)", duration: 0.038, stagger: 0.007 },
          start + 0.014,
        );
        tl.fromTo(
          `${scene} .xp-reveal`,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.03, stagger: 0.006 },
          start + 0.036,
        );
        if (id !== "reveal") {
          tl.to(scene, { opacity: 0, y: -48, filter: blur, duration: 0.03 }, end - 0.034);
        }
      }

      // Portal: into the R. Screen: into the monitor. Sweep: the red light pass.
      tl.fromTo(".xp-flash--portal", { opacity: 0 }, { opacity: 1, duration: 0.013 }, 0.153);
      tl.to(".xp-flash--portal", { opacity: 0, duration: 0.028 }, 0.168);
      tl.fromTo(".xp-flash--screen", { opacity: 0 }, { opacity: 1, duration: 0.014 }, 0.335);
      tl.to(".xp-flash--screen", { opacity: 0, duration: 0.028 }, 0.351);
      tl.fromTo(
        ".xp-sweep",
        { xPercent: -120, opacity: 0 },
        { xPercent: 120, opacity: 1, duration: 0.055 },
        0.893,
      );
      tl.to(".xp-sweep", { opacity: 0, duration: 0.012 }, 0.94);
    }, root);

    // ---- WebGL is an enhancement: loaded on demand, never blocking the copy.
    let observer: IntersectionObserver | null = null;
    const onPointer = (e: PointerEvent) => {
      stage?.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };

    void (async () => {
      const { supportsWebGL, detectQuality } = await import("./webgl/quality");
      if (disposed) return;
      if (!supportsWebGL()) {
        root.dataset["webgl"] = "unavailable";
        return;
      }
      try {
        const quality = detectQuality();
        const { createStage } = await import("./webgl/stage");
        if (disposed) return;
        const created = await createStage({
          canvas,
          host: viewport,
          labelHost,
          quality,
          emblemUrl: quality.tier === "high" ? EMBLEM_SRC : EMBLEM_SRC_SMALL,
        });
        if (disposed) {
          created.dispose();
          return;
        }
        stage = created;
        stage.setProgress(0);
        root.dataset["webgl"] = "ready";
        root.dataset["tier"] = quality.tier;
        if (quality.pointerParallax) {
          window.addEventListener("pointermove", onPointer, { passive: true });
        }
        observer = new IntersectionObserver(
          ([entry]) => stage?.setActive(Boolean(entry?.isIntersecting)),
          { rootMargin: "100px 0px" },
        );
        observer.observe(root);
        ScrollTrigger.refresh();
      } catch (error) {
        console.warn("[HeroExperience] WebGL stage unavailable, using static visuals.", error);
        root.dataset["webgl"] = "unavailable";
      }
    })();

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("pointermove", onPointer);
      ctx.revert();
      stage?.dispose();
      stage = null;
      delete root.dataset["motion"];
      delete root.dataset["webgl"];
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="experience"
      className="xp"
      aria-label="The Roy Effect — what we build"
    >
      <div ref={viewportRef} className="xp-viewport">
        <canvas ref={canvasRef} className="xp-canvas" aria-hidden="true" />
        <img
          className="xp-poster"
          src={EMBLEM_SRC_SMALL}
          srcSet={`${EMBLEM_SRC_SMALL} 512w, ${EMBLEM_SRC} 1024w`}
          sizes="(max-width: 768px) 60vw, 34vw"
          width={512}
          height={512}
          alt="The Roy Effect emblem"
          fetchPriority="high"
        />
        <div ref={labelsRef} className="xp-labels" aria-hidden="true" />
        <div className="xp-flash xp-flash--portal" aria-hidden="true" />
        <div className="xp-flash xp-flash--screen" aria-hidden="true" />
        <div className="xp-sweep" aria-hidden="true" />

        <SceneText onRevealFocus={handleRevealFocus} />

        <div className="xp-hud" aria-hidden="true">
          <span ref={indexRef} className="xp-hud-index">
            01
          </span>
          <span className="xp-hud-bar" />
          <span ref={labelRef} className="xp-hud-label">
            The arrival
          </span>
        </div>
        <div className="xp-scroll-cue" aria-hidden="true">
          <span>Scroll to enter</span>
          <span className="xp-scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
