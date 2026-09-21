import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/roy-effect-logo-192.webp.asset.json";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";
import { motionAllowedNow } from "./motion";

/** Scroll to the form and put the cursor in its first empty field. */
function jumpToForm(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const form = document.getElementById(id);
  if (!form) return;
  e.preventDefault();
  const smooth = motionAllowedNow();
  form.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement>("input:not([type=checkbox]), select, textarea"),
  );
  const target = fields.find((f) => !f.value) ?? fields[0];
  target?.focus({ preventScroll: true });
}

const ANCHORS = [
  { label: "The audit", hash: "audit" },
  { label: "Studies", hash: "studies" },
  { label: "Pricing", hash: "after" },
] as const;

export function MarkupHeader({ ctaFormId }: { ctaFormId?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  // Escape closes the menu and hands focus back to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btnRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="mk-hdr">
      <div className="mk-wrap">
        <Link to="/" className="mk-brand" aria-label="The Roy Effect home">
          <img src={logoAsset.url} width={34} height={34} alt="" decoding="async" />
          <span className="mk-brand-name">
            The Roy Effect<small>Houston</small>
          </span>
        </Link>
        <nav className="mk-nav" aria-label="Primary">
          {ANCHORS.map((a) => (
            <Link key={a.hash} to="/" hash={a.hash}>
              {a.label}
            </Link>
          ))}
          <Link to="/brief">Start a project</Link>
        </nav>
        {ctaFormId ? (
          <a
            href={`#${ctaFormId}`}
            className="mk-btn mk-hdr-cta"
            onClick={(e) => jumpToForm(e, ctaFormId)}
          >
            Audit my site
          </a>
        ) : (
          <Link
            to="/audit"
            className="mk-btn mk-hdr-cta"
            onClick={() => trackAnalyticsEvent("audit_cta_click", { placement: "header" })}
          >
            Audit my site
          </Link>
        )}
        <button
          ref={btnRef}
          type="button"
          className="mk-menu-btn"
          aria-expanded={open}
          aria-controls="mk-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" />
          <b className="mk-sr">{open ? "Close menu" : "Menu"}</b>
        </button>
      </div>
      <nav id="mk-menu" className="mk-menu mk-wrap" aria-label="Mobile" hidden={!open}>
        {ANCHORS.map((a) => (
          <Link key={a.hash} to="/" hash={a.hash} onClick={close}>
            {a.label}
          </Link>
        ))}
        <Link to="/brief" onClick={close}>
          Start a project
        </Link>
      </nav>
    </header>
  );
}
