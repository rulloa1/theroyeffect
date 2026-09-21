import { Link } from "@tanstack/react-router";
import { setMotionPaused, useMotionPaused } from "@/lib/motion-preference";
import { CONTACT_EMAIL } from "@/lib/site";
import { syncMotionClass } from "./motion";

/** The back cover: continues the ink ground of the last sheet. */
export function MarkupFooter() {
  const paused = useMotionPaused();
  const toggle = () => {
    const next = !paused;
    setMotionPaused(next);
    syncMotionClass(next);
  };

  return (
    <footer className="mk-cover">
      <div className="mk-wrap">
        <div className="mk-foot">
          <div>
            <p className="mk-label">The Roy Effect</p>
            <p>Brand, web design and build for firms whose work is better than their website. Houston, Texas.</p>
          </div>
          <div>
            <p className="mk-label">Contact</p>
            <ul>
              <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li><a href="tel:+12813230450">(281) 323-0450</a></li>
              <li><Link to="/portal/login">Client sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="mk-label">Site</p>
            <ul>
              <li><Link to="/work">Studies</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/process">Process</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/brief">Start a project</Link></li>
            </ul>
          </div>
          <div>
            <p className="mk-label">Guides</p>
            <ul>
              <li><Link to="/guides/website-audit-checklist">Website audit checklist</Link></li>
              <li><Link to="/guides/houston-website-cost">Houston website cost</Link></li>
              <li><Link to="/guides/squarespace-vs-custom-website">Squarespace vs custom</Link></li>
              <li><Link to="/connect">Connect an AI assistant</Link></li>
            </ul>
          </div>
        </div>
        <div className="mk-foot-base">
          <span className="mk-fine">© {new Date().getFullYear()} The Roy Effect</span>
          <Link className="mk-fine" to="/privacy">Privacy</Link>
          <Link className="mk-fine" to="/terms">Terms</Link>
          <button type="button" className="mk-fine mk-motion-toggle" aria-pressed={paused} onClick={toggle}>
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        </div>
      </div>
    </footer>
  );
}
