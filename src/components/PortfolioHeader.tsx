import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { MotionToggle } from "@/components/MotionToggle";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";

const LINKS = [
  { label: "WORK", to: "/", hash: "work" },
  { label: "SERVICES", to: "/services" },
  { label: "ABOUT", to: "/about" },
  { label: "START A PROJECT", to: "/brief" },
] as const;

export function PortfolioHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[var(--ground)]/85 px-[var(--gutter)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 sm:flex sm:justify-between">
        <Link
          to="/"
          aria-label="The Roy Effect home"
          className="flex min-w-0 items-center gap-3"
        >
          <Logo variant="responsive" size="sm" href={null} className="inline-flex shrink-0" />
          <span className="hidden min-w-0 font-portfolio text-sm font-bold text-[var(--ink)] sm:block">
            THE ROY EFFECT
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden shrink-0 items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              {...("hash" in link ? { hash: link.hash } : {})}
              className="inline-flex min-h-11 items-center font-mono text-[10px] font-bold tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--gold)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="min-h-11 rounded-none border-[var(--gold)] bg-transparent px-4 font-mono text-[11px] font-bold tracking-[0.14em] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ground)] sm:px-5"
          >
            <Link
              to="/audit"
              onClick={() => trackAnalyticsEvent("audit_cta_click", { placement: "header" })}
            >
              FREE AUDIT <ArrowUpRight className="hidden sm:block" />
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="size-11 rounded-none border-[var(--line)] bg-transparent text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--ink)]/5 lg:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          aria-label="Mobile primary"
          className="border-t border-[var(--line)] bg-[var(--ground)] px-5 py-5 lg:hidden"
        >
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              {...("hash" in link ? { hash: link.hash } : {})}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center justify-between border-b border-[var(--line)] font-portfolio text-xl font-semibold text-[var(--ink)] last:border-0"
            >
              {link.label}
              <ArrowUpRight className="size-4 text-[var(--gold)]" />
            </Link>
          ))}
          <MotionToggle className="mt-3 w-full justify-start border-t border-[var(--line)] pt-3" />
        </nav>
      ) : null}
    </header>
  );
}
