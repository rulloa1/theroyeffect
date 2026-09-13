import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SHOWCASE_WORK, type ShowcaseWorkEntry } from "@/lib/site-content";
import { Tilt3D } from "@/components/Tilt3D";

function WorkCard({ entry, compact }: { entry: ShowcaseWorkEntry; compact: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = entry.image !== null && !imageFailed;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImageFailed(true);
  }, []);

  // The whole card is one link: a single, large tap target instead of a small text link.
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full cursor-pointer flex-col border border-white/10 bg-white/[0.02] transition-colors duration-200 hover:border-[#DFBA73]/60 focus-visible:border-[#DFBA73]"
    >
      <div
        className={`${compact ? "aspect-[4/3] max-h-56" : "aspect-[4/3]"} relative w-full overflow-hidden bg-[#0a0620]`}
      >
        {showImage ? (
          <img
            ref={imgRef}
            src={entry.image ?? ""}
            alt={entry.alt}
            width={960}
            height={720}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          // Branded placeholder for sites that can't be captured as a still (e.g. scroll-driven heroes).
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,51,51,0.18),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(223,186,115,0.16),transparent_50%)]"
          >
            <span className="font-display text-7xl uppercase tracking-wide text-white/15 transition-colors duration-300 group-hover:text-white/25 md:text-8xl">
              {entry.title.split(" ")[0]}
            </span>
          </div>
        )}
        <span className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#030014] via-[#030014]/80 to-transparent px-4 pb-3 pt-12 font-mono text-[10px] tracking-widest text-[#DFBA73]">
          {entry.eyebrow}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl uppercase text-white transition-colors duration-200 group-hover:text-[#F5DC9E]">
          {entry.title}
        </h3>
        <p className="mt-2 font-mono text-sm leading-6 text-white/75">{entry.result}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 font-mono text-[11px] tracking-widest text-[#DFBA73] transition-colors duration-200 group-hover:text-white">
          VISIT LIVE SITE
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </div>
    </a>
  );
}

const COMPACT_COUNT = 3;

export function WorkGrid({ compact = false }: { compact?: boolean }) {
  const entries = compact ? SHOWCASE_WORK.slice(0, COMPACT_COUNT) : SHOWCASE_WORK;
  return (
    <div>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.slug}>
            <Tilt3D>
              <WorkCard entry={entry} compact={compact} />
            </Tilt3D>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-xs leading-6 text-white/70">
        Live client sites — click through to see them working.{" "}
        {compact ? (
          <Link to="/work" className="text-[#DFBA73] transition-colors duration-200 hover:text-white">
            SEE ALL {SHOWCASE_WORK.length} PROJECTS →
          </Link>
        ) : (
          <Link
            to="/case-study"
            className="text-[#DFBA73] transition-colors duration-200 hover:text-white"
          >
            SEE HOW I WORK →
          </Link>
        )}
      </p>
    </div>
  );
}
