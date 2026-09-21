import type { CSSProperties } from "react";
import portraitAsset from "@/assets/rory-portrait-clean.webp.asset.json";
import { Sheet } from "./Sheet";
import { UrlForm } from "./UrlForm";

export const AUDIT_STEPS = [
  ["You send the URL.", "Nothing else. No login, no call booked, no questionnaire."],
  ["I open it the way a customer would.", "On a phone first, cold, with no context. Then on a laptop."],
  [
    "You get the video within one business day.",
    "Five minutes, screen-recorded, with the three changes that would bring in the most enquiries, ranked.",
  ],
  ["If you want them made, we talk.", "If not, the video and the notes are yours to keep."],
] as const;

export function AuditSteps() {
  return (
    <ol className="mk-steps">
      {AUDIT_STEPS.map(([title, body], i) => (
        <li key={title} className="mk-rv" style={{ "--k": i } as CSSProperties}>
          <span className="mk-label">0{i + 1}</span>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ol>
  );
}

export function RecordedBy() {
  return (
    <div className="mk-who mk-rv">
      <img src={portraitAsset.url} width={896} height={1078} alt="Rory Ulloa" loading="lazy" decoding="async" />
      <p>
        <b>Recorded by Rory Ulloa.</b>
        Not a template or a tool. The person who marks it up is the person who would build it.
      </p>
    </div>
  );
}

/** Sheet 3: the offer, made concrete, with conversion moment 2. */
export function AuditSheet() {
  return (
    <Sheet id="audit" labelledBy="mk-h-audit">
      <div className="mk-grid">
        <div className="mk-margin">
          <p className="mk-label">
            Sheet 3 / 6<b>The audit</b>
          </p>
          <RecordedBy />
        </div>
        <div className="mk-stack" style={{ gap: "clamp(32px, 4vw, 48px)" }}>
          <div className="mk-stack">
            <h2 id="mk-h-audit">Five minutes of video. Three fixes, ranked.</h2>
            <p className="mk-lead">
              It's the same teardown you just read, recorded for your site instead of an invented one.
            </p>
          </div>
          <AuditSteps />
          <div className="mk-rv" style={{ "--k": 4 } as CSSProperties}>
            <UrlForm placement="inline" />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
