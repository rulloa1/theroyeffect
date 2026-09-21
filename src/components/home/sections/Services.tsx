import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HOME_SERVICES } from "../content";

export function Services() {
  return (
    <section id="services" className="home-section" aria-labelledby="services-title">
      <div className="home-wrap">
        <ScrollReveal className="home-section-head">
          <div>
            <p className="home-eyebrow">
              01 <b>/ Services</b>
            </p>
            <h2 id="services-title" className="home-display home-section-title mt-5">
              Everything your
              <br />
              business runs on.
            </h2>
          </div>
          <p className="home-section-lede">
            Websites, AI and automation built as one system — so the way you get found, answer
            enquiries and follow up all works together.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <ol className="home-services">
            {HOME_SERVICES.map((service, i) => (
              <li key={service.name} className="home-service">
                <span className="home-service-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="home-service-name">{service.name}</h3>
                <p className="home-service-summary">{service.summary}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link
              to="/services"
              className="home-link font-mono text-xs uppercase tracking-[0.2em] text-white/80"
            >
              <span className="inline-flex items-center gap-2">
                Services &amp; pricing <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
