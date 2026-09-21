import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { SmsConsent } from "@/components/SmsConsent";
import { Toaster } from "@/components/ui/sonner";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";
import { MarkupShell } from "@/components/markup/MarkupShell";
import { MARKUP_FONT_PRELOADS } from "@/components/markup/fonts";
import { Sheet } from "@/components/markup/Sheet";
import { AuditSteps, RecordedBy } from "@/components/markup/AuditSheet";
import ogImageAsset from "@/assets/og-markup.jpg.asset.json";
import { SITE_URL } from "@/lib/site";

const TITLE = "Free Website Audit: a 5-Minute Video Teardown | The Roy Effect";
const DESCRIPTION =
  "A free personal video teardown of your website's conversion, mobile experience and brand positioning. Three fixes ranked by impact, in your inbox within one business day.";

const OG_IMAGE = /^https?:\/\//.test(ogImageAsset.url) ? ogImageAsset.url : `${SITE_URL}${ogImageAsset.url}`;

type AuditSearch = { website?: string };

export const Route = createFileRoute("/audit")({
  // The homepage URL fields hand the address over as ?website=. It is only ever
  // used as an input value (React escapes it), trimmed and capped at 255 chars.
  validateSearch: (search: Record<string, unknown>): AuditSearch => {
    const raw = search["website"];
    if (typeof raw !== "string") return {};
    const website = raw.trim().slice(0, 255);
    return website ? { website } : {};
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroyeffect.com/audit" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [...MARKUP_FONT_PRELOADS, { rel: "canonical", href: "https://theroyeffect.com/audit" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Free Website Audit",
          serviceType: "Website audit and conversion review",
          provider: { "@id": "https://theroyeffect.com/#business" },
          areaServed: { "@type": "City", name: "Houston" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: "https://theroyeffect.com/audit",
        }),
      },
    ],
  }),
  component: AuditPage,
});

const auditSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid work email").max(255),
  websiteUrl: z.string().trim().min(3, "Please enter your website URL").max(255),
  bottleneck: z.string().trim().min(1, "Select your primary bottleneck"),
  notes: z.string().trim().max(1000).optional(),
});

type FieldName = "name" | "email" | "websiteUrl" | "bottleneck" | "notes";

const FIELD_ORDER: FieldName[] = ["websiteUrl", "name", "email", "bottleneck", "notes"];

const FIELD_IDS: Record<FieldName, string> = {
  websiteUrl: "audit-url",
  name: "audit-name",
  email: "audit-email",
  bottleneck: "audit-bottleneck",
  notes: "audit-notes",
};

const WHO_FOR = [
  "Your site was built years ago and hasn't kept up with competitors",
  "Most of your traffic is mobile but the layout fights small screens",
  "You get visits from Google Business Profile but almost no form fills",
  "You're about to spend on ads and want the landing experience checked first",
];

const FAQ = [
  {
    q: "Is the website audit really free?",
    a: "Yes. There's no fee and no card. I record a handful of these each week because a few people end up hiring me afterwards — that's the whole business case.",
  },
  {
    q: "How long does it take to get the audit?",
    a: "Usually within one business day, occasionally two if the queue is full. It arrives as a private video link in your inbox.",
  },
  {
    q: "Do I have to be in Houston?",
    a: "No. I'm based in Houston and know the local market best, but I audit and build for clients anywhere in the US.",
  },
  {
    q: "What if I don't have a website yet?",
    a: "Send the closest thing you have — a social profile, a directory listing, or a competitor you admire — and I'll review positioning instead of layout.",
  },
];

export function AuditPage() {
  const { website: prefilled } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(prefilled ?? "");
  const [bottleneck, setBottleneck] = useState("Conversion Rate & Inbound Leads");
  const [notes, setNotes] = useState("");
  const [smsService, setSmsService] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Arrived from a homepage URL field: the address is filled in, so start at the next field.
  useEffect(() => {
    if (prefilled) nameRef.current?.focus();
  }, [prefilled]);

  const clearError = (field: FieldName) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const errorProps = (field: FieldName) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": `audit-${field}-error` }
      : { "aria-invalid": undefined, "aria-describedby": undefined };

  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p id={`audit-${field}-error`} role="alert" className="mk-field-err">
        {errors[field]}
      </p>
    ) : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = auditSchema.safeParse({ name, email, websiteUrl, bottleneck, notes });
    if (!result.success) {
      const fieldErrors: Partial<Record<FieldName, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as FieldName | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(result.error.issues[0]?.message ?? "Please check the form");
      const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field]);
      if (firstInvalid) {
        formRef.current?.querySelector<HTMLElement>(`#${FIELD_IDS[firstInvalid]}`)?.focus();
      }
      return;
    }

    setErrors({});
    setSending(true);
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          projectType: "5-Minute Website Audit",
          smsService,
          smsMarketing,
          websiteUrl: result.data.websiteUrl,
          bottleneck: result.data.bottleneck,
          notes: result.data.notes ?? "",
          message: result.data.notes ?? "",
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to submit request");

      setSubmitted(true);
      trackAnalyticsEvent("audit_submitted");
      toast.success("Got it. Your teardown arrives within one business day.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <MarkupShell ctaFormId="request">
      <Toaster />
      <section className="mk-sheet mk-hero is-in" aria-labelledby="mk-h-audit-page">
        <div className="mk-wrap">
          <div className="mk-grid">
            <div className="mk-margin">
              <p className="mk-label">
                The audit<b>Request</b>
              </p>
              <ul className="mk-promise">
                <li>Free. No card.</li>
                <li>Video within one business day.</li>
                <li>Three fixes, ranked by impact.</li>
                <li>No call required.</li>
              </ul>
              <RecordedBy />
            </div>
            <div className="mk-stack" style={{ gap: "clamp(32px, 4vw, 48px)" }}>
              <div className="mk-stack">
                <h1 className="mk-display" id="mk-h-audit-page">
                  Free website audit. Five minutes, three fixes, ranked.
                </h1>
                <p className="mk-lead">
                  Send the URL. I open it the way a customer would — on a phone first, cold — and record five minutes
                  on what's confusing, slow or off-brand. The video reaches you within one business day, with three
                  fixes ranked by impact.
                </p>
              </div>

              <div className="mk-plate mk-form-plate" id="request">
                {submitted ? (
                  <div className="mk-done" role="status">
                    <span className="mk-check" aria-hidden="true">✓</span>
                    <h2>Got it.</h2>
                    <p className="mk-body">
                      Thanks, {name}. I'm looking at {websiteUrl} and will email your teardown within one business day.
                    </p>
                    <p>
                      <Link to="/" className="mk-link">
                        Back to the homepage <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} noValidate>
                    <div className="mk-stack" style={{ gap: 8 }}>
                      <h2>Request your teardown</h2>
                      <p className="mk-cap">Every field marked * is needed to record it.</p>
                    </div>

                    <div className="mk-fields">
                      <div className="mk-field">
                        <label htmlFor="audit-url" className="mk-label">Your website *</label>
                        <input
                          id="audit-url"
                          name="website"
                          type="text"
                          required
                          autoComplete="url"
                          inputMode="url"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={websiteUrl}
                          onChange={(e) => {
                            setWebsiteUrl(e.target.value);
                            clearError("websiteUrl");
                          }}
                          placeholder="yourfirm.com"
                          className="mk-input"
                          {...errorProps("websiteUrl")}
                        />
                        {fieldError("websiteUrl")}
                      </div>

                      <div className="mk-field">
                        <label htmlFor="audit-name" className="mk-label">Your name *</label>
                        <input
                          ref={nameRef}
                          id="audit-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearError("name");
                          }}
                          placeholder="Jane Doe"
                          className="mk-input"
                          {...errorProps("name")}
                        />
                        {fieldError("name")}
                      </div>

                      <div className="mk-field">
                        <label htmlFor="audit-email" className="mk-label">Work email * · where the video goes</label>
                        <input
                          id="audit-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError("email");
                          }}
                          placeholder="jane@yourfirm.com"
                          className="mk-input"
                          {...errorProps("email")}
                        />
                        {fieldError("email")}
                      </div>

                      <div className="mk-field">
                        <label htmlFor="audit-bottleneck" className="mk-label">Biggest challenge *</label>
                        <select
                          id="audit-bottleneck"
                          name="bottleneck"
                          value={bottleneck}
                          onChange={(e) => {
                            setBottleneck(e.target.value);
                            clearError("bottleneck");
                          }}
                          className="mk-input"
                          {...errorProps("bottleneck")}
                        >
                          <option value="Conversion Rate & Inbound Leads">Low conversion rate & few inquiries</option>
                          <option value="Outdated Visual Identity">Design looks dated compared to competitors</option>
                          <option value="Mobile Experience & Performance">Poor mobile layout / slow loading</option>
                          <option value="Full Rebrand & Launch">Preparing for a major rebrand / new launch</option>
                          <option value="General Teardown">General teardown & high-level recommendations</option>
                        </select>
                        {fieldError("bottleneck")}
                      </div>

                      <div className="mk-field is-wide">
                        <label htmlFor="audit-notes" className="mk-label">Pages or competitors to look at · optional</label>
                        <textarea
                          id="audit-notes"
                          name="notes"
                          rows={3}
                          value={notes}
                          onChange={(e) => {
                            setNotes(e.target.value);
                            clearError("notes");
                          }}
                          placeholder="e.g. Please look at our services page. Our main competitor is..."
                          className="mk-input"
                          {...errorProps("notes")}
                        />
                        {fieldError("notes")}
                      </div>
                    </div>

                    <SmsConsent
                      className="mk-consent"
                      smsService={smsService}
                      smsMarketing={smsMarketing}
                      onChange={(field, value) =>
                        field === "smsService" ? setSmsService(value) : setSmsMarketing(value)
                      }
                    />

                    <div className="mk-form-foot">
                      <p className="mk-cap">Confidential. No spam, no sales pressure.</p>
                      <button type="submit" disabled={sending} className="mk-btn mk-btn-pen">
                        {sending ? "Sending…" : "Audit my site"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sheet labelledBy="mk-h-next">
        <div className="mk-grid">
          <div className="mk-margin">
            <p className="mk-label">
              Next<b>After you submit</b>
            </p>
          </div>
          <div className="mk-stack" style={{ gap: "clamp(28px, 3.5vw, 40px)" }}>
            <h2 id="mk-h-next">What happens next.</h2>
            <AuditSteps />
          </div>
        </div>
      </Sheet>

      <Sheet labelledBy="mk-h-who">
        <div className="mk-grid">
          <div className="mk-margin">
            <p className="mk-label">
              Fit<b>Who it's for</b>
            </p>
          </div>
          <div className="mk-stack" style={{ gap: "clamp(28px, 3.5vw, 40px)" }}>
            <div className="mk-stack">
              <h2 id="mk-h-who">Who the audit is for.</h2>
              <p className="mk-lead">
                I work mostly with owner-run businesses around Houston — contractors, clinics, law and accounting
                practices, salons, restaurants, real estate agents and B2B service firms. If people find you, look at
                the site, and still call someone else, the audit shows you where that happens.
              </p>
            </div>
            <ul className="mk-list mk-rv">
              {WHO_FOR.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>

      <Sheet labelledBy="mk-h-faq">
        <div className="mk-grid">
          <div className="mk-margin">
            <p className="mk-label">
              Questions<b>Before you send it</b>
            </p>
          </div>
          <div className="mk-stack" style={{ gap: "clamp(28px, 3.5vw, 40px)" }}>
            <h2 id="mk-h-faq">Common questions.</h2>
            <dl className="mk-faq mk-rv">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
            <p>
              <Link to="/pricing" className="mk-link">
                See pricing <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </Sheet>
    </MarkupShell>
  );
}
