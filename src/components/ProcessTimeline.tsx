import { ScrollReveal } from "@/components/ScrollReveal";
import { PROCESS_STEPS } from "@/lib/site-content";

export function ProcessTimeline() {
  return (
    <section id="process" className="relative z-20 bg-[#0a0620] px-5 py-20 md:px-10 md:py-28">
      <ScrollReveal respectEffectsGuard className="mx-auto max-w-7xl">
        <span className="font-mono text-xs tracking-widest text-[#DFBA73]">HOW IT WORKS</span>
        <h2 className="mt-3 max-w-4xl font-display text-4xl uppercase leading-[0.95] text-white md:text-6xl">
          FIVE STEPS FROM BRIEF TO LIVE.
        </h2>

        <ol className="mt-10 md:mt-14">
          {PROCESS_STEPS.map((item, index) => (
            <li
              key={item.step}
              className="relative grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0 md:gap-6 md:pb-6"
            >
              {index < PROCESS_STEPS.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-5 top-10 border-l border-dashed border-white/15"
                />
              ) : null}
              <div className="relative z-10 flex size-10 items-center justify-center border border-[#DFBA73]/50 bg-[#030014] font-mono text-xs text-[#DFBA73]">
                {item.step}
              </div>
              <article className="min-w-0 border border-white/10 bg-white/[0.02] p-5 md:p-6">
                <h3 className="font-display text-2xl uppercase text-white md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 font-mono text-base leading-[1.6] text-white/90">{item.body}</p>
              </article>
            </li>
          ))}
        </ol>
      </ScrollReveal>
    </section>
  );
}
