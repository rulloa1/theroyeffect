import { useCallback, useEffect, useRef, useState } from "react";
import { useClientReducedMotion } from "@/components/cinematic/useClientReducedMotion";
import { ScrollReveal } from "@/components/ScrollReveal";
import afterAsset from "@/assets/cut-after.webp.asset.json";
import beforeAsset from "@/assets/cut-before.webp.asset.json";

const DEFAULT_SEAM = 50;
const CUT_WORDS = ["Better", "Sharper", "Clearer"] as const;

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function TheCut() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const draggingPointer = useRef<number | null>(null);
  const hintPlayed = useRef(false);
  const cursorFrame = useRef(0);
  const cursorTarget = useRef({ x: 0, y: 0 });
  const cursorCurrent = useRef({ x: 0, y: 0 });
  const [seam, setSeam] = useState(DEFAULT_SEAM);
  const [settling, setSettling] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const motionDisabled = useClientReducedMotion();

  const updateSeam = useCallback((value: number, shouldSettle = false) => {
    setSettling(shouldSettle);
    setSeam(clamp(value));
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number, shouldSettle = false) => {
      const frame = frameRef.current;
      if (!frame) return;
      const bounds = frame.getBoundingClientRect();
      updateSeam(((clientX - bounds.left) / bounds.width) * 100, shouldSettle);
    },
    [updateSeam],
  );

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("refinery:seam", { detail: { value: seam } }));
  }, [seam]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || motionDisabled || hintPlayed.current) return;
    let startTimer = 0;
    let returnTimer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hintPlayed.current) return;
        hintPlayed.current = true;
        observer.disconnect();
        startTimer = window.setTimeout(() => {
          updateSeam(42, true);
          returnTimer = window.setTimeout(() => updateSeam(DEFAULT_SEAM, true), 450);
        }, 1500);
      },
      { threshold: 0.35 },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      window.clearTimeout(startTimer);
      window.clearTimeout(returnTimer);
    };
  }, [motionDisabled, updateSeam]);

  useEffect(() => {
    if (motionDisabled) {
      cancelAnimationFrame(cursorFrame.current);
      setCursorVisible(false);
      setWordIndex(0);
    }
  }, [motionDisabled]);

  useEffect(() => {
    if (motionDisabled) return;
    const interval = window.setInterval(
      () => setWordIndex((current) => (current + 1) % CUT_WORDS.length),
      3200,
    );
    return () => window.clearInterval(interval);
  }, [motionDisabled]);

  const moveCursor = useCallback(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const current = cursorCurrent.current;
    const target = cursorTarget.current;
    current.x += (target.x - current.x) * 0.2;
    current.y += (target.y - current.y) * 0.2;
    cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    if (Math.abs(target.x - current.x) > 0.1 || Math.abs(target.y - current.y) > 0.1)
      cursorFrame.current = requestAnimationFrame(moveCursor);
    else cursorFrame.current = 0;
  }, []);

  const trackCursor = (clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame || motionDisabled || !window.matchMedia("(pointer: fine)").matches) return;
    const bounds = frame.getBoundingClientRect();
    cursorTarget.current = { x: clientX - bounds.left, y: clientY - bounds.top };
    if (!cursorVisible) cursorCurrent.current = cursorTarget.current;
    setCursorVisible(true);
    if (!cursorFrame.current) cursorFrame.current = requestAnimationFrame(moveCursor);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingPointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX);
    trackCursor(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    trackCursor(event.clientX, event.clientY);
    if (draggingPointer.current === event.pointerId) updateFromPointer(event.clientX);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingPointer.current !== event.pointerId) return;
    draggingPointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setSettling(!motionDisabled);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let next = seam;
    if (event.key === "ArrowLeft") next -= event.shiftKey ? 20 : 5;
    else if (event.key === "ArrowRight") next += event.shiftKey ? 20 : 5;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;
    else return;
    event.preventDefault();
    updateSeam(next, !motionDisabled);
  };

  return (
    <section
      data-refinery-chapter="cut"
      className="relative z-20 bg-[var(--veil-ground)] px-[var(--gutter)] py-[var(--section-y)]"
    >
      <ScrollReveal chapterSeam respectEffectsGuard />
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">THE CUT</p>
        <h2
          aria-label="Same business. Better first impression."
          className="mt-4 max-w-5xl font-portfolio text-[length:var(--type-h2)] font-bold leading-none text-[var(--ink)]"
        >
          Same business.{" "}
          <span aria-hidden className="the-cut-word-cycle inline-grid text-[var(--gold)]">
            {CUT_WORDS.map((word, index) => (
              <span
                key={word}
                className="col-start-1 row-start-1 transition-[opacity,transform] duration-[var(--dur-reveal)] ease-[var(--ease-refine)]"
                data-active={index === wordIndex}
              >
                {word}
              </span>
            ))}
          </span>
          <br />
          first impression.
        </h2>
        <p className="mt-7 max-w-[52ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
          Drag the line to compare. Left is a typical small-business site; right is the same
          business after a Roy Effect redesign.
        </p>

        <div
          ref={frameRef}
          className="the-cut-frame relative mt-10 aspect-[16/10] w-full touch-pan-y overflow-hidden border border-[var(--line)] bg-[var(--ground-raised)] select-none md:mt-14"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerEnter={(event) => trackCursor(event.clientX, event.clientY)}
          onPointerLeave={() => {
            if (draggingPointer.current === null) setCursorVisible(false);
          }}
        >
          <img
            src={beforeAsset.url}
            alt="Before: dated Marlow & Sons Cabinetry homepage with a stock slider and blue navigation bar"
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <div
            className={`the-cut-after pointer-events-none absolute inset-0 ${settling && !motionDisabled ? "the-cut-settling" : ""}`}
            style={{ clipPath: `inset(0 0 0 ${seam}%)` }}
          >
            <img
              src={afterAsset.url}
              alt="After: redesigned Marlow & Sons homepage with a clear headline, booking button and shop illustration"
              width={1440}
              height={900}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 size-full object-cover"
            />
          </div>

          <span className="pointer-events-none absolute left-3 top-3 bg-[var(--ground)]/85 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] md:left-5 md:top-5">
            Before
          </span>
          <span className="pointer-events-none absolute right-3 top-3 bg-[var(--ground)]/85 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] md:right-5 md:top-5">
            After
          </span>

          <div
            className={`the-cut-seam pointer-events-none absolute inset-y-0 left-0 w-full ${settling && !motionDisabled ? "the-cut-settling" : ""}`}
            style={{ transform: `translate3d(${seam}%, 0, 0)` }}
            aria-hidden
          >
            <span className="absolute inset-y-0 left-[-1px] w-0.5 bg-[var(--gold)]" />
          </div>
          <div
            className={`the-cut-handle pointer-events-none absolute inset-y-0 left-0 z-10 w-full ${settling && !motionDisabled ? "the-cut-settling" : ""}`}
            style={{ transform: `translate3d(${seam}%, 0, 0)` }}
          >
            <div
              role="slider"
              tabIndex={0}
              aria-label="Before and after comparison"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(seam)}
              aria-valuetext={`${Math.round(seam)}% showing the redesign`}
              onKeyDown={onKeyDown}
              className="pointer-events-auto absolute left-0 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[var(--ground)] text-[var(--gold)]"
            >
              <span aria-hidden className="font-mono text-sm leading-none">
                ‹›
              </span>
            </div>
          </div>
          <span
            ref={cursorRef}
            aria-hidden
            className={`the-cut-cursor pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+12px)] bg-[var(--gold)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ground)] ${cursorVisible && !motionDisabled ? "the-cut-cursor-visible" : ""}`}
          >
            Drag
          </span>
        </div>

        <p className="mt-5 max-w-[60ch] font-portfolio-body text-sm leading-relaxed text-[var(--ink-faint)]">
          Concept study: a redesign of a fictional Houston cabinetmaker, made to show the process.
          The full study is in Selected Work below.
        </p>
      </div>
    </section>
  );
}
