import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import beforeAsset from "@/assets/cut-before.webp.asset.json";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";
import { motionAllowedNow } from "./motion";

type Note = { pin: string; rank: 1 | 2 | 3; label: string; x: number; y: number; body: ReactNode };

// Ranked the way the Marlow & Sons study ranks its own findings: messaging first,
// the quote path second, the logo third. x / y are percentages of the screenshot.
const NOTES: Note[] = [
  {
    pin: "mk-p1",
    rank: 1,
    label: "Fix first",
    x: 40,
    y: 12.4,
    body: (
      <>
        The first line after the name is <q>Quality cabinets at affordable prices.</q> So is every
        shop in Texas. Say what you build, and where.
      </>
    ),
  },
  {
    pin: "mk-p2",
    rank: 2,
    label: "Fix next",
    x: 33,
    y: 97.6,
    body: "The line that asks for the job is the last one on the page, and it isn't a button. On a phone, the quote form is three taps deep.",
  },
  {
    pin: "mk-p3",
    rank: 3,
    label: "Then",
    x: 27.4,
    y: 8,
    body: "Five versions of the logo are in circulation. None of them holds up at small sizes.",
  },
];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Sheet 1: a real homepage, marked up. Notes sit level with their pins on desktop. */
export function HeroMarkup() {
  const markupRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLOListElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(false);
  const [hot, setHot] = useState<string | null>(null);

  const layout = useCallback(() => {
    const mk = markupRef.current;
    const notesEl = notesRef.current;
    const shot = shotRef.current;
    if (!mk || !notesEl || !shot) return;
    const noteEls = Array.from(notesEl.querySelectorAll<HTMLElement>(".mk-note"));
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      noteEls.forEach((n) => (n.style.top = ""));
      return;
    }
    const mr = mk.getBoundingClientRect();
    const nr = notesEl.getBoundingClientRect();
    const sr = shot.getBoundingClientRect();
    const LBL = 9;
    const GAP = 22;
    const items = noteEls
      .map((n) => {
        const def = NOTES.find((d) => d.pin === n.dataset["pin"]);
        const pin = def ? document.getElementById(def.pin) : null;
        if (!def || !pin) return null;
        const px = sr.left + (sr.width * def.x) / 100;
        const py = sr.top + (sr.height * def.y) / 100;
        return { n, pinId: def.pin, px, py, r: pin.offsetWidth / 2, cy: py - nr.top, h: n.offsetHeight, y: 0 };
      })
      .filter((it): it is NonNullable<typeof it> => it !== null)
      .sort((a, b) => a.cy - b.cy);

    let y = 0;
    for (const it of items) {
      it.y = Math.max(it.cy - LBL, y);
      y = it.y + it.h + GAP;
    }
    for (let i = items.length - 1; i >= 0; i--) {
      const next = items[i + 1];
      const lim = (next ? next.y - GAP : nr.height) - items[i]!.h;
      if (items[i]!.y > lim) items[i]!.y = Math.max(0, lim);
    }
    for (const it of items) {
      it.n.style.top = `${it.y}px`;
      const leader = mk.querySelector<HTMLElement>(`.mk-leader[data-for="${it.pinId}"]`);
      if (!leader) continue;
      const ax = nr.right - mr.left + 10;
      const ay = nr.top - mr.top + it.y + LBL;
      const dx = it.px - mr.left - ax;
      const dy = it.py - mr.top - ay;
      const len = Math.hypot(dx, dy) - it.r - 3;
      leader.style.left = `${ax}px`;
      leader.style.top = `${ay}px`;
      leader.style.width = `${Math.max(0, len)}px`;
      leader.style.setProperty("--rot", `${Math.atan2(dy, dx)}rad`);
    }
  }, []);

  useIsoLayoutEffect(() => {
    layout();
    const mk = markupRef.current;
    if (!mk) return;
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => layout());
      ro.observe(mk);
    } else {
      window.addEventListener("resize", layout);
    }
    void document.fonts.ready.then(layout);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", layout);
    };
  }, [layout]);

  // The notes land when 30% of the markup is on screen — on a phone that's when
  // the visitor reaches it, not off-screen at load.
  useEffect(() => {
    const mk = markupRef.current;
    if (!mk) return;
    if (!motionAllowedNow() || !("IntersectionObserver" in window)) {
      setLanded(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLanded(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(mk);
    return () => io.disconnect();
  }, []);

  const hoverProps = (pin: string) => ({
    onMouseEnter: () => setHot(pin),
    onMouseLeave: () => setHot(null),
  });

  return (
    <section className="mk-sheet mk-hero is-in" id="top" aria-labelledby="mk-h-top">
      <div className="mk-wrap">
        <div className="mk-grid">
          <div className="mk-margin">
            <p className="mk-label">
              Sheet 1 / 6<b>The markup</b>
            </p>
          </div>
          <div className="mk-stack">
            <h1 className="mk-display" id="mk-h-top">
              Your work is better than your website.
            </h1>
            <p className="mk-lead">
              Send me the URL. Within one business day you get a five-minute video of me going
              through it on a phone, cold, with three fixes ranked by impact. No call. No pitch.
            </p>
            <div className="mk-cta-row">
              <Link
                to="/audit"
                className="mk-btn mk-btn-pen"
                onClick={() => trackAnalyticsEvent("audit_cta_click", { placement: "hero" })}
              >
                Audit my site
              </Link>
              <Link to="/" hash="fixed" className="mk-link">
                See it fixed <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </div>

        <div
          ref={markupRef}
          className={`mk-markup mk-grid${landed ? " is-land" : ""}${hot ? " is-focusing" : ""}`}
        >
          <ol ref={notesRef} className="mk-notes" aria-label="Three notes from the audit, ranked by impact">
            {NOTES.map((n) => (
              <li
                key={n.pin}
                className={`mk-note${hot === n.pin ? " is-hot" : ""}`}
                data-pin={n.pin}
                data-rank={n.rank}
                style={{ "--i": n.rank - 1 } as CSSProperties}
                {...hoverProps(n.pin)}
              >
                <span className="mk-note-no">
                  0{n.rank} <em>{n.label}</em>
                </span>
                <p>{n.body}</p>
              </li>
            ))}
          </ol>
          <figure className="mk-plate">
            <div className="mk-chrome" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>Homepage · as found</span>
            </div>
            <div ref={shotRef} className="mk-shot">
              <img
                src={beforeAsset.url}
                width={1440}
                height={900}
                alt="The Marlow & Sons Cabinetry homepage before the redesign: a red free-estimates banner, a centred serif logo, a blue navigation bar, a grey image slider, a welcome paragraph, three cards with image placeholders, and a call-for-estimate line at the bottom."
                fetchPriority="high"
                decoding="async"
              />
              {NOTES.map((n) => (
                <span
                  key={n.pin}
                  id={n.pin}
                  className={`mk-pin${hot === n.pin ? " is-hot" : ""}`}
                  data-rank={n.rank}
                  aria-hidden="true"
                  style={{ "--x": n.x, "--y": n.y, "--i": n.rank - 1 } as CSSProperties}
                  {...hoverProps(n.pin)}
                >
                  {n.rank}
                </span>
              ))}
            </div>
            <figcaption>
              Concept study. Marlow &amp; Sons Cabinetry is an invented Spring, TX business, used to
              show how the work runs end to end — not a client engagement.
            </figcaption>
          </figure>
          {NOTES.map((n) => (
            <span
              key={`leader-${n.pin}`}
              className="mk-leader"
              data-for={n.pin}
              aria-hidden="true"
              style={{ "--i": n.rank - 1 } as CSSProperties}
            />
          ))}
        </div>
        <div className="mk-grid">
          <div />
          <p className="mk-label mk-placed">Numbered by impact. Placed where they occur.</p>
        </div>
      </div>
    </section>
  );
}
