import { ScrollReveal } from "@/components/ScrollReveal";
import { TextMaskReveal } from "@/components/cinematic/TextMaskReveal";

export function ApprovalPromise() {
  return (
    <section className="relative z-20 border-t border-white/10 bg-[#0a0620] px-5 py-20 md:px-10 md:py-28">
      <ScrollReveal className="mx-auto max-w-7xl">
        <span className="font-mono text-xs tracking-widest text-[#DFBA73]">
          THE APPROVAL PROMISE
        </span>
        <TextMaskReveal
          text="You approve the design. That design is what goes live."
          className="mt-3 max-w-4xl font-display text-4xl uppercase leading-[0.95] text-white md:text-6xl"
        />
        <p className="mt-5 max-w-2xl font-mono text-base leading-[1.6] text-white/90">
          No bait-and-switch between the mockup and the build. You sign off on the design before any
          build work starts, and the site that launches is the one you approved. If something
          changes, it&apos;s because you asked for it.
        </p>
      </ScrollReveal>
    </section>
  );
}
