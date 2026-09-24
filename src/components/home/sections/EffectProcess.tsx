import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useMotionPaused } from "@/lib/motion-preference";
import { EFFECT_PROCESS } from "../content";

/**
 * The Effect — six stages a customer moves through. Hover, focus or tap a
 * stage; the rail fills to show everything that happened before it.
 */
export function EffectProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const motionPaused = useMotionPaused();
  const stage = EFFECT_PROCESS[active] ?? EFFECT_PROCESS[0]!;
  const last = EFFECT_PROCESS.length - 1;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || motionPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    const updateFromScroll = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.68;
      const distance = Math.max(bounds.height + viewportHeight * 0.36, 1);
      const progress = Math.min(1, Math.max(0, (start - bounds.top) / distance));
      const next = Math.min(last, Math.floor(progress * EFFECT_PROCESS.length));
      setActive((current) => (current === next ? current : next));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [last, motionPaused]);

  return (
    <section ref={sectionRef} className="home-section" aria-labelledby="effect-title">
      <div className="home-wrap">
        <ScrollReveal className="home-section-head">
          <div>
            <p className="home-eyebrow">
              02 <b>/ The Effect</b>
            </p>
            <h2 id="effect-title" className="home-display home-section-title mt-5">
              From stranger
              <br />
              to customer.
            </h2>
          </div>
          <p className="home-section-lede">
            One connected path. Each stage hands the next one a warmer lead — without anyone copying
            details between tools.
          </p>
        </ScrollReveal>

        <ScrollReveal className="home-process">
          <div className="home-process-steps" role="group" aria-label="The Roy Effect process">
            <div className="home-process-rail" aria-hidden="true">
              <span style={{ height: `${(active / last) * 100}%` }} />
            </div>
            {EFFECT_PROCESS.map((item, i) => (
              <button
                key={item.name}
                type="button"
                className="home-process-step"
                aria-pressed={active === i}
                aria-controls="effect-detail"
                data-reached={i <= active ? "true" : "false"}
                data-final={i === last ? "true" : "false"}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="home-process-dot" aria-hidden="true" />
                {item.name}
              </button>
            ))}
          </div>

          <div id="effect-detail" className="home-process-detail" aria-live="polite">
            <div key={stage.name} className="home-process-detail-body">
              <p className="home-process-detail-index">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(EFFECT_PROCESS.length).padStart(2, "0")}
              </p>
              <h3 className={`home-display ${active === last ? "text-[var(--home-gold)]" : ""}`}>
                {stage.name}
              </h3>
              <p>{stage.body}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
