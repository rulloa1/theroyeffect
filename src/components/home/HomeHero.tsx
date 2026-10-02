import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import posterSrc from "@/assets/hero-poster.jpg";

const HeroConstellation = lazy(() => import("./HeroConstellation"));

/**
 * Hero video source. No studio footage exists yet — set this to a hosted
 * MP4/WebM URL to enable the video layer; the poster shows until it plays.
 */
const HERO_VIDEO: string | null = null;

/** Video-led hero: video/poster, constellation canvas, grain, content. */
export function HomeHero() {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (reduce || nav.connection?.saveData) {
      v.pause();
      return;
    }
    v.play().catch(() => setPlaying(false));
  }, []);

  return (
    <section className="hh" aria-labelledby="hh-title">
      <div className="hh-media" aria-hidden="true">
        <img
          src={posterSrc}
          alt=""
          width={1920}
          height={1088}
          fetchPriority="high"
          className="hh-poster"
          data-hidden={playing ? "true" : undefined}
        />
        {HERO_VIDEO && (
          <video
            ref={videoRef}
            className="hh-video"
            src={HERO_VIDEO}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlaying={() => setPlaying(true)}
            onError={() => setPlaying(false)}
          />
        )}
        <div className="hh-shade" />
      </div>

      {mounted && (
        <Suspense fallback={null}>
          <HeroConstellation />
        </Suspense>
      )}
      <div className="hh-grain" aria-hidden="true" />

      <div className="hh-inner">
        <p className="hh-eyebrow">
          <Sparkles aria-hidden="true" size={14} />
          <span>The Roy Effect · Web Design &amp; Development</span>
        </p>

        <h1 id="hh-title" className="hh-title">
          Your vision. <em>Built to make an impact.</em>
        </h1>

        <p className="hh-sub">
          Custom websites and digital experiences that bring your brand to life—with thoughtful
          design, purposeful interactions, and a clear path for customers to connect.
        </p>

        <div className="hh-ctas">
          <Link to="/brief" className="hh-btn hh-btn--primary">
            Start Your Project
            <ArrowRight aria-hidden="true" size={18} className="hh-arrow" />
          </Link>
          <Link to="/work" className="hh-btn hh-btn--ghost">
            Explore My Work
          </Link>
        </div>
      </div>
    </section>
  );
}
