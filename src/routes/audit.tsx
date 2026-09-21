import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SmsConsent } from "@/components/SmsConsent";
import { z } from "zod";
import { Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/Logo";
import { trackAnalyticsEvent } from "@/integrations/firebase/analytics";

const TITLE = "Free Website Audit: a 5-Minute Video Teardown | The Roy Effect";
const DESCRIPTION =
  "A free personal video teardown of your website's conversion, mobile experience and brand positioning. Three fixes ranked by impact, in your inbox within one business day.";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroyeffect.com/audit" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://theroyeffect.com/audit" }],
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

const LABEL_CLASS = "block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]";
const CONTROL_CLASS =
  "mt-2 w-full min-h-12 border border-[var(--line)] bg-[var(--ground-raised)] px-4 py-3 font-portfolio-body text-base text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]";

export function AuditPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [bottleneck, setBottleneck] = useState("Conversion Rate & Inbound Leads");
  const [notes, setNotes] = useState("");
  const [smsService, setSmsService] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        const el = formRef.current?.querySelector<HTMLElement>(`#${FIELD_IDS[firstInvalid]}`);
        el?.focus();
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
      toast.success("Audit request received! Rory will send your video teardown within 24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p id={`audit-${field}-error`} role="alert" className="mt-2 text-sm text-[var(--furnace)]">
        {errors[field]}
      </p>
    ) : null;

  return (
    <main
      id="main"
      tabIndex={-1}
      className="min-h-screen bg-[var(--ground)] px-5 py-16 text-[var(--ink)] md:px-10 md:py-24"
    >
      <Toaster />
      <div className="mx-auto max-w-4xl">
        {/* Top Header & Logo */}
        <div className="flex flex-col">
          <Logo variant="stacked" size="lg" href="/" className="mb-6 self-start" />
          <span className="mt-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--gold)]">
            The 5-minute audit &bull; complimentary teardown
          </span>

          <h1 className="mt-6 font-portfolio text-[length:var(--type-display)] font-bold leading-[0.95] text-[var(--ink)]">
            Free website audit <br />
            <span className="text-[var(--ink-muted)]">a 5-minute video teardown of your site.</span>
          </h1>

          <p className="mt-5 max-w-[52ch] font-portfolio-body text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
            Most local service websites in Houston look dated, load slowly on phones, and send
            high-paying clients straight to a competitor. Send me your URL and I'll record a free
            5-minute video breaking down your UX bottlenecks and conversion leaks — no sales call,
            no obligation.
          </p>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Conversion teardown",
              desc: "Pinpoint exact friction points where visitors bounce before filling out your form or calling.",
              tag: "STEP 1",
            },
            {
              title: "Mobile & brand score",
              desc: "Full evaluation of mobile responsiveness, typographic hierarchy, and premium perceived value.",
              tag: "STEP 2",
            },
            {
              title: "3 actionable fixes",
              desc: "A personalized 5-minute video report with exact changes to increase inquiries immediately.",
              tag: "STEP 3",
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="border border-[var(--line)] bg-[var(--ground-raised)] p-5 transition-colors hover:border-[var(--gold)]"
            >
              <span className="font-mono text-[11px] tracking-widest text-[var(--gold)]">
                {pillar.tag}
              </span>
              <h3 className="mt-2 font-portfolio text-lg font-bold leading-snug text-[var(--ink)]">
                {pillar.title}
              </h3>
              <p className="mt-2 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Audit Request Form / Confirmation */}
        <div className="mt-12 border border-[var(--line)] bg-[var(--ground-raised)] p-6 md:p-10">
          {submitted ? (
            <div className="space-y-4 py-8">
              <div className="flex size-14 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)]">
                <Check className="size-7" />
              </div>
              <h2 className="font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
                Audit request received
              </h2>
              <p className="max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                Thanks, <strong>{name}</strong>. Rory Ulloa is reviewing{" "}
                <strong>{websiteUrl}</strong> and will email your personalized teardown within 1
                business day.
              </p>
              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center gap-2 rounded-none border border-[var(--gold)] px-6 font-mono text-xs font-bold tracking-widest text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-black"
                >
                  EXPLORE THE STUDIO ↗
                </Link>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[var(--line)] pb-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--gold)]">
                  CLAIM YOUR COMPLIMENTARY SPOT
                </span>
                <h2 className="mt-1 font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
                  Request your 5-minute teardown
                </h2>
                <p className="mt-2 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                  100% free • No sales calls required • Delivered straight to your inbox
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="audit-url" className={LABEL_CLASS}>
                    Your Website URL *
                  </label>
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
                    placeholder="https://yourbusiness.com"
                    className={CONTROL_CLASS}
                    {...errorProps("websiteUrl")}
                  />
                  {fieldError("websiteUrl")}
                </div>

                <div>
                  <label htmlFor="audit-name" className={LABEL_CLASS}>
                    Your Name *
                  </label>
                  <input
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
                    className={CONTROL_CLASS}
                    {...errorProps("name")}
                  />
                  {fieldError("name")}
                </div>

                <div>
                  <label htmlFor="audit-email" className={LABEL_CLASS}>
                    Your Work Email * (Where we send the audit)
                  </label>
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
                    placeholder="jane@yourbusiness.com"
                    className={CONTROL_CLASS}
                    {...errorProps("email")}
                  />
                  {fieldError("email")}
                </div>

                <div>
                  <label htmlFor="audit-bottleneck" className={LABEL_CLASS}>
                    Biggest Challenge / Goal *
                  </label>
                  <select
                    id="audit-bottleneck"
                    name="bottleneck"
                    value={bottleneck}
                    onChange={(e) => {
                      setBottleneck(e.target.value);
                      clearError("bottleneck");
                    }}
                    className={CONTROL_CLASS}
                    {...errorProps("bottleneck")}
                  >
                    <option value="Conversion Rate & Inbound Leads">
                      Low conversion rate & few inquiries
                    </option>
                    <option value="Outdated Visual Identity">
                      Design looks dated compared to competitors
                    </option>
                    <option value="Mobile Experience & Performance">
                      Poor mobile layout / slow loading
                    </option>
                    <option value="Full Rebrand & Launch">
                      Preparing for a major rebrand / new launch
                    </option>
                    <option value="General Teardown">
                      General teardown & high-level recommendations
                    </option>
                  </select>
                  {fieldError("bottleneck")}
                </div>
              </div>

              <div>
                <label htmlFor="audit-notes" className={LABEL_CLASS}>
                  Any specific pages or competitors we should look at? (Optional)
                </label>
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
                  className={`${CONTROL_CLASS} resize-none`}
                  {...errorProps("notes")}
                />
                {fieldError("notes")}
              </div>

              <SmsConsent
                smsService={smsService}
                smsMarketing={smsMarketing}
                onChange={(field, value) =>
                  field === "smsService" ? setSmsService(value) : setSmsMarketing(value)
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
                <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ink-faint)]">
                  <ShieldCheck className="size-4 text-[var(--gold)]" />
                  <span>Strictly confidential. No spam or sales pressure.</span>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex min-h-12 items-center gap-2 rounded-none bg-[var(--furnace)] px-8 font-mono text-xs font-bold tracking-widest text-black transition-colors hover:bg-[var(--ink)] disabled:opacity-50"
                >
                  {sending ? "SUBMITTING..." : "GET MY FREE AUDIT"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Who it's for */}
        <section className="mt-16">
          <h2 className="font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
            Who the audit is for
          </h2>
          <p className="mt-3 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
            I work mostly with owner-run businesses around Houston — contractors, clinics, law and
            accounting practices, salons, restaurants, real estate agents and B2B service firms. If
            people find you, look at the site, and still call someone else, the audit shows you
            where that happens.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Your site was built years ago and hasn't kept up with competitors",
              "Most of your traffic is mobile but the layout fights small screens",
              "You get visits from Google Business Profile but almost no form fills",
              "You're about to spend on ads and want the landing experience checked first",
            ].map((item) => (
              <li
                key={item}
                className="flex max-w-[60ch] items-start gap-2 border border-[var(--line)] bg-[var(--ground-raised)] p-4 font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]"
              >
                <Zap className="mt-1.5 size-3.5 shrink-0 text-[var(--gold)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What happens next */}
        <section className="mt-14">
          <h2 className="font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
            What happens after you submit
          </h2>
          <ol className="mt-5 space-y-4">
            {[
              "I open your site the way a customer would — on a phone first, cold, with no context.",
              "I record a 5-minute screen video walking through what's confusing, slow or off-brand.",
              "You get the video by email within one business day, plus three fixes ranked by impact.",
              "If you want me to make those fixes, we talk. If not, the notes are yours to keep.",
            ].map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="font-portfolio text-2xl font-bold text-[var(--gold)]">
                  0{i + 1}
                </span>
                <p className="max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="font-portfolio text-[length:var(--type-h3)] font-bold leading-[1.1] text-[var(--ink)]">
            Common questions
          </h2>
          <div className="mt-5 space-y-4">
            {[
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
            ].map((faq) => (
              <div
                key={faq.q}
                className="border border-[var(--line)] bg-[var(--ground-raised)] p-5"
              >
                <h3 className="font-portfolio text-lg font-bold leading-snug text-[var(--ink)]">
                  {faq.q}
                </h3>
                <p className="mt-2 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex min-h-12 items-center gap-2 rounded-none border border-[var(--gold)] px-6 font-mono text-xs font-bold tracking-widest text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-black"
            >
              SEE PRICING <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
