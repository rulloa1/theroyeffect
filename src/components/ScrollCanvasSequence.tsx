import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";

export interface ScrollCanvasSequenceProps {
  frameCount?: number;
  sequenceFolder?: string;
  framePrefix?: string;
  frameExtension?: string;
}

export function ScrollCanvasSequence({
  frameCount = 120,
  sequenceFolder = "/sequence",
  framePrefix = "frame_",
  frameExtension = ".webp",
}: ScrollCanvasSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Scroll tracking with spring smoothing
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  // 2. Preload frame sequence
  useEffect(() => {
    let isCancelled = false;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      const progress = Math.min(100, Math.round((loadedCount / frameCount) * 100));
      setLoadProgress(progress);

      if (loadedCount === frameCount && !isCancelled) {
        setImages(loadedImages);
        setTimeout(() => setIsLoaded(true), 350);
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `${sequenceFolder}/${framePrefix}${i}${frameExtension}`;
      img.onload = updateProgress;
      img.onerror = () => {
        // Fallback progress if sequence files are missing locally during development
        updateProgress();
      };
      loadedImages.push(img);
    }

    return () => {
      isCancelled = true;
    };
  }, [frameCount, sequenceFolder, framePrefix, frameExtension]);

  // 3. Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const progress = smoothProgress.get();
      const rawIndex = Math.floor(progress * (frameCount - 1));
      const frameIndex = Math.max(0, Math.min(frameCount - 1, rawIndex));

      // Resize & devicePixelRatio handling
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const displayWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
      const displayHeight = typeof window !== "undefined" ? window.innerHeight : 800;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Match pure void background (#050505)
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      const currentImg = images[frameIndex];

      if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
        // "Contain" scaling logic
        const imgRatio = currentImg.naturalWidth / currentImg.naturalHeight;
        const canvasRatio = displayWidth / displayHeight;

        let renderWidth = displayWidth;
        let renderHeight = displayHeight;

        if (canvasRatio > imgRatio) {
          renderHeight = displayHeight;
          renderWidth = displayHeight * imgRatio;
        } else {
          renderWidth = displayWidth;
          renderHeight = displayWidth / imgRatio;
        }

        const offsetX = (displayWidth - renderWidth) / 2;
        const offsetY = (displayHeight - renderHeight) / 2;

        ctx.drawImage(currentImg, offsetX, offsetY, renderWidth, renderHeight);
      } else {
        // Procedural kinetic fallback animation
        renderProceduralFallback(ctx, displayWidth, displayHeight, progress);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [images, frameCount, smoothProgress]);

  // Helper: Procedural wireframe sphere for instant preview
  const renderProceduralFallback = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.22;
    const rings = 24;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1;

    for (let i = 0; i < rings; i++) {
      const angle = (i / rings) * Math.PI + progress * Math.PI * 2;
      const r = baseRadius * Math.sin(angle);
      const yOffset = baseRadius * Math.cos(angle) * (1 - progress * 0.4);

      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + yOffset * 0.6,
        Math.abs(r) + 20,
        Math.abs(r) * 0.35 + 10,
        angle,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  };

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-[#050505]">
      {/* 4. Preloader Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] px-6 text-white"
          >
            <div className="flex flex-col items-center gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                Calibrating Experience
              </span>
              <div className="relative h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-white"
                  style={{ width: `${loadProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>
              <span className="font-mono text-sm tracking-widest text-white/80">
                {loadProgress}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Sticky Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full object-contain" />

        {/* Scroll To Explore Indicator */}
        <ScrollIndicator scrollProgress={smoothProgress} />

        {/* Scrollytelling Story Beats */}
        <StoryBeats scrollProgress={smoothProgress} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scroll To Explore Cue
// ---------------------------------------------------------------------------
function ScrollIndicator({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollProgress, [0, 0.08], [1, 0]);
  const y = useTransform(scrollProgress, [0, 0.08], [0, 10]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        Scroll to Explore
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="size-4 text-white/40" />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Scrollytelling Story Beats
// ---------------------------------------------------------------------------
function StoryBeats({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 md:p-16">
      {/* Beat A: 0% - 20% (Hero Center) */}
      <BeatContainer
        progress={scrollProgress}
        range={[0.0, 0.05, 0.16, 0.22]}
        className="text-center"
      >
        <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.3em] text-white/50">
          GENESIS · SPEC 01
        </span>
        <h1 className="text-balance font-display text-6xl uppercase tracking-tighter text-white/90 sm:text-7xl md:text-8xl lg:text-9xl">
          PERFECT FORM
        </h1>
        <p className="mx-auto mt-4 max-w-lg font-mono text-sm leading-relaxed text-white/60 md:text-base">
          Engineered down to the microscopic tolerance. Every layer unifies into a singular, cohesive presence.
        </p>
      </BeatContainer>

      {/* Beat B: 25% - 45% (Feature 1 - Left Aligned) */}
      <BeatContainer
        progress={scrollProgress}
        range={[0.25, 0.3, 0.42, 0.48]}
        className="w-full max-w-7xl text-left"
      >
        <div className="max-w-md">
          <span className="mb-3 block font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            01 / ARCHITECTURE
          </span>
          <h2 className="font-display text-4xl uppercase tracking-tight text-white/90 sm:text-5xl md:text-6xl">
            Internal Symphony
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-white/60">
            Precision chassis revealing titanium reinforcement and decoupled sub-assemblies. Zero wasted volume.
          </p>
          <div className="mt-6 flex items-center gap-3 border-l border-white/20 pl-4 font-mono text-xs text-white/40">
            <span>Mass: 142g</span>
            <span>·</span>
            <span>Tolerance: ±0.002mm</span>
          </div>
        </div>
      </BeatContainer>

      {/* Beat C: 50% - 70% (Feature 2 - Right Aligned) */}
      <BeatContainer
        progress={scrollProgress}
        range={[0.5, 0.55, 0.67, 0.73]}
        className="flex w-full max-w-7xl justify-end text-right"
      >
        <div className="max-w-md">
          <span className="mb-3 block font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            02 / KINETICS
          </span>
          <h2 className="font-display text-4xl uppercase tracking-tight text-white/90 sm:text-5xl md:text-6xl">
            Adaptive Core
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-white/60">
            Instantaneous response through low-inertia magnetic drivers and active thermal dissipation pathways.
          </p>
          <div className="mt-6 flex items-center justify-end gap-3 border-r border-white/20 pr-4 font-mono text-xs text-white/40">
            <span>Latency: &lt;1.2ms</span>
            <span>·</span>
            <span>Efficiency: 99.4%</span>
          </div>
        </div>
      </BeatContainer>

      {/* Beat D: 75% - 95% (Closing Call To Action - Center) */}
      <BeatContainer
        progress={scrollProgress}
        range={[0.76, 0.81, 0.94, 0.99]}
        className="pointer-events-auto text-center"
      >
        <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          THE CONCLUSION
        </span>
        <h2 className="font-display text-5xl uppercase tracking-tight text-white/90 sm:text-6xl md:text-7xl">
          COMMAND THE FUTURE
        </h2>
        <p className="mx-auto mt-4 max-w-md font-mono text-sm leading-relaxed text-white/60">
          Now entering limited production. Secure your build allocation today.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/book"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-[#050505] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
          >
            START PROJECT
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </BeatContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Beat Transition Wrapper (Opacity + Y translation)
// ---------------------------------------------------------------------------
function BeatContainer({
  children,
  progress,
  range,
  className = "",
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number, number, number];
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [24, 0, 0, -24]);

  return (
    <motion.div
      style={
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : { opacity, y }
      }
      className={`absolute inset-0 flex items-center justify-center p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
