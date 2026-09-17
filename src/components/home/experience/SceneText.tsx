import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AI_WORKFLOW,
  AUTOMATION_FLOW,
  AUTOMATION_MODULES,
  BRAND,
  GROWTH_SIGNALS,
  SCENES,
  type SceneCopy,
} from "../content";

function sceneById(id: SceneCopy["id"]) {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Missing scene copy: ${id}`);
  return scene;
}

function MaskedLines({ lines, accentLast = false }: { lines: string[]; accentLast?: boolean }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className="xp-line">
          <span
            className={`xp-line-inner ${accentLast && i === lines.length - 1 ? "xp-accent" : ""}`}
          >
            {line}
          </span>
        </span>
      ))}
    </>
  );
}

function SceneShell({
  id,
  position,
  children,
}: {
  id: SceneCopy["id"];
  position: string;
  children: ReactNode;
}) {
  const scene = sceneById(id);
  return (
    <div className={`xp-scene xp-scene--${id} ${position}`} data-scene={id}>
      <p className="xp-kicker xp-reveal" aria-hidden="true">
        <span className="xp-kicker-index">{scene.index}</span>
        {scene.label}
      </p>
      {children}
    </div>
  );
}

function Arrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="xp-arrow">
      <path
        d={direction === "up" ? "M8 13V3M3.5 7.5 8 3l4.5 4.5" : "M8 3v10M3.5 8.5 8 13l4.5-4.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function SceneText({ onRevealFocus }: { onRevealFocus: () => void }) {
  const arrival = sceneById("arrival");
  const websites = sceneById("websites");
  const ai = sceneById("ai");
  const automation = sceneById("automation");
  const growth = sceneById("growth");
  const reveal = sceneById("reveal");

  return (
    <div className="xp-copy">
      {/* 01 — Arrival. The page's single H1. */}
      <div className="xp-scene xp-scene--arrival xp-pos-bottom" data-scene="arrival">
        <h1
          className="xp-title xp-title--brand"
          aria-label="The Roy Effect — websites, AI and automation that help businesses stand out online"
        >
          {arrival.lines.map((line, li) => (
            <span key={line} className="xp-line">
              <span className="xp-line-inner">
                {Array.from(line).map((ch, ci) => (
                  <span key={`${li}-${ci}`} className="xp-char" data-intro-char>
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </span>
              {li < arrival.lines.length - 1 ? " " : null}
            </span>
          ))}
          <span className="sr-only">
            {" "}
            — websites, AI and automation that help businesses stand out online
          </span>
        </h1>
        <div className="xp-arrival-meta">
          <p className="xp-tagline" data-intro>
            {arrival.body?.[0]}
          </p>
          <p className="xp-pillars-inline" data-intro>
            {BRAND.pillars.join("  ·  ")}
          </p>
        </div>
      </div>

      {/* 02 — Websites */}
      <SceneShell id="websites" position="xp-pos-left">
        <h2 className="xp-title">
          <MaskedLines lines={websites.lines} accentLast />
        </h2>
        {websites.body?.map((line) => (
          <p key={line} className="xp-body xp-reveal">
            {line}
          </p>
        ))}
      </SceneShell>

      {/* 03 — AI */}
      <SceneShell id="ai" position="xp-pos-bottom-left">
        <h2 className="xp-title">
          <MaskedLines lines={ai.lines} accentLast />
        </h2>
        {ai.body?.map((line) => (
          <p key={line} className="xp-body xp-reveal">
            {line}
          </p>
        ))}
        <ol className="xp-flow xp-reveal" aria-label="How an AI agent handles a new lead">
          {AI_WORKFLOW.map((step, i) => (
            <li key={step} data-final={i === AI_WORKFLOW.length - 1 ? "" : undefined}>
              {step}
            </li>
          ))}
        </ol>
      </SceneShell>

      {/* 04 — Automation */}
      <SceneShell id="automation" position="xp-pos-left">
        <h2 className="xp-title">
          <MaskedLines lines={automation.lines} accentLast />
        </h2>
        {automation.body?.map((line) => (
          <p key={line} className="xp-body xp-reveal">
            {line}
          </p>
        ))}
        <p className="sr-only">Systems connected: {AUTOMATION_MODULES.join(", ")}.</p>
        <ol className="xp-flow xp-reveal" aria-label="Example automated flow">
          {AUTOMATION_FLOW.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </SceneShell>

      {/* 05 — Growth */}
      <SceneShell id="growth" position="xp-pos-left">
        <h2 className="xp-title xp-title--stack">
          <MaskedLines lines={growth.lines} accentLast />
        </h2>
        <p className="xp-body xp-body--strong xp-reveal">{growth.body?.[0]}</p>
        <ul className="xp-signals" aria-label="What the system is built to move">
          {GROWTH_SIGNALS.map((signal) => (
            <li key={signal.label} className="xp-reveal" data-direction={signal.direction}>
              <span>{signal.label}</span>
              <Arrow direction={signal.direction} />
              <span className="sr-only">{signal.direction === "up" ? "increase" : "decrease"}</span>
            </li>
          ))}
        </ul>
      </SceneShell>

      {/* 06 — Reveal. Not a heading: the brand name is already the H1. */}
      <div
        className="xp-scene xp-scene--reveal xp-pos-reveal"
        data-scene="reveal"
        onFocus={onRevealFocus}
      >
        <p className="xp-title xp-title--reveal" aria-hidden="true">
          <MaskedLines lines={reveal.lines} />
        </p>
        <p className="xp-tagline xp-reveal">{reveal.body?.[0]}</p>
        <ul className="xp-pillars xp-reveal" aria-label="What we do">
          {BRAND.pillars.map((pillar) => (
            <li key={pillar}>{pillar}</li>
          ))}
        </ul>
        <div className="xp-cta-row xp-reveal">
          <a href="#services" className="home-btn home-btn--primary" data-magnetic>
            Experience the effect
          </a>
          <Link to="/work" className="home-btn home-btn--ghost" data-magnetic>
            See our work
          </Link>
        </div>
      </div>
    </div>
  );
}
