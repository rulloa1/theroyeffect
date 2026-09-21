import { Link } from "@tanstack/react-router";
import { Sheet } from "./Sheet";
import { UrlForm } from "./UrlForm";

/** Sheet 6: the back cover. Conversion moment 3. */
export function CoverSheet() {
  return (
    <Sheet id="send" labelledBy="mk-h-send" className="mk-cover">
      <div className="mk-grid">
        <div className="mk-margin">
          <p className="mk-label">
            Sheet 6 / 6<b>Send it</b>
          </p>
        </div>
        <div className="mk-stack" style={{ gap: "clamp(28px, 3.5vw, 40px)" }}>
          <h2 id="mk-h-send">Send the URL. I'll send back the notes.</h2>
          <UrlForm placement="closing" />
          <p>
            <Link to="/book" className="mk-link">
              Rather talk first? Book a free 15-minute call <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </div>
    </Sheet>
  );
}
