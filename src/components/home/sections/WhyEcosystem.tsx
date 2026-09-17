import { ScrollReveal } from "@/components/ScrollReveal";
import { WHY } from "../content";

// Six systems placed around a hub. Left: floating alone. Right: wired together.
const NODES = [
  [36, 28],
  [160, 28],
  [176, 106],
  [148, 186],
  [50, 186],
  [24, 106],
] as const;
const HUB = [100, 106] as const;
const SCATTER = [
  [32, 36],
  [162, 20],
  [172, 128],
  [122, 196],
  [54, 160],
  [26, 88],
] as const;

function Diagram({ connected }: { connected: boolean }) {
  const points = connected ? NODES : SCATTER;
  return (
    <svg
      viewBox="0 0 200 212"
      role="img"
      aria-label={connected ? "Connected systems" : "Disconnected tools"}
    >
      {connected
        ? points.map(([x, y], i) => {
            const next = points[(i + 1) % points.length]!;
            return (
              <g key={`l-${x}-${y}`}>
                <line
                  x1={x}
                  y1={y}
                  x2={HUB[0]}
                  y2={HUB[1]}
                  stroke="rgba(255,51,51,0.7)"
                  strokeWidth="1"
                />
                <line
                  x1={x}
                  y1={y}
                  x2={next[0]}
                  y2={next[1]}
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="1"
                />
              </g>
            );
          })
        : null}
      {points.map(([x, y], i) => (
        <g key={`n-${x}-${y}`}>
          <rect
            x={x - 20}
            y={y - 8}
            width="40"
            height="16"
            fill="#0c0c0e"
            stroke={connected ? "rgba(255,51,51,0.8)" : "rgba(255,255,255,0.25)"}
          />
          <text
            x={x}
            y={y + 3}
            textAnchor="middle"
            fontSize="6"
            fontFamily="IBM Plex Mono, monospace"
            fill={connected ? "#fff" : "rgba(255,255,255,0.5)"}
          >
            {WHY.disconnected[i]?.slice(0, 8).toUpperCase()}
          </text>
        </g>
      ))}
      {connected ? (
        <g>
          <circle cx={HUB[0]} cy={HUB[1]} r="15" fill="#050505" stroke="#dfba73" />
          <text
            x={HUB[0]}
            y={HUB[1] + 3}
            textAnchor="middle"
            fontSize="8"
            fontFamily="Anton, Impact, sans-serif"
            fill="#dfba73"
          >
            R
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export function WhyEcosystem() {
  return (
    <section className="home-section" aria-labelledby="why-title">
      <div className="home-wrap home-why">
        <ScrollReveal>
          <p className="home-eyebrow">
            04 <b>/ Why The Roy Effect</b>
          </p>
          <h2 id="why-title" className="home-display home-section-title mt-5">
            {WHY.heading[0]}
            <br />
            <span className="xp-accent">{WHY.heading[1]}</span>
          </h2>
          <p className="home-section-lede mt-8">{WHY.body}</p>
        </ScrollReveal>
        <ScrollReveal className="home-why-diagram">
          <figure className="home-why-panel">
            <figcaption>Disconnected tools</figcaption>
            <Diagram connected={false} />
          </figure>
          <figure className="home-why-panel" data-connected="true">
            <figcaption>One connected system</figcaption>
            <Diagram connected />
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
