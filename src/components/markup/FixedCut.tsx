import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import beforeAsset from "@/assets/cut-before.webp.asset.json";
import afterAsset from "@/assets/cut-after.webp.asset.json";
import { motionAllowedNow } from "./motion";
import { Sheet } from "./Sheet";

const FIXES = [
  "The first line now says what they build, where, and who installs it.",
  <>
    <q>Book a free measure visit</q> is a button on the first screen, and tap-to-call sits in the header.
  </>,
  "One mark with a small-size version, used on the site, the invoices and the truck.",
];

/**
 * Sheet 2: the same site, as found and redesigned. The seam is two
 * counter-translated layers (transform only), so dragging never repaints the image.
 */
export function FixedCut() {
  const cutRef = useRef<HTMLDivElement>(null);
  const [seam, setSeamState] = useState(50);
  const seamRef = useRef(50);
  const dragRef = useRef<number | null>(null);
  const animsRef = useRef<Animation[]>([]);

  const setSeam = (v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    seamRef.current = clamped;
    setSeamState(clamped);
  };
  const stopAnims = () => {
    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];
  };

  // On first entry the seam sweeps from "as found" to half and half: the notes becoming the redesign.
  useEffect(() => {
    const cut = cutRef.current;
    if (!cut || !motionAllowedNow() || !("IntersectionObserver" in window) || !cut.animate) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        if (dragRef.current !== null) return;
        const q = (s: string) => cut.querySelector<HTMLElement>(s);
        const after = q(".mk-cut-after");
        const afterImg = q(".mk-cut-after img");
        const seamEl = q(".mk-cut-seam");
        const handleWrap = q(".mk-cut-hwrap");
        if (!after || !afterImg || !seamEl || !handleWrap) return;
        const opts: KeyframeAnimationOptions = { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)" };
        const slide = [{ transform: "translateX(100%)" }, { transform: "translateX(50%)" }];
        animsRef.current = [
          after.animate(slide, opts),
          afterImg.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(-50%)" }], opts),
          seamEl.animate(slide, opts),
          handleWrap.animate(slide, opts),
        ];
      },
      { threshold: 0.55 },
    );
    io.observe(cut);
    return () => io.disconnect();
  }, []);

  const moveTo = (clientX: number) => {
    const cut = cutRef.current;
    if (!cut) return;
    const r = cut.getBoundingClientRect();
    setSeam(((clientX - r.left) / r.width) * 100);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    stopAnims();
    dragRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current === e.pointerId) moveTo(e.clientX);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current === e.pointerId) dragRef.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let v = seamRef.current;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        v -= e.shiftKey ? 20 : 5;
        break;
      case "ArrowRight":
      case "ArrowUp":
        v += e.shiftKey ? 20 : 5;
        break;
      case "Home":
        v = 0;
        break;
      case "End":
        v = 100;
        break;
      default:
        return;
    }
    e.preventDefault();
    stopAnims();
    setSeam(v);
  };

  const shown = Math.round(100 - seam);

  return (
    <Sheet id="fixed" labelledBy="mk-h-fixed">
      <div className="mk-grid">
        <div className="mk-margin">
          <p className="mk-label">
            Sheet 2 / 6<b>Fixed</b>
          </p>
        </div>
        <div className="mk-stack">
          <h2 id="mk-h-fixed">Same shop. Three notes later.</h2>
          <p className="mk-lead">
            Drag the line. Left is the site as I found it; right is the redesign those three notes turned into.
          </p>
        </div>
      </div>
      <div className="mk-grid mk-cut-row" style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
        <ol className="mk-fixes" aria-label="What each note became">
          {FIXES.map((fix, i) => (
            <li key={i} className="mk-rv" style={{ "--k": i } as CSSProperties}>
              <span className="mk-note-no">0{i + 1} Fixed</span>
              <p>{fix}</p>
            </li>
          ))}
        </ol>
        <figure className="mk-plate mk-rv">
          <div className="mk-chrome" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>Homepage · as found / redesign</span>
          </div>
          <div
            ref={cutRef}
            className="mk-cut"
            style={{ "--seam": seam } as CSSProperties}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <img src={beforeAsset.url} width={1440} height={900} alt="Before: the dated Marlow & Sons homepage." draggable={false} loading="lazy" decoding="async" />
            <div className="mk-cut-after">
              <img
                src={afterAsset.url}
                width={1440}
                height={900}
                alt="After: the redesigned Marlow & Sons homepage — a headline about cabinets built in their Spring shop, a Book a free measure visit button, the phone number in the header, and an illustrated kitchen."
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mk-cut-seam" aria-hidden="true">
              <span />
            </div>
            <div className="mk-cut-hwrap">
              <div
                className="mk-cut-handle"
                role="slider"
                tabIndex={0}
                aria-label="Before and after comparison"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(seam)}
                aria-valuetext={`${shown} percent of the redesign showing`}
                onKeyDown={onKeyDown}
              >
                <span aria-hidden="true">‹›</span>
              </div>
            </div>
            <span className="mk-cut-tag is-l" aria-hidden="true">As found</span>
            <span className="mk-cut-tag is-r" aria-hidden="true">Redesign</span>
          </div>
          <figcaption>
            Same invented business as above.
            <Link to="/work/$slug" params={{ slug: "marlow-sons-cabinetry" }} className="mk-link">
              Read the full study <span aria-hidden="true">→</span>
            </Link>
          </figcaption>
        </figure>
      </div>
    </Sheet>
  );
}
