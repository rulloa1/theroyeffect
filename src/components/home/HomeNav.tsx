import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, X } from "lucide-react";

// 30 KB local emblem instead of the shared 1.2 MB PNG — this renders at 44px.
function NavMark({ className }: { className: string }) {
  return (
    <img
      src="/brand/roy-effect-emblem-512.webp"
      alt=""
      width={512}
      height={512}
      decoding="async"
      className={className}
    />
  );
}

const LINKS = [
  { label: "Services", href: "#services", internal: false },
  { label: "Work", href: "/work", internal: true },
  { label: "About", href: "/about", internal: true },
  { label: "Contact", href: "#contact", internal: false },
] as const;

/**
 * Minimal floating navigation. Transparent over the cinematic opening, then a
 * dark floating bar once the visitor is past it (watched via a sentinel, not
 * another scroll listener).
 */
export function HomeNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById("experience-end");
    if (!sentinel) {
      setSolid(true);
      return;
    }
    // A scroll check rather than IntersectionObserver: anchor jumps ("Skip the
    // intro", "Services") can leap past a zero-height sentinel without it ever
    // intersecting, which would leave the bar transparent over content.
    let raf = 0;
    const check = () => {
      raf = 0;
      setSolid(sentinel.getBoundingClientRect().top < 80);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const returnFocusTo = menuButtonRef.current;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      returnFocusTo?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="home-nav" data-solid={solid ? "true" : "false"}>
        <div className="home-nav-bar">
          <Link
            to="/"
            aria-label="The Roy Effect — home"
            className="inline-flex items-center gap-3"
          >
            <NavMark className="size-10 md:size-11" />
            <span className="hidden font-display text-sm uppercase tracking-[0.18em] text-white sm:inline">
              The Roy Effect
            </span>
          </Link>

          <nav aria-label="Primary" className="home-nav-links">
            {LINKS.map((link) =>
              link.internal ? (
                <Link key={link.label} to={link.href} className="home-link">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="home-link">
                  {link.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/brief" className="home-btn home-btn--primary home-nav-cta" data-magnetic>
              Start a project
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="home-nav-menu"
              aria-expanded={open}
              aria-controls="home-menu"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="home-menu"
          className="home-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between">
            <NavMark className="size-10" />
            <button
              ref={closeRef}
              type="button"
              className="home-nav-menu"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-4" aria-hidden="true" />
              Close
            </button>
          </div>
          <nav aria-label="Mobile">
            {LINKS.map((link) =>
              link.internal ? (
                <Link key={link.label} to={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ),
            )}
            <Link to="/brief" onClick={() => setOpen(false)} className="!text-[var(--home-red)]">
              Start a project
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
