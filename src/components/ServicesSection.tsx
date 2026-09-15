import { Link } from "@tanstack/react-router";
import { Blocks, Palette, PanelsTopLeft, RefreshCw } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SERVICES } from "@/lib/site-content";

const SERVICE_ICONS = [Palette, PanelsTopLeft, Blocks, RefreshCw] as const;

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative z-20 overflow-hidden bg-[#030014] px-5 py-20 md:px-10 md:py-28"
    >
      <div className="services-texture pointer-events-none absolute inset-0" aria-hidden="true" />
      <ScrollReveal className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between md:gap-12 md:pb-12">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#DFBA73]">SERVICES</span>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.9] text-white md:text-6xl">
              WHAT I DO
            </h2>
          </div>
          <p className="max-w-md font-mono text-base leading-[1.6] text-white/90">
            Four ways to work together. Every engagement starts with a fixed scope and a price
            agreed in writing.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          {SERVICES.map((service, index) => {
            const Icon = SERVICE_ICONS[index] ?? Blocks;
            const isRetainer = service.slug === "design-retainer";

            return (
              <Link
                key={service.slug}
                to="/services"
                hash={service.slug}
                className="group relative min-w-0 overflow-hidden border border-white/10 bg-white/[0.02] p-6 transition-colors duration-500 hover:border-[#DFBA73]/50 md:p-8"
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-linear-to-br ${isRetainer ? "from-[#FF3333]/10" : "from-[#DFBA73]/10"} to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <div className="flex size-12 items-center justify-center bg-white/5 md:size-14">
                    <Icon className="size-5 text-[#DFBA73] md:size-6" aria-hidden="true" />
                  </div>
                  <div className="mt-10 md:mt-14">
                    <span className="font-mono text-[11px] tracking-widest text-[#DFBA73]">
                      FROM {service.from}
                    </span>
                    <h3 className="mt-3 font-display text-2xl uppercase text-white md:text-3xl">
                      {service.name}
                    </h3>
                    <p className="mt-4 font-mono text-base leading-[1.6] text-white/90">
                      {service.summary}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
