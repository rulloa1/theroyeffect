import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { SmsConsent } from "@/components/SmsConsent";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/brief")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    session_id?: string | undefined;
    scope_type?: string | undefined;
    scope_estimate?: string | number | undefined;
  } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
    scope_type: typeof search["scope_type"] === "string" ? search["scope_type"] : undefined,
    scope_estimate:
      typeof search["scope_estimate"] === "string" || typeof search["scope_estimate"] === "number"
        ? search["scope_estimate"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Project Brief Intake — theroyeffect.com" },
      {
        name: "description",
        content:
          "Share your goals, deliverables, budget and timeline so Rory Ulloa can lock in scope and a start date for your commission.",
      },
      { property: "og:title", content: "Project Brief Intake — theroyeffect.com" },
      {
        property: "og:description",
        content:
          "A short guided brief so your project can start with clear scope, budget and timeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BriefPage,
});

const PROJECT_TYPES = ["Brand identity", "Website / UI-UX", "Design + Build", "Retainer", "Other"];
const BUDGETS = ["Under $2.5k", "$2.5k – $5k", "$5k – $10k", "$10k+"];
const TIMELINES = ["ASAP", "2–4 weeks", "1–2 months", "Flexible"];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  company: z.string().trim().max(120),
  projectType: z.string().trim().min(1, "Pick a project type"),
  goals: z.string().trim().min(10, "Tell me a bit more about your goals").max(2000),
  audience: z.string().trim().max(1000),
  deliverables: z.string().trim().max(1000),
  referencesLinks: z.string().trim().max(1000),
  budget: z.string().trim().max(60),
  timeline: z.string().trim().max(60),
  extra: z.string().trim().max(2000),
});

type Form = z.infer<typeof schema>;
type VisibleField =
  | "name"
  | "email"
  | "company"
  | "projectType"
  | "goals"
  | "referencesLinks"
  | "budget"
  | "timeline";
type Errors = Partial<Record<VisibleField, string>>;

const EMPTY: Form = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  goals: "",
  audience: "",
  deliverables: "",
  referencesLinks: "",
  budget: "",
  timeline: "",
  extra: "",
};

const STEPS: ReadonlyArray<{ title: string; fields: readonly VisibleField[] }> = [
  { title: "You", fields: ["name", "email", "company"] },
  {
    title: "The project",
    fields: ["projectType", "goals", "budget", "timeline", "referencesLinks"],
  },
];

const FIELD_IDS: Record<VisibleField, string> = {
  name: "brief-name",
  email: "brief-email",
  company: "brief-company",
  projectType: "brief-projectType-0",
  goals: "brief-goals",
  referencesLinks: "brief-references",
  budget: "brief-budget-0",
  timeline: "brief-timeline-0",
};

const inputClass =
  "w-full border-b border-[var(--line)] bg-transparent py-3 font-mono text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--gold)] focus:outline-none";
const labelClass = "block font-mono text-[10px] tracking-widest text-[var(--ink-muted)]";

function projectTypeFromScope(scopeType?: string) {
  if (!scopeType) return "";
  const normalized = scopeType.toLowerCase();
  if (normalized.includes("landing") || normalized.includes("website")) return "Website / UI-UX";
  if (normalized.includes("retainer")) return "Retainer";
  if (normalized.includes("brand")) return "Brand identity";
  return "Other";
}

function budgetFromEstimate(scopeEstimate?: string | number) {
  if (scopeEstimate === undefined || scopeEstimate === "") return "";
  const estimate =
    typeof scopeEstimate === "number"
      ? scopeEstimate
      : Number(scopeEstimate.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(estimate) || estimate < 0) return "";
  if (estimate < 2500) return "Under $2.5k";
  if (estimate <= 5000) return "$2.5k – $5k";
  if (estimate <= 10000) return "$5k – $10k";
  return "$10k+";
}

function initialForm(scopeType?: string, scopeEstimate?: string | number, paid = false): Form {
  return {
    ...EMPTY,
    projectType: projectTypeFromScope(scopeType),
    budget: paid ? "Already paid" : budgetFromEstimate(scopeEstimate),
  };
}

function FieldError({ field, errors }: { field: VisibleField; errors: Errors }) {
  const message = errors[field];
  if (!message) return null;
  return (
    <p id={`${FIELD_IDS[field]}-error`} className="mt-2 font-mono text-xs text-[var(--furnace)]">
      {message}
    </p>
  );
}

interface ChoiceGroupProps {
  field: "projectType" | "budget" | "timeline";
  legend: string;
  options: readonly string[];
  value: string;
  error?: string | undefined;
  onChange: (value: string) => void;
  onBlur: (event: FocusEvent<HTMLFieldSetElement>) => void;
}

function ChoiceGroup({ field, legend, options, value, error, onChange, onBlur }: ChoiceGroupProps) {
  return (
    <fieldset onBlur={onBlur} aria-describedby={error ? `${FIELD_IDS[field]}-error` : undefined}>
      <legend className="sr-only">{legend}</legend>
      <p aria-hidden="true" className={labelClass}>
        {legend}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option, index) => {
          const id = `brief-${field}-${index}`;
          const selected = value === option;
          return (
            <div key={option}>
              <input
                id={id}
                type="radio"
                name={field}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                aria-invalid={error ? true : undefined}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`flex min-h-11 cursor-pointer items-center border px-4 py-2 font-mono text-xs ${
                  selected
                    ? "border-[var(--gold)] bg-[var(--ground-raised)] text-[var(--gold)]"
                    : "border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-[var(--gold)]`}
              >
                {option}
              </label>
            </div>
          );
        })}
      </div>
      <FieldError field={field} errors={error ? { [field]: error } : {}} />
    </fieldset>
  );
}

function BriefPage() {
  const {
    session_id: sessionId,
    scope_type: scopeType,
    scope_estimate: scopeEstimate,
  } = Route.useSearch();
  const paid = Boolean(sessionId);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(() => initialForm(scopeType, scopeEstimate, paid));
  const [errors, setErrors] = useState<Errors>({});
  const [smsService, setSmsService] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const initialStepRender = useRef(true);

  const storageKey = `theroy_brief_draft_${sessionId || "general"}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Form>;
        if (parsed && typeof parsed === "object") {
          setForm((previous) => ({
            ...previous,
            name: typeof parsed.name === "string" ? parsed.name : previous.name,
            email: typeof parsed.email === "string" ? parsed.email : previous.email,
            company: typeof parsed.company === "string" ? parsed.company : previous.company,
            projectType: scopeType
              ? previous.projectType
              : typeof parsed.projectType === "string" && PROJECT_TYPES.includes(parsed.projectType)
                ? parsed.projectType
                : previous.projectType,
            goals: typeof parsed.goals === "string" ? parsed.goals : previous.goals,
            referencesLinks:
              typeof parsed.referencesLinks === "string"
                ? parsed.referencesLinks
                : previous.referencesLinks,
            budget: paid
              ? "Already paid"
              : scopeEstimate
                ? previous.budget
                : typeof parsed.budget === "string" && BUDGETS.includes(parsed.budget)
                  ? parsed.budget
                  : previous.budget,
            timeline:
              typeof parsed.timeline === "string" && TIMELINES.includes(parsed.timeline)
                ? parsed.timeline
                : previous.timeline,
            audience: "",
            deliverables: "",
            extra: "",
          }));
          setLastSaved("Draft restored");
        }
      }
    } catch {
      // Storage unavailable or blocked.
    }
  }, [paid, scopeEstimate, scopeType, storageKey]);

  useEffect(() => {
    if (done) return;
    const isDirty = Object.values(form).some((value) => value !== "");
    if (!isDirty) return;

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(form));
        setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // Storage write failed.
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [form, done, storageKey]);

  useEffect(() => {
    if (initialStepRender.current) {
      initialStepRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Storage remove failed.
    }
    setForm(initialForm(scopeType, scopeEstimate, paid));
    setErrors({});
    setStep(0);
    setLastSaved(null);
  };

  const set = (key: VisibleField) => (value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validateFields = (fields: readonly VisibleField[]) => {
    const result = schema.safeParse(form);
    const nextErrors: Errors = { ...errors };
    for (const field of fields) delete nextErrors[field];

    let firstInvalid: VisibleField | undefined;
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]) as VisibleField;
        if (!fields.includes(field) || nextErrors[field]) continue;
        nextErrors[field] = issue.message;
        firstInvalid ??= field;
      }
    }
    setErrors(nextErrors);
    return firstInvalid;
  };

  const focusField = (field: VisibleField) => {
    window.requestAnimationFrame(() => document.getElementById(FIELD_IDS[field])?.focus());
  };

  const validateField = (field: VisibleField) => {
    validateFields([field]);
  };

  const handleChoiceBlur =
    (field: "projectType" | "budget" | "timeline") => (event: FocusEvent<HTMLFieldSetElement>) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
      validateField(field);
    };

  const next = () => {
    const current = STEPS[step];
    if (!current) return;
    const firstInvalid = validateFields(current.fields);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    setStep((currentStep) => Math.min(currentStep + 1, STEPS.length - 1));
  };

  const handleSingleLineKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    formRef.current?.requestSubmit();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = schema.safeParse({
      ...form,
      audience: "",
      deliverables: "",
      extra: "",
      budget: paid ? "Already paid" : form.budget,
    });
    if (!result.success) {
      const allFields = STEPS.flatMap((item) => item.fields);
      const firstIssue = result.error.issues.find((issue) =>
        allFields.includes(String(issue.path[0]) as VisibleField),
      );
      if (firstIssue) {
        const field = String(firstIssue.path[0]) as VisibleField;
        const targetStep = STEPS.findIndex((item) => item.fields.includes(field));
        setErrors((previous) => ({ ...previous, [field]: firstIssue.message }));
        if (targetStep >= 0 && targetStep !== step) setStep(targetStep);
        focusField(field);
      }
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/public/brief-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          sessionId: sessionId ?? "",
          smsService,
          smsMarketing,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "Something went wrong");
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Storage clean failed.
      }
      setDone(true);
      toast.success("Brief received — I'll reply within one business day.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your brief right now.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <main className="brief-root flex min-h-screen items-center justify-center bg-[var(--ground)] px-[var(--gutter)] py-[var(--section-y)] pb-32">
        <Toaster />
        <div className="w-full max-w-lg border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
          <span className="font-mono text-[10px] tracking-widest text-[var(--gold)]">
            BRIEF RECEIVED
          </span>
          <h1 className="mt-4 text-[length:var(--type-display)] uppercase leading-[0.9] text-[var(--ink)]">
            THANK YOU
          </h1>
          <p className="mt-4 max-w-[68ch] text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
            Your brief is with me. I&apos;ll review it and reply within one business day with scope,
            schedule and next steps. A copy is in your inbox.
          </p>
          <Button
            asChild
            className="mt-8 min-h-11 rounded-none bg-[var(--gold)] px-5 py-3 font-mono text-xs tracking-widest text-[var(--ground)] hover:bg-[var(--gold)] hover:opacity-90"
          >
            <Link to="/">BACK TO SITE</Link>
          </Button>
        </div>
      </main>
    );
  }

  const current = STEPS[step] ?? STEPS[0];
  if (!current) return null;

  return (
    <main className="brief-root min-h-screen bg-[var(--ground)] px-[var(--gutter)] py-[var(--section-y)] pb-32 sm:pb-36">
      <Toaster />
      <div className="mx-auto max-w-2xl">
        <Logo variant="compact" size="md" href="/" className="mb-8" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[var(--gold)]">
            {sessionId ? "POST-PURCHASE INTAKE" : "PROJECT INTAKE"}
          </span>
          {lastSaved && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[var(--ink-faint)]">
                ● {lastSaved.startsWith("Draft") ? lastSaved : `Auto-saved at ${lastSaved}`}
              </span>
              <Button
                key="brief-next"
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearDraft}
                className="h-auto min-h-11 rounded-none px-1 font-mono text-[10px] tracking-widest text-[var(--ink-muted)] hover:bg-transparent hover:text-[var(--gold)]"
              >
                RESET DRAFT
              </Button>
            </div>
          )}
        </div>
        <h1 className="mt-3 text-[length:var(--type-display)] uppercase leading-[0.9] text-[var(--ink)]">
          PROJECT BRIEF
        </h1>
        <p className="mt-4 max-w-[68ch] text-[length:var(--type-lead)] leading-relaxed text-[var(--ink-muted)]">
          Two short steps. Your progress is saved automatically. The more detail you share, the
          faster I can lock scope and kick off your build.
        </p>

        <div
          className="mt-8 flex gap-2"
          role="progressbar"
          aria-label="Project brief progress"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              aria-hidden="true"
              className={`h-[3px] flex-1 ${index <= step ? "bg-[var(--gold)]" : "bg-[var(--line)]"}`}
            />
          ))}
        </div>

        <form onSubmit={submit} className="mt-10 space-y-7" noValidate>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              ref={stepHeadingRef}
              tabIndex={-1}
              className="text-[length:var(--type-h3)] uppercase leading-[0.92] text-[var(--ink)]"
            >
              {current.title}
            </h2>
            <span className="font-mono text-[10px] tracking-widest text-[var(--ink-faint)]">
              STEP {step + 1} OF {STEPS.length}
            </span>
          </div>

          {step === 0 && (
            <>
              <div>
                <label className={labelClass} htmlFor="brief-name">
                  YOUR NAME
                </label>
                <input
                  id="brief-name"
                  name="name"
                  autoComplete="name"
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => set("name")(event.target.value)}
                  onBlur={() => validateField("name")}
                  onKeyDown={handleSingleLineKeyDown}
                  placeholder="Jane Doe"
                  maxLength={100}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "brief-name-error" : undefined}
                />
                <FieldError field="name" errors={errors} />
              </div>
              <div>
                <label className={labelClass} htmlFor="brief-email">
                  EMAIL
                </label>
                <input
                  id="brief-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(event) => set("email")(event.target.value)}
                  onBlur={() => validateField("email")}
                  onKeyDown={handleSingleLineKeyDown}
                  placeholder="you@company.com"
                  maxLength={255}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "brief-email-error" : undefined}
                />
                <FieldError field="email" errors={errors} />
              </div>
              <div>
                <label className={labelClass} htmlFor="brief-company">
                  COMPANY (OPTIONAL)
                </label>
                <input
                  id="brief-company"
                  name="company"
                  autoComplete="organization"
                  className={inputClass}
                  value={form.company}
                  onChange={(event) => set("company")(event.target.value)}
                  onBlur={() => validateField("company")}
                  onKeyDown={handleSingleLineKeyDown}
                  placeholder="Northwind"
                  maxLength={120}
                  aria-invalid={errors.company ? true : undefined}
                  aria-describedby={errors.company ? "brief-company-error" : undefined}
                />
                <FieldError field="company" errors={errors} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <ChoiceGroup
                field="projectType"
                legend="PROJECT TYPE"
                options={PROJECT_TYPES}
                value={form.projectType}
                error={errors.projectType}
                onChange={set("projectType")}
                onBlur={handleChoiceBlur("projectType")}
              />
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className={labelClass} htmlFor="brief-goals">
                    WHAT ARE WE TRYING TO ACHIEVE?
                  </label>
                  <span className="shrink-0 font-mono text-[10px] text-[var(--ink-faint)]">
                    {form.goals.length}/2000
                  </span>
                </div>
                <textarea
                  id="brief-goals"
                  name="goals"
                  rows={5}
                  className={`${inputClass} resize-y`}
                  value={form.goals}
                  onChange={(event) => set("goals")(event.target.value)}
                  onBlur={() => validateField("goals")}
                  placeholder="Goals, problems to solve, what success looks like…"
                  maxLength={2000}
                  aria-invalid={errors.goals ? true : undefined}
                  aria-describedby={errors.goals ? "brief-goals-error" : undefined}
                />
                <FieldError field="goals" errors={errors} />
              </div>
              {!paid && (
                <ChoiceGroup
                  field="budget"
                  legend="BUDGET (OPTIONAL)"
                  options={BUDGETS}
                  value={form.budget}
                  error={errors.budget}
                  onChange={set("budget")}
                  onBlur={handleChoiceBlur("budget")}
                />
              )}
              <ChoiceGroup
                field="timeline"
                legend="TIMELINE (OPTIONAL)"
                options={TIMELINES}
                value={form.timeline}
                error={errors.timeline}
                onChange={set("timeline")}
                onBlur={handleChoiceBlur("timeline")}
              />
              <div>
                <label className={labelClass} htmlFor="brief-references">
                  CURRENT SITE OR REFERENCE LINKS
                </label>
                <input
                  id="brief-references"
                  name="referencesLinks"
                  type="text"
                  className={inputClass}
                  value={form.referencesLinks}
                  onChange={(event) => set("referencesLinks")(event.target.value)}
                  onBlur={() => validateField("referencesLinks")}
                  placeholder="Figma links, Google Drive / Dropbox assets, inspiration URLs, current website..."
                  maxLength={1000}
                  aria-invalid={errors.referencesLinks ? true : undefined}
                  aria-describedby={errors.referencesLinks ? "brief-references-error" : undefined}
                />
                <FieldError field="referencesLinks" errors={errors} />
              </div>

              <SmsConsent
                className="brief-consent"
                smsService={smsService}
                smsMarketing={smsMarketing}
                onChange={(field, value) =>
                  field === "smsService" ? setSmsService(value) : setSmsMarketing(value)
                }
              />
            </>
          )}

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((currentStep) => Math.max(currentStep - 1, 0))}
              disabled={step === 0}
              className="min-h-11 rounded-none px-0 font-mono text-xs tracking-widest text-[var(--ink-muted)] hover:bg-transparent hover:text-[var(--ink)] disabled:opacity-30"
            >
              ← BACK
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                className="min-h-11 rounded-none bg-[var(--furnace)] px-6 py-4 font-mono text-xs tracking-widest text-[var(--ground)] hover:bg-[var(--furnace)] hover:opacity-90"
              >
                NEXT STEP
              </Button>
            ) : (
              <Button
                key="brief-submit"
                type="submit"
                disabled={sending}
                className="min-h-11 rounded-none bg-[var(--furnace)] px-6 py-4 font-mono text-xs tracking-widest text-[var(--ground)] hover:bg-[var(--furnace)] hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "SENDING…" : "SEND BRIEF"}
              </Button>
            )}
          </div>

          {sessionId && (
            <p className="break-all font-mono text-[10px] text-[var(--ink-faint)]">
              Linked to payment reference: {sessionId}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
