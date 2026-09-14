import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/Logo";
import { navPill } from "@/components/signal/signal-ui";

export interface SignalNavItem<T extends string = string> {
  key: T;
  label: string;
}

export interface SignalShellProps<T extends string = string> {
  /** Small red mono line above the headline — e.g. "STUDIO COMMAND HUB". */
  eyebrow: string;
  /** Headline that names the current view. */
  headline: string;
  nav: readonly SignalNavItem<T>[];
  activeKey: T;
  onNavigate: (key: T) => void;
  /** Links rendered after the nav pills — back to site, sign out, etc. */
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * The chrome shared by the studio hub and the client portal: perspective grid
 * backdrop, sticky-feeling blurred header, and a wrapping row of view pills.
 */
export function SignalShell<T extends string = string>({
  eyebrow,
  headline,
  nav,
  activeKey,
  onNavigate,
  actions,
  children,
}: SignalShellProps<T>) {
  return (
    <div className="signal-root relative min-h-screen overflow-hidden bg-[#030014]">
      <div className="signal-grid" aria-hidden="true" />

      <header className="relative z-10 flex flex-wrap items-center gap-4 border-b border-white/10 bg-[#030014]/85 px-6 py-4 backdrop-blur-md">
        <Link to="/" aria-label="The Roy Effect home" className="group shrink-0 outline-none">
          <LogoMark className="size-10" />
        </Link>
        <div className="min-w-0">
          <span className="font-mono text-[9px] tracking-[0.26em] text-[#FF3333]">{eyebrow}</span>
          <h1 className="text-[22px] uppercase leading-[1.1] text-white">{headline}</h1>
        </div>
        <nav className="ml-auto flex flex-wrap gap-2">
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onNavigate(item.key);
                window.scrollTo(0, 0);
              }}
              aria-current={item.key === activeKey ? "page" : undefined}
              className={navPill(item.key === activeKey)}
            >
              {item.label}
            </button>
          ))}
          {actions}
        </nav>
      </header>

      <main className="relative z-10 px-6 pb-20 pt-7">{children}</main>
    </div>
  );
}
