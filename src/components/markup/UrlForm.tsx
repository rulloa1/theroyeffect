import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";

const URL_RE = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

/** One-field start to the audit. Carries the URL to /audit, where the full form is prefilled. */
export function UrlForm({ placement }: { placement: "inline" | "closing" }) {
  const id = useId();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = `${id}-url`;
  const helpId = `${id}-help`;
  const msgId = `${id}-msg`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = value.trim();
    if (!URL_RE.test(v)) {
      setError(
        v
          ? "That doesn’t look like a web address. Try something like yourfirm.com."
          : "Paste your website address first.",
      );
      document.getElementById(inputId)?.focus();
      return;
    }
    trackAnalyticsEvent("audit_cta_click", { placement });
    void navigate({ to: "/audit", search: { website: v.slice(0, 255) } });
  };

  return (
    <form className="mk-url-form" noValidate onSubmit={onSubmit}>
      <label className="mk-label" htmlFor={inputId}>
        Your website
      </label>
      <div className="mk-field-row">
        <input
          id={inputId}
          name="website"
          type="url"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourfirm.com"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${helpId} ${msgId}`}
        />
        <button className="mk-btn mk-btn-pen" type="submit">
          Audit my site
        </button>
      </div>
      <p className="mk-label mk-help" id={helpId}>
        Free · One business day · No call required
      </p>
      <p
        className={`mk-form-msg${error ? " is-err" : ""}`}
        id={msgId}
        role="status"
        aria-live="polite"
      >
        {error ?? ""}
      </p>
    </form>
  );
}
