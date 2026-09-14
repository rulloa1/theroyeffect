import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SHOWCASE_WORK, type ShowcaseWorkEntry } from "@/lib/site-content";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";

function WorkImage({
  entry,
  index,
  className,
}: {
  entry: ShowcaseWorkEntry;
  index: number;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = entry.image !== null && !imageFailed;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImageFailed(true);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-[#0a0620] ${className ?? ""}`}>
      {showImage ? (
        <img
          ref={imgRef}
          src={entry.image ?? ""}
          alt={entry.alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 overflow-hidden bg-[#0a0620]"
          role="img"
          aria-label={entry.alt}
        >
          <div className="absolute inset-x-[12%] top-[18%] h-[58%] border border-[#DFBA73]/50 bg-[#030014] shadow-[18px_18px_0_rgba(255,51,51,0.18)]" />
          <div className="absolute left-[18%] top-[29%] h-2 w-[18%] bg-[#DFBA73]" />
          <div className="absolute left-[18%] top-[39%] h-5 w-[48%] bg-white/90" />
          <div className="absolute left-[18%] top-[51%] h-3 w-[35%] bg-white/30" />
          <div className="absolute bottom-2 right-4 font-display text-6xl text-white/5">
            0{index + 1}
          </div>
        </div>
      )}
    </div>
  );
}

function CompactCard({ entry, index }: { entry: ShowcaseWorkEntry; index: number }) {
  return (
    <article className="group border border-white/10 bg-white/[0.02] transition-colors hover:border-[#DFBA73]/60">
      <WorkImage entry={entry} index={index} className="aspect-[4/3] max-h-56 w-full" />
      <div className="p-5">
        <h3 className="font-display text-xl uppercase text-white">{entry.title}</h3>
        <p className="mt-2 font-mono text-base leading-[1.6] text-white/90">{entry.result}</p>
      </div>
    </article>
  );
}

export function WorkGrid({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [canPreview, setCanPreview] = useState(false);

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

  const movePreview = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (previewRef.current && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      previewRef.current.style.transform = `translate3d(${targetRef.current.x + 20}px, ${targetRef.current.y - 110}px, 0)`;
    }
  };

  return (
    <div>
      <div ref={containerRef} onMouseMove={movePreview} className="relative">
        {compact ? (
          <div className="grid gap-4 md:grid-cols-3">
            {SHOWCASE_WORK.map((entry, index) => (
              <CompactCard key={entry.slug} entry={entry} index={index} />
            ))}
          </div>
        ) : (
          <div className="border-b border-white/10">
            {SHOWCASE_WORK.map((entry, index) => (
              <Link
                key={entry.slug}
                to="/case-study"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group block border-t border-white/10 bg-white/[0.02] px-4 py-5 transition-colors hover:bg-white/[0.04] md:px-6 md:py-7"
              >
                <WorkImage
                  entry={entry}
                  index={index}
                  className="mb-5 aspect-[4/3] w-full border border-[#DFBA73]/30 md:hidden"
                />
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.75fr)_auto] md:items-center md:gap-8">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-3xl uppercase text-white transition-colors group-hover:text-[#DFBA73] md:text-5xl">
                      {entry.title}
                    </h3>
                    <ArrowUpRight className="size-5 -translate-x-2 text-white opacity-0 transition-all group-hover:translate-x-0 group-hover:text-[#DFBA73] group-hover:opacity-100" />
                  </div>
                  <p className="font-mono text-base leading-[1.6] text-white/90">{entry.result}</p>
                  <span className="font-mono text-xs tracking-widest text-[#DFBA73] md:max-w-44 md:text-right">
                    {entry.eyebrow}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!compact && canPreview ? (
          <div
            ref={previewRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-30 hidden h-[220px] w-[320px] md:block"
          >
            <div
              className={`relative h-full w-full border border-[#DFBA73]/40 bg-[#0a0620] shadow-[18px_18px_0_rgba(255,51,51,0.18)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                hoveredIndex === null ? "scale-[0.92] opacity-0" : "scale-100 opacity-100"
              }`}
            >
              {SHOWCASE_WORK.map((entry, index) => (
                <WorkImage
                  key={entry.slug}
                  entry={entry}
                  index={index}
                  className={`absolute inset-0 h-full w-full transition-[opacity,filter] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                    hoveredIndex === index ? "opacity-100 blur-0" : "opacity-0 blur-[2px]"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <p className="mt-5 font-mono text-[15px] leading-[1.6] text-white/90">
        Named client work is added with written permission — I&apos;ll walk you through live
        projects on the call.
      </p>
      <Link
        to="/case-study"
        className="mt-4 inline-flex min-h-11 items-center gap-2 py-2 font-mono text-[15px] tracking-widest text-[#DFBA73] transition-colors hover:text-white"
      >
        SEE HOW I WORK <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}
