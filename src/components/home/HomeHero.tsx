import { Link } from "@tanstack/react-router";

/** Cinematic space-noir hero: centered emblem, headline, two CTAs. */
export function HomeHero() {
  return (
    <section className="hh" aria-labelledby="hh-title">
      <div className="hh-glow hh-glow--red" aria-hidden="true" />
      <div className="hh-glow hh-glow--gold" aria-hidden="true" />
      <div className="hh-stars" aria-hidden="true" />
      <span className="hh-rule hh-rule--tl" aria-hidden="true" />
      <span className="hh-rule hh-rule--br" aria-hidden="true" />

      <div className="hh-inner">
        <div className="hh-emblem">
          <img
            src="/brand/roy-effect-emblem-512.webp"
            alt="The Roy Effect emblem"
            width={112}
            height={112}
            fetchPriority="high"
          />
        </div>

        <div className="hh-label">
          <span className="hh-line" aria-hidden="true" />
          <span>Stand out online</span>
          <span className="hh-line hh-line--r" aria-hidden="true" />
        </div>

        <h1 id="hh-title" className="hh-title">
          The Roy <span>Effect</span>
        </h1>

        <p className="hh-sub">
          I build websites, AI and automation that turn{" "}
          <span>attention into customers</span>.
        </p>

        <div className="hh-ctas">
          <Link to="/audit" className="hh-btn hh-btn--primary">
            Free audit
          </Link>
          <Link to="/book" className="hh-btn hh-btn--ghost">
            Book a call
          </Link>
        </div>

        <ul className="hh-services" aria-label="Services">
          <li>Strategy</li>
          <li>Websites</li>
          <li>AI</li>
          <li>Automation</li>
          <li>Growth</li>
        </ul>
      </div>
    </section>
  );
}
