import { useEffect, useRef, type ReactNode } from "react";
import { MarkupHeader } from "./MarkupHeader";
import { MarkupFooter } from "./MarkupFooter";

/**
 * Paper shell for pages built on The Markup: header, main, back-cover footer.
 * `ctaFormId`: on a page that already holds the audit form, the header button
 * jumps to that form instead of linking to the page the visitor is on.
 */
export function MarkupShell({ children, ctaFormId }: { children: ReactNode; ctaFormId?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // One red button per screen: the header button takes the red only while no
  // other red button is on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cta = root.querySelector<HTMLElement>(".mk-hdr-cta");
    if (!cta) return;
    const pens = Array.from(root.querySelectorAll<HTMLElement>("main .mk-btn-pen"));
    if (pens.length === 0 || !("IntersectionObserver" in window)) {
      cta.classList.toggle("is-live", pens.length === 0);
      return;
    }
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        }
        cta.classList.toggle("is-live", seen.size === 0);
      },
      { rootMargin: "-64px 0px 0px 0px" },
    );
    pens.forEach((pen) => io.observe(pen));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="mk">
      <MarkupHeader ctaFormId={ctaFormId} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <MarkupFooter />
    </div>
  );
}
