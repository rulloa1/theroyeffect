import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export type NavTarget =
  "PROJECTS" | "PROCESS" | "ABOUT" | "RESUME" | "PRICING" | "LET'S WORK" | "MENU";

export const PRIMARY_NAV = [
  { label: "WORK", to: "/work" },
  { label: "SERVICES", to: "/services" },
  { label: "PRICING", to: "/pricing" },
  { label: "CASE STUDY", to: "/case-study" },
] as const;

const MENU_NAV = [
  ...PRIMARY_NAV,
  { label: "ABOUT", to: "/about" },
  { label: "PROCESS", to: "/process" },
  { label: "BOOK A CALL", to: "/book" },
] as const;

const navLinkClass =
  "relative py-1 font-mono text-xs tracking-widest text-white/70 transition-colors duration-200 hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#FF3333] after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none";

const navActiveClass = "text-white after:scale-x-100";

/**
 * Site-wide fixed header.
 *
 * On the homepage the MENU button opens the InfoDrawer via `onNavigate`.
 * Everywhere else it falls back to a built-in navigation sheet, so every
 * page has the same way to move around the site.
 */
export function SiteHeader({ onNavigate }: { onNavigate?: (target: NavTarget) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrolled = useScrolled();

  const openMenu = () => {
    if (onNavigate) onNavigate("MENU");
    else setMenuOpen(true);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 border-b px-3 py-3 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 sm:px-6 md:gap-8 md:px-10 md:py-4 ${
          scrolled
            ? "border-white/10 bg-[#030014]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            : "border-white/5 bg-[#030014]/75"
        }`}
      >
        <div className="flex min-w-0 shrink items-center overflow-hidden">
          <Logo variant="responsive" size="sm" href="/" className="inline-flex" />
        </div>

        <nav aria-label="Primary" className="hidden shrink-0 items-center gap-5 lg:flex xl:gap-7">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navLinkClass}
              activeProps={{ className: navActiveClass }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/audit"
            className="relative inline-flex items-center gap-1 rounded-full bg-[#FF3333] px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-black transition-all after:absolute after:-inset-2 after:content-[''] hover:bg-[#FF5555] active:scale-[0.97] sm:px-4 sm:py-2 sm:text-xs"
          >
            FREE AUDIT
            <ArrowUpRight className="hidden size-3 sm:inline-block" />
          </Link>

          <Link
            to="/book"
            className="hidden rounded-full border border-white/20 px-3.5 py-1.5 font-mono text-[10px] tracking-widest text-white transition-colors hover:border-[#FF3333] sm:px-5 sm:py-2 sm:text-xs md:inline-flex"
            activeProps={{ className: "border-[#FF3333]" }}
          >
            BOOK A CALL
          </Link>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={onNavigate ? undefined : menuOpen}
            onClick={openMenu}
            className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 font-mono text-[10px] tracking-widest text-white transition-colors after:absolute after:-inset-2 after:content-[''] hover:border-[#FF3333] sm:px-4 sm:py-2 sm:text-xs lg:hidden"
          >
            <Menu className="size-3.5" aria-hidden="true" />
            MENU
          </button>
        </div>
      </header>

      {!onNavigate && (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="right"
            className="w-full border-white/10 bg-[#0a0a14] p-0 sm:max-w-md [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Site menu</SheetTitle>
            <SheetDescription className="sr-only">Navigate to another page</SheetDescription>

            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <Logo variant="compact" size="sm" href="/" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-[#FF3333] hover:text-black"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Site" className="px-6 pb-10 pt-4">
              <ul>
                {MENU_NAV.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`group flex w-full items-center justify-between border-b border-white/10 py-4 text-left ${
                          active ? "text-[#FF3333]" : "text-white"
                        }`}
                      >
                        <span className="font-display text-3xl uppercase tracking-wide transition-colors group-hover:text-[#FF3333]">
                          {item.label}
                        </span>
                        <ArrowUpRight
                          className="size-4 text-white/40 transition-colors group-hover:text-[#FF3333]"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 border border-[#DFBA73]/30 bg-[#DFBA73]/5 p-5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F6DC9A]">
                  FREE 5-MINUTE AUDIT
                </span>
                <h3 className="mt-1 font-display text-xl uppercase text-white">
                  Is your website costing you clients?
                </h3>
                <Link
                  to="/audit"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#FF3333] px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-black transition-colors hover:bg-[#FF5555]"
                >
                  CLAIM FREE AUDIT <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-8 space-y-1 font-mono text-xs text-white/50">
                <a
                  href="mailto:rory@theroyeffect.com"
                  className="block transition-colors hover:text-[#FF3333]"
                >
                  rory@theroyeffect.com
                </a>
                <a href="tel:281-323-0450" className="block transition-colors hover:text-[#FF3333]">
                  (281) 323-0450
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

/** True once the page has scrolled past the top; used to firm up the header backdrop. */
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useScrollListener(() => setScrolled(window.scrollY > threshold));
  return scrolled;
}

function useScrollListener(handler: () => void) {
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        handler();
      });
    };
    handler();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
