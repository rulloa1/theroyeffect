import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "WORK", to: "/", hash: "work" },
  { label: "SERVICES", to: "/services" },
  { label: "ABOUT", to: "/about" },
  { label: "CONTACT", to: "/book" },
] as const;

export function PortfolioHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#030014]/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[96rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo variant="responsive" size="sm" href="/" className="inline-flex shrink-0" />
          <Link to="/" className="hidden min-w-0 font-portfolio text-sm font-bold text-white sm:block">
            THE ROY EFFECT
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden shrink-0 items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              {...("hash" in link ? { hash: link.hash } : {})}
              className="inline-flex min-h-11 items-center font-mono text-[10px] font-bold tracking-widest text-white/75 transition-colors hover:text-[#DFBA73]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="sm" className="rounded-none px-4 font-mono text-[10px] font-bold tracking-widest sm:px-5">
            <Link to="/brief">START A PROJECT <ArrowUpRight className="hidden sm:block" /></Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-none border-white/20 bg-transparent text-white hover:border-[#DFBA73] hover:bg-white/5 lg:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <nav aria-label="Mobile primary" className="border-t border-white/10 bg-[#030014] px-5 py-5 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              {...("hash" in link ? { hash: link.hash } : {})}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center justify-between border-b border-white/10 font-portfolio text-xl font-semibold text-white last:border-0"
            >
              {link.label}<ArrowUpRight className="size-4 text-[#DFBA73]" />
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}