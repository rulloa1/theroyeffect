import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { studyDisclosure, WORK_STUDIES } from "@/lib/work-studies";
import { Sheet } from "./Sheet";

/** Sheet 4: every note is lifted from work-studies.ts, so this and /work/$slug agree.
 *  The sheet is scoped to the invented studies — real studio-owned projects
 *  (those with their own `disclosure`) live on /work instead. */
export function StudiesSheet() {
  const [first, ...rest] = WORK_STUDIES.filter((study) => !study.disclosure);

  return (
    <Sheet id="studies" labelledBy="mk-h-studies">
      <div className="mk-grid">
        <div className="mk-margin">
          <p className="mk-label">
            Sheet 4 / 6<b>Studies</b>
          </p>
        </div>
        <div className="mk-stack">
          <h2 id="mk-h-studies">Three studies, marked up and fixed.</h2>
          <p className="mk-lead">
            Each is an invented Houston business, used to show how the work runs from the first note
            to the finished site.
          </p>
        </div>
      </div>

      <div style={{ marginTop: "clamp(40px, 5vw, 64px)" }}>
        {first ? (
          <article className="mk-study mk-rv" aria-labelledby={`mk-s-${first.slug}`}>
            <div className="mk-study-meta">
              <p className="mk-label">
                Study {first.index}
                <b>Invented business</b>
              </p>
            </div>
            <div className="mk-study-compact">
              <figure className="mk-plate">
                <img
                  src={first.image}
                  width={1200}
                  height={750}
                  alt={first.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <div className="mk-study-text">
                <p className="mk-label">{first.sector}</p>
                <h3 id={`mk-s-${first.slug}`}>{first.name}</h3>
                <p>The one marked up and fixed above.</p>
                <Link to="/work/$slug" params={{ slug: first.slug }} className="mk-link">
                  Read the study <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        ) : null}

        {rest.map((study, i) => (
          <article
            key={study.slug}
            className="mk-study mk-rv"
            style={{ "--k": i + 1 } as CSSProperties}
            aria-labelledby={`mk-s-${study.slug}`}
          >
            <div className="mk-study-meta">
              <p className="mk-label">
                Study {study.index}
                <b>From the audit</b>
              </p>
              <ol className="mk-study-notes" aria-label="Notes from the audit">
                {study.problems.slice(0, 3).map((problem, j) => (
                  <li key={problem}>
                    <span className="mk-note-no">0{j + 1}</span>
                    {problem}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mk-study-body">
              <figure className="mk-plate">
                <img
                  src={study.image}
                  width={1200}
                  height={750}
                  alt={study.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <div className="mk-study-text">
                <p className="mk-label">{study.sector}</p>
                <h3 id={`mk-s-${study.slug}`}>{study.name}</h3>
                <p>{study.summary}</p>
                <p className="mk-cap">{studyDisclosure(study)}</p>
                <Link to="/work/$slug" params={{ slug: study.slug }} className="mk-link">
                  Read the study <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Sheet>
  );
}
