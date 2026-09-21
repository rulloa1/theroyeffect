import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Linkedin, Mail, MapPin, Phone, SearchCheck, Twitter } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MotionToggle } from "@/components/MotionToggle";
import { CONTACT_EMAIL, LINKEDIN_URL, X_URL } from "@/lib/site";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";

const STUDIO_LINKS = [
  { label: "WORK", to: "/work" },
  { label: "SERVICES", to: "/services" },
  { label: "PRICING", to: "/pricing" },
  { label: "ABOUT", to: "/about" },
  { label: "PROCESS", to: "/process" },
  { label: "START A PROJECT", to: "/brief" },
] as const;

const GUIDE_LINKS = [
  { label: "Website audit checklist", to: "/guides/website-audit-checklist" },
  { label: "Houston website cost", to: "/guides/houston-website-cost" },
  { label: "Squarespace vs custom", to: "/guides/squarespace-vs-custom-website" },
  { label: "Connect an AI assistant", to: "/connect" },
];

export function SiteFooter() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showCtas = pathname !== "/";

  return (
    <footer
      className={`relative z-20 w-full overflow-hidden border-t border-[var(--line)] bg-[var(--ground)] px-5 pb-8 pt-14 md:px-10 md:pb-10 md:pt-20 ${pathname === "/" ? "homepage-footer" : ""}`}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-45"
      />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-[var(--line)] pb-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-16">
          <div className="lg:col-span-5 lg:pr-12">
            <div className="flex items-center gap-4">
              <Logo
                size="sm"
                href="/"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ground)]"
              />
              <div>
                <p className="font-display text-2xl uppercase text-[var(--ink)]">The Roy Effect</p>
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">
                  Rory Ulloa · Houston, Texas
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-lg font-sans text-base leading-[1.6] text-[var(--ink)]">
              Brand, web design and build for firms whose work is better than their website.
            </p>
            {showCtas ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/audit"
                  onClick={() => trackAnalyticsEvent("audit_cta_click", { placement: "footer" })}
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--furnace)] px-5 py-3 font-mono text-xs font-bold tracking-widest text-[var(--ground)] transition-colors hover:bg-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
                >
                  <SearchCheck className="size-4" /> GET YOUR FREE AUDIT{" "}
                  <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  to="/book"
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--line)] px-5 py-3 font-mono text-xs font-bold tracking-widest text-[var(--ink)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                >
                  BOOK A DISCOVERY CALL <ArrowUpRight className="size-4" />
                </Link>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">STUDIO</h3>
            <nav className="mt-4 flex flex-col" aria-label="Studio">
              {STUDIO_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="inline-flex min-h-11 items-center border-b border-[var(--line)] font-mono text-sm text-[var(--ink)] transition-colors last:border-0 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:text-[var(--gold)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">
              RESOURCES
            </h3>
            <nav className="mt-4 flex flex-col" aria-label="Resources">
              {GUIDE_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex min-h-11 items-center border-b border-[var(--line)] py-2 font-mono text-sm leading-snug text-[var(--ink)] transition-colors last:border-0 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:text-[var(--gold)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">CONTACT</h3>
            <div className="mt-4 font-mono text-sm text-[var(--ink)]">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex min-h-11 items-center gap-3 border-b border-[var(--line)] transition-colors hover:text-[var(--gold)] focus-visible:outline-none focus-visible:text-[var(--gold)]"
              >
                <Mail className="size-4 shrink-0 text-[var(--gold)]" /> {CONTACT_EMAIL}
              </a>
              <a
                href="tel:281-323-0450"
                className="flex min-h-11 items-center gap-3 border-b border-[var(--line)] transition-colors hover:text-[var(--gold)] focus-visible:outline-none focus-visible:text-[var(--gold)]"
              >
                <Phone className="size-4 shrink-0 text-[var(--gold)]" /> (281) 323-0450
              </a>
              <p className="flex min-h-11 items-center gap-3 text-[var(--ink)]">
                <MapPin className="size-4 shrink-0 text-[var(--gold)]" /> Houston, Texas
              </p>
            </div>
            {LINKEDIN_URL || X_URL ? (
              <div className="mt-4 flex items-center gap-2" aria-label="Social profiles">
                {LINKEDIN_URL ? (
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Rory Ulloa on LinkedIn"
                    className="inline-flex size-11 items-center justify-center border border-[var(--line)] text-[var(--ink-muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                  >
                    <Linkedin className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
                {X_URL ? (
                  <a
                    href={X_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Rory Ulloa on X"
                    className="inline-flex size-11 items-center justify-center border border-[var(--line)] text-[var(--ink-muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                  >
                    <Twitter className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ) : null}
            <Link
              to="/portal/login"
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--gold)] transition-colors hover:text-[var(--ink)] focus-visible:outline-none focus-visible:text-[var(--ink)]"
            >
              CLIENT SIGN IN <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5">
            <p className="font-mono text-sm text-[var(--ink-muted)]">
              © {new Date().getFullYear()} The Roy Effect
            </p>
            <MotionToggle />
          </div>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link
              to="/privacy"
              className="inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-none focus-visible:text-[var(--ink)]"
            >
              PRIVACY
            </Link>
            <Link
              to="/terms"
              className="inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-none focus-visible:text-[var(--ink)]"
            >
              TERMS
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
