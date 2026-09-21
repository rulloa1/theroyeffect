import { Link } from "@tanstack/react-router";
import { Sheet } from "./Sheet";

// Same four offers and starting prices as the ProfessionalService JSON-LD in __root.tsx.
const ROWS = [
  { name: "Brand Sprint", what: "Brand strategy, a logo system and visual guidelines.", price: "$2,500", per: "" },
  { name: "Website / UI-UX", what: "Full visual design and a clickable prototype.", price: "$5,000", per: "" },
  { name: "Design + Build", what: "End-to-end design paired with a production build.", price: "$8,000", per: "" },
  { name: "Design Retainer", what: "Ongoing creative direction and UI/UX, month to month.", price: "$3,000", per: "/mo" },
] as const;

/** Sheet 5: what the paid next step costs, before anyone hands over a URL. */
export function ScheduleSheet() {
  return (
    <Sheet id="after" labelledBy="mk-h-after">
      <div className="mk-grid">
        <div className="mk-margin">
          <p className="mk-label">
            Sheet 5 / 6<b>After the audit</b>
          </p>
        </div>
        <div className="mk-stack" style={{ gap: "clamp(28px, 3.5vw, 40px)" }}>
          <div className="mk-stack">
            <h2 id="mk-h-after">If you want the fixes made.</h2>
            <p className="mk-lead">
              The audit is free and stays free. If you want the work done, it is scoped one of four ways. Project work
              starts with half up front.
            </p>
          </div>
          <table className="mk-schedule mk-rv">
            <caption className="mk-sr">Engagements and starting prices</caption>
            <thead>
              <tr>
                <th scope="col" className="mk-label">Engagement</th>
                <th scope="col" className="mk-label">What it is</th>
                <th scope="col" className="mk-label" style={{ textAlign: "right" }}>From</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.name}>
                  <th scope="row">{row.name}</th>
                  <td>{row.what}</td>
                  <td className="mk-price">
                    {row.price}
                    {row.per ? <small>{row.per}</small> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            <Link to="/pricing" className="mk-link">
              What each one includes <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </div>
    </Sheet>
  );
}
