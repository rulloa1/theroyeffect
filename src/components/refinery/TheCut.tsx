import { useCallback, useEffect, useRef, useState } from "react";
import { useClientReducedMotion } from "@/components/cinematic/useClientReducedMotion";
import afterAsset from "@/assets/cut-after.webp.asset.json";
import beforeAsset from "@/assets/cut-before.webp.asset.json";

const DEFAULT_SEAM = 50;

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
    }
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
      className="relative z-20 bg-[var(--veil-ground)] px-5 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">THE CUT</p>
        <h2 className="mt-4 max-w-5xl font-portfolio text-5xl font-bold leading-[0.92] text-white md:text-7xl">
          Same business. Better first impression.
        </h2>
        <p className="mt-7 max-w-4xl font-portfolio-body text-lg leading-relaxed text-white/75">
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

          <span className="pointer-events-none absolute left-3 top-3 bg-[var(--ground)]/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white md:left-5 md:top-5">
            Before
          </span>
          <span className="pointer-events-none absolute right-3 top-3 bg-[var(--ground)]/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white md:right-5 md:top-5">
            After
          </span>

          <div
            className={`the-cut-seam pointer-events-none absolute inset-y-0 left-0 w-0 ${settling && !motionDisabled ? "the-cut-settling" : ""}`}
            style={{ transform: `translate3d(${seam}%, 0, 0)`, left: `${seam}%` }}
            aria-hidden
          >
            <span className="absolute inset-y-0 left-[-1px] w-0.5 bg-[var(--gold)]" />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Before and after comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(seam)}
            aria-valuetext={`${Math.round(seam)}% showing the redesign`}
            onKeyDown={onKeyDown}
            className={`the-cut-handle absolute top-1/2 z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[var(--ground)] text-[var(--gold)] ${settling && !motionDisabled ? "the-cut-settling" : ""}`}
            style={{ left: `${seam}%` }}
          >
            <span aria-hidden className="font-mono text-sm leading-none">
              ‹›
            </span>
          </div>
          <span
            ref={cursorRef}
            aria-hidden
            className={`the-cut-cursor pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+12px)] bg-[var(--gold)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--ground)] ${cursorVisible && !motionDisabled ? "the-cut-cursor-visible" : ""}`}
          >
            Drag
          </span>
        </div>

        <p className="mt-5 max-w-4xl font-portfolio-body text-sm leading-relaxed text-white/60">
          Concept study: a redesign of a fictional Houston cabinetmaker, made to show the process.
          Real client projects are in Selected Work below.
        </p>
      </div>
    </section>
  );
}
