import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { STUDIES_NOTE, STUDY_CARDS, type StudyCard } from "@/lib/showcase-work";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";

/** A study's homepage, shown in a thin browser frame so it reads as a real site. */
function SiteShot({ study, className }: { study: StudyCard; className?: string }) {
  return (
    <div className={`overflow-hidden border border-white/10 bg-[#0a0a0a] ${className ?? ""}`}>
      <div className="flex h-6 items-center gap-1.5 border-b border-white/10 px-3" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={study.image}
          alt={study.imageAlt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
    </div>
  );
}

/** Homepage: one card per study, the whole card links to its page. */
function StudyCardCompact({ study }: { study: StudyCard }) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: study.slug }}
      className="group flex flex-col border border-white/10 bg-white/[0.02] p-3 transition-colors duration-300 hover:border-[#DFBA73]/60"
    >
      <SiteShot study={study} />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#DFBA73]">
          Study {study.index} · {study.sector}
        </p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-tight text-white">{study.name}</h3>
        <p className="mt-2 font-sans text-[15px] leading-relaxed text-white/75">{study.summary}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors group-hover:text-[#DFBA73]">
          Read the study <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function WorkGrid({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [canPreview, setCanPreview] = useState(false);

  // /work only: a cursor-following preview of the study being hovered.
  useEffect(() => {
    if (compact) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enabled = finePointer && shouldRunHeavyEffects();
    setCanPreview(enabled);
    if (!enabled || reduced) return;

    let frame = 0;
    const animate = () => {
      smoothRef.current.x += (targetRef.current.x - smoothRef.current.x) * 0.15;
      smoothRef.current.y += (targetRef.current.y - smoothRef.current.y) * 0.15;
      if (previewRef.current)
        previewRef.current.style.transform = `translate3d(${smoothRef.current.x + 20}px, ${smoothRef.current.y - 110}px, 0)`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [compact]);

  const movePreview = (event: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (previewRef.current && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      previewRef.current.style.transform = `translate3d(${targetRef.current.x + 20}px, ${targetRef.current.y - 110}px, 0)`;
    }
  };

  return (
    <div>
      {compact ? (
        <div className="grid gap-4 md:grid-cols-3">
          {STUDY_CARDS.map((study) => (
            <StudyCardCompact key={study.slug} study={study} />
          ))}
        </div>
      ) : (
        <div ref={containerRef} onMouseMove={movePreview} className="relative">
          <div className="border-b border-white/10">
            {STUDY_CARDS.map((study, index) => (
              <Link
                key={study.slug}
                to="/work/$slug"
                params={{ slug: study.slug }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group block border-t border-white/10 bg-white/[0.02] px-4 py-5 transition-colors hover:bg-white/[0.04] md:px-6 md:py-7"
              >
                <SiteShot study={study} className="mb-5 md:hidden" />
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.9fr)_auto] md:items-center md:gap-8">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-3xl uppercase text-white transition-colors group-hover:text-[#DFBA73] md:text-5xl">
                      {study.name}
                    </h3>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 shrink-0 -translate-x-2 text-white opacity-0 transition-all group-hover:translate-x-0 group-hover:text-[#DFBA73] group-hover:opacity-100"
                    />
                  </div>
                  <p className="font-sans text-base leading-relaxed text-white/80">{study.summary}</p>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#DFBA73] md:max-w-44 md:text-right">
                    Study {study.index} · {study.sector}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {canPreview ? (
            <div
              ref={previewRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-30 hidden w-[360px] md:block"
            >
              <div
                className={`relative aspect-[16/10] w-full overflow-hidden border border-[#DFBA73]/40 bg-[#0a0a0a] shadow-[18px_18px_0_rgba(255,51,51,0.18)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                  hoveredIndex === null ? "scale-[0.92] opacity-0" : "scale-100 opacity-100"
                }`}
              >
                {STUDY_CARDS.map((study, index) => (
                  <img
                    key={study.slug}
                    src={study.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover object-top transition-[opacity,filter] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                      hoveredIndex === index ? "opacity-100 blur-0" : "opacity-0 blur-[2px]"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
      <p className="mt-5 max-w-[70ch] font-sans text-sm leading-relaxed text-white/60">{STUDIES_NOTE}</p>
    </div>
  );
}
