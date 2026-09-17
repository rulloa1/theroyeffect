import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/Logo";
import { ClientProfileForm } from "@/components/portal/ClientProfileForm";
import { SignalShell } from "@/components/signal/SignalShell";
import {
  btnGhost,
  btnGhostSm,
  btnGold,
  btnPrimary,
  emptyState,
  label,
  navPill,
  panel,
  panelGold,
  panelUrgent,
} from "@/components/signal/signal-ui";
import { getStripeEnvironment } from "@/lib/stripe";
import { LEGAL_IDENTITY } from "@/lib/legal-identity";
import { EmbeddedCheckoutFrame } from "@/components/EmbeddedCheckoutFrame";
import { confirmBalancePayment, createBalanceCheckoutSession } from "@/utils/payments.functions";
import { supabase } from "@/integrations/supabase/client";
import { getMyProposals, type ProjectProposal } from "@/utils/proposals.functions";
import {
  getMyPortal,
  getMyProfile,
  type PortalInvoice,
  type PortalProject,
} from "@/utils/portal.functions";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Client Dashboard — theroyeffect.com" },
      {
        name: "description",
        content:
          "Your private client dashboard: project timelines, milestones, deliverables and invoices.",
      },
      { property: "og:title", content: "Client Dashboard — theroyeffect.com" },
      {
        property: "og:description",
        content: "Project timelines, milestones, deliverables and invoices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalPage,
});

const STATUS_LABELS: Record<string, string> = {
  onboarding: "ONBOARDING",
  in_progress: "IN PROGRESS",
  in_review: "IN REVIEW",
  delivered: "DELIVERED",
  complete: "COMPLETE",
};

const date = (value: string | null) =>
  value
    ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

function StatusPill({ status }: { status: string }) {
  const done = status === "complete" || status === "delivered";
  return (
    <span
      className={`border px-3 py-[5px] font-mono text-[10px] tracking-[0.2em] whitespace-nowrap ${
        done
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
          : "border-[#FF3333]/50 bg-[#FF3333]/10 text-[#FF3333]"
      }`}
    >
      {STATUS_LABELS[status] ?? status.toUpperCase()}
    </span>
  );
}

function ProjectSummary({ project }: { project: PortalProject }) {
  const done = project.milestones.filter((m) => m.status === "done").length;
  const total = project.milestones.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className={`p-6 ${panel}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[22px] uppercase leading-[1.1] text-white">{project.title}</h3>
          <p className="mt-1 font-mono text-[11px] text-white/40">
            {project.start_date
              ? `Started ${date(project.start_date)}`
              : `Started ${date(project.created_at)}`}
            {project.target_date ? ` · Target delivery ${date(project.target_date)}` : ""}
          </p>
        </div>
        <StatusPill status={project.status} />
      </div>

      {project.summary && (
        <p className="mt-4 max-w-[40rem] font-mono text-xs leading-[1.8] text-white/60">
          {project.summary}
        </p>
      )}

      <div className="mt-5 h-1.5 w-full bg-white/10">
        <div className="h-full bg-[#FF3333] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-white/40">
        {pct}% COMPLETE · {done}/{total} MILESTONES
      </p>
    </section>
  );
}

function Timeline({ project }: { project: PortalProject }) {
  if (project.milestones.length === 0) {
    return (
      <p className="font-mono text-xs text-white/40">
        Milestones will appear here as the project kicks off.
      </p>
    );
  }

  return (
    <ol className="mt-6 flex flex-col gap-[22px] border-l border-white/[0.12] pl-6">
      {project.milestones.map((m) => {
        const done = m.status === "done";
        const active = m.status === "active";

        return (
          <li key={m.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-[35px] top-px flex size-5 items-center justify-center rounded-full bg-[#030014] text-[13px] ${
                done ? "text-emerald-400" : active ? "text-[#FF3333]" : "text-white/25"
              }`}
            >
              {done ? "✓" : active ? "◍" : "○"}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-display text-[15px] uppercase ${
                  m.status === "pending" ? "text-white/40" : "text-white"
                }`}
              >
                {m.title}
              </span>
              {active && (
                <span className="bg-[#FF3333] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.2em] text-black">
                  YOUR TURN
                </span>
              )}
              {m.due_date && !done && (
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                  DUE {date(m.due_date).toUpperCase()}
                </span>
              )}
              {m.completed_at && done && (
                <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-400/70">
                  DONE {date(m.completed_at).toUpperCase()}
                </span>
              )}
            </div>

            {m.note && (
              <p className="mt-1.5 font-mono text-xs leading-[1.8] text-white/55">{m.note}</p>
            )}

            {m.link && (
              <a
                href={m.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 border border-[#FF3333]/40 bg-[#FF3333]/10 px-3.5 py-[7px] font-mono text-[10px] tracking-[0.2em] text-[#FF3333] transition-colors hover:bg-[#FF3333] hover:text-black"
              >
                VIEW DELIVERABLE <ExternalLink className="size-3" />
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Invoices({
  invoices,
  onPayBalance,
}: {
  invoices: PortalInvoice[];
  onPayBalance: (orderId: string) => void;
}) {
  if (invoices.length === 0) {
    return (
      <div className={emptyState}>
        <p className="font-display text-[22px] uppercase text-white/70">No invoices yet</p>
        <p className="mt-2 font-mono text-[11px] text-white/40">
          Payments and receipts show up here automatically.
        </p>
      </div>
    );
  }

  const totalPaid = invoices.reduce((sum, i) => sum + i.amount_cents, 0);
  const outstanding = invoices.reduce((sum, i) => sum + i.balance_due_cents, 0);
  const currency = invoices[0]?.currency ?? "usd";

  return (
    <div className="flex max-w-[56rem] flex-col gap-[18px]">
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        <div className={`p-5 ${panel}`}>
          <span className="font-mono text-[9px] tracking-[0.22em] text-white/40">TOTAL PAID</span>
          <p className="mt-2 font-display text-[32px] text-white">{money(totalPaid, currency)}</p>
        </div>
        <div
          className={`p-5 ${
            outstanding > 0
              ? "border border-[#FF3333]/40 bg-[#FF3333]/[0.05]"
              : "border border-emerald-400/30 bg-emerald-400/[0.05]"
          }`}
        >
          <span className="font-mono text-[9px] tracking-[0.22em] text-white/40">BALANCE DUE</span>
          <p
            className={`mt-2 font-display text-[32px] ${
              outstanding > 0 ? "text-[#FF3333]" : "text-emerald-400"
            }`}
          >
            {money(outstanding, currency)}
          </p>
        </div>
      </div>

      <div className="border border-white/10">
        {invoices.map((inv) => (
          <div
            key={`${inv.kind}-${inv.id}`}
            className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] p-4 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] uppercase text-white">{inv.description}</p>
              <p className="mt-1 font-mono text-[10px] text-white/40">
                {date(inv.issued_at)} · {inv.kind === "retainer" ? "RETAINER" : "COMMISSION"} ·{" "}
                {inv.status.replace(/_/g, " ").toUpperCase()}
                {inv.balance_due_cents > 0
                  ? ` · ${money(inv.balance_due_cents, inv.currency)} REMAINING`
                  : ""}
              </p>
            </div>

            <span className="font-mono text-[13px] text-white">
              {money(inv.amount_cents, inv.currency)}
            </span>

            {inv.kind === "commission" && inv.balance_due_cents > 0 && (
              <button
                type="button"
                onClick={() => onPayBalance(inv.id)}
                className="inline-flex items-center gap-1.5 border border-[#FF3333] bg-[#FF3333]/10 px-3.5 py-[7px] font-mono text-[10px] tracking-[0.2em] text-[#FF3333] transition-colors hover:bg-[#FF3333] hover:text-black whitespace-nowrap"
              >
                PAY {money(inv.balance_due_cents, inv.currency)}
              </button>
            )}

            {inv.hosted_url && (
              <a href={inv.hosted_url} target="_blank" rel="noreferrer" className={btnGhostSm}>
                RECEIPT <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Proposals({ proposals }: { proposals: ProjectProposal[] }) {
  if (proposals.length === 0) {
    return (
      <div className={emptyState}>
        <p className="font-display text-[22px] uppercase text-white/70">No proposals yet</p>
        <p className="mt-2 font-mono text-[11px] text-white/40">
          When Rory sends a scope agreement it appears here to review and sign.
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-w-[56rem] flex-col gap-3">
      {proposals.map((p) => {
        const signed = p.status === "signed";

        return (
          <article key={p.id} className={`p-[22px] ${signed ? panel : panelUrgent}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[19px] uppercase text-white">{p.project_title}</h3>
                <p className="mt-1 font-mono text-[11px] text-white/45">
                  {date(p.created_at)} · TIMELINE {p.timeline_weeks.toUpperCase()}
                </p>
              </div>
              <span
                className={`px-2 py-[3px] font-mono text-[9px] font-bold tracking-[0.2em] whitespace-nowrap ${
                  signed ? "bg-[#34d399] text-black" : "bg-[#FF3333] text-black"
                }`}
              >
                {signed ? "SIGNED" : "AWAITING SIGNATURE"}
              </span>
            </div>

            <p className="mt-3 max-w-[44rem] whitespace-pre-line font-mono text-xs leading-[1.8] text-white/60">
              {p.scope_deliverables}
            </p>

            <p className="mt-3 font-mono text-xs text-white/80">
              Total {money(p.total_price_cents, "usd")} · Deposit to start{" "}
              {money(p.deposit_cents, "usd")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                to="/proposals/$proposalId"
                params={{ proposalId: p.id }}
                className={signed ? btnGhost : btnPrimary}
              >
                {signed ? "VIEW AGREEMENT" : "REVIEW & SIGN"} <ExternalLink className="size-3" />
              </Link>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const { downloadSignedProposalPdf } =
                      await import("@/utils/proposals.functions");
                    const res = await downloadSignedProposalPdf({ data: { token: p.share_token } });
                    if (!res.success || !res.pdfBase64) throw new Error(res.error || "Failed");
                    const link = document.createElement("a");
                    link.href = `data:application/pdf;base64,${res.pdfBase64}`;
                    link.download = res.filename || "proposal.pdf";
                    link.click();
                    toast.success("Proposal PDF downloaded");
                  } catch {
                    toast.error("Could not download the PDF");
                  }
                }}
                className={btnGhost}
              >
                DOWNLOAD PDF ↓
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

type Tab = "overview" | "timeline" | "proposals" | "invoices" | "profile";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "OVERVIEW" },
  { key: "timeline", label: "TIMELINE" },
  { key: "proposals", label: "PROPOSALS" },
  { key: "invoices", label: "INVOICES" },
  { key: "profile", label: "MY DETAILS" },
];

const TAB_TITLES: Record<Tab, string> = {
  overview: "Your project",
  timeline: "Timeline",
  proposals: "Proposals",
  invoices: "Invoices",
  profile: "My details",
};

function PortalPage() {
  const fetchPortal = useServerFn(getMyPortal);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const startBalanceCheckout = useServerFn(createBalanceCheckoutSession);
  const confirmBalance = useServerFn(confirmBalancePayment);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["client-portal"],
    queryFn: () => fetchPortal(),
  });

  const fetchProposals = useServerFn(getMyProposals);
  const { data: proposalsData } = useQuery({
    queryKey: ["client-proposals"],
    queryFn: () => fetchProposals(),
  });

  const fetchProfile = useServerFn(getMyProfile);
  const { data: profileData } = useQuery({
    queryKey: ["client-profile"],
    queryFn: () => fetchProfile(),
  });
  const needsOnboarding = Boolean(profileData) && !profileData?.profile.onboarding_completed_at;

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    if (!payingOrderId) throw new Error("No invoice selected");
    const res = await startBalanceCheckout({
      data: {
        orderId: payingOrderId,
        returnUrl: `${window.location.origin}/portal?balance_session={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in res) throw new Error(res.error);
    if (!res.clientSecret) throw new Error("Checkout could not be started");
    return res.clientSecret;
  }, [payingOrderId, startBalanceCheckout]);

  // Confirm settlement when Stripe returns the client to the portal.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("balance_session");
    if (!sessionId) return;
    window.history.replaceState({}, "", "/portal");
    void (async () => {
      const res = await confirmBalance({
        data: { sessionId, environment: getStripeEnvironment() },
      });
      if (res.paid) {
        toast.success("Balance paid — thank you!");
        await refetch();
      } else if (res.error) {
        toast.error(res.error);
      } else {
        toast.message("Payment is processing. We'll update your invoice once it settles.");
      }
      setTab("invoices");
    })();
  }, [confirmBalance, refetch]);

  const projects = data?.projects ?? [];
  const invoices = data?.invoices ?? [];
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null,
    [projects, activeProjectId],
  );

  const outstanding = invoices.reduce((sum, i) => sum + i.balance_due_cents, 0);
  const payableInvoice = invoices.find((i) => i.kind === "commission" && i.balance_due_cents > 0);
  const currency = invoices[0]?.currency ?? "usd";
  const agreement = (proposalsData ?? []).find((p) => p.status === "signed");

  // The design's "YOUR TURN" card. It was originally driven by the approvals
  // queue, which has since been removed from the product, so it now keys off
  // the milestone the project is actually sitting on — the same signal the
  // timeline uses to stamp a step YOUR TURN.
  const activeMilestone = activeProject?.milestones.find((m) => m.status === "active");

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/portal/login", replace: true });
  };

  // Stripe's embedded checkout owns the whole screen while it is open.
  if (payingOrderId) {
    return (
      <div className="signal-root min-h-screen bg-[#030014] px-5 py-16 md:px-10">
        <Toaster />
        <div className="mx-auto max-w-3xl">
          <Logo size="sm" href="/" className="mb-6" />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl uppercase text-white">Pay remaining balance</h1>
            <button type="button" onClick={() => setPayingOrderId(null)} className={btnGhost}>
              CANCEL
            </button>
          </div>
          <EmbeddedCheckoutFrame fetchClientSecret={fetchClientSecret} />
        </div>
      </div>
    );
  }

  const headline = tab === "overview" && activeProject ? activeProject.title : TAB_TITLES[tab];

  return (
    <>
      <Toaster />
      <SignalShell
        eyebrow="CLIENT DASHBOARD"
        headline={headline}
        nav={TABS}
        activeKey={tab}
        onNavigate={setTab}
        actions={
          <>
            {data?.email && (
              <span className="self-center px-1 font-mono text-[9px] tracking-[0.2em] text-white/30">
                {data.email.toUpperCase()}
              </span>
            )}
            <Link to="/" className={navPill(false)}>
              BACK TO SITE
            </Link>
            <button type="button" onClick={() => void signOut()} className={navPill(false)}>
              <LogOut className="mr-1.5 inline size-3" />
              SIGN OUT
            </button>
          </>
        }
      >
        {isLoading && <p className="font-mono text-xs text-white/40">Loading your dashboard…</p>}

        {isError && (
          <div className="border border-[#FF3333]/40 bg-[#FF3333]/5 p-6">
            <p className="font-mono text-xs tracking-[0.2em] text-[#FF3333]">
              COULDN&apos;T LOAD YOUR DASHBOARD
            </p>
            <button type="button" onClick={() => void refetch()} className={`mt-4 ${btnGhost}`}>
              TRY AGAIN
            </button>
          </div>
        )}

        {data && (
          <>
            {needsOnboarding && tab !== "profile" && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-[#FF3333]/40 bg-[#FF3333]/5 p-5">
                <p className="font-mono text-xs leading-[1.8] text-white/70">
                  Finish onboarding so I have your contact details and can reach you the way you
                  prefer.
                </p>
                <button type="button" onClick={() => setTab("profile")} className={btnPrimary}>
                  COMPLETE MY DETAILS →
                </button>
              </div>
            )}

            {projects.length > 1 && tab !== "invoices" && tab !== "profile" && (
              <div className="mb-5 flex flex-wrap gap-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveProjectId(p.id)}
                    className={
                      activeProject?.id === p.id
                        ? "border border-[#FF3333] px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-[#FF3333]"
                        : "border border-white/10 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-white/50 transition-colors hover:text-white"
                    }
                  >
                    {p.title.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {tab === "overview" &&
              (projects.length === 0 ? (
                <div className={emptyState}>
                  <p className="font-display text-[22px] uppercase text-white/70">
                    Nothing here yet
                  </p>
                  <p className="mt-2 font-mono text-[11px] leading-[1.8] text-white/40">
                    Once your commission kicks off, live milestones and deliverables show up here.
                  </p>
                  <Link to="/book" className={`mt-6 ${btnPrimary}`}>
                    BOOK A DISCOVERY CALL →
                  </Link>
                </div>
              ) : (
                <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
                  <div className="flex min-w-0 flex-col gap-3.5">
                    {/* Two states in one card. With an active milestone it is the
                        design's YOUR TURN hero. With only a next_step — an onboarding
                        project whose milestones are all still pending — it degrades to
                        the quieter UP NEXT the old dashboard showed, so next_step never
                        goes unsurfaced. */}
                    {(activeMilestone || activeProject?.next_step) && (
                      <section className={`p-6 ${activeMilestone ? panelUrgent : panel}`}>
                        <span
                          className={
                            activeMilestone
                              ? "bg-[#FF3333] px-2 py-[3px] font-mono text-[9px] font-bold tracking-[0.2em] text-black"
                              : "border border-[#DFBA73]/50 px-2 py-[3px] font-mono text-[9px] tracking-[0.2em] text-[#DFBA73]"
                          }
                        >
                          {activeMilestone ? "YOUR TURN" : "UP NEXT"}
                        </span>
                        <h2 className="mt-3.5 text-[clamp(1.5rem,3vw,2rem)] uppercase leading-[1.05] text-white">
                          {activeMilestone
                            ? `${activeMilestone.title} is waiting on you`
                            : activeProject!.next_step}
                        </h2>
                        {activeMilestone && (
                          <p className="mt-2.5 max-w-[40rem] font-mono text-xs leading-[1.8] text-white/65">
                            {activeMilestone.note ??
                              activeProject?.next_step ??
                              "This step is in your hands. Build continues the day you come back on it — what you approve is what goes live."}
                          </p>
                        )}
                        <div className="mt-[18px] flex flex-wrap gap-2.5">
                          {activeMilestone?.link && (
                            <a
                              href={activeMilestone.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-[#FF3333] px-5 py-[11px] font-mono text-[10px] font-bold tracking-[0.2em] text-black transition-opacity hover:opacity-90"
                            >
                              OPEN THE SCREENS ↗
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setTab("timeline")}
                            className="inline-flex items-center gap-1.5 border border-white/20 px-5 py-[11px] font-mono text-[10px] tracking-[0.2em] text-white/75 transition-colors hover:border-white hover:text-white"
                          >
                            SEE THE TIMELINE
                          </button>
                        </div>
                      </section>
                    )}

                    {projects.map((p) => (
                      <div key={p.id} className="flex flex-col gap-2.5">
                        <ProjectSummary project={p} />
                        <Link
                          to="/projects/$projectId"
                          params={{ projectId: p.id }}
                          className={`self-start ${btnGhostSm}`}
                        >
                          OPEN PROJECT PAGE →
                        </Link>
                      </div>
                    ))}
                  </div>

                  <aside className="flex min-w-0 max-w-[360px] flex-col gap-3">
                    <div className={`p-4 ${panel}`}>
                      <span className="font-mono text-[9px] tracking-[0.22em] text-white/40">
                        BALANCE DUE
                      </span>
                      <p
                        className={`mt-2 font-display text-[30px] ${
                          outstanding > 0 ? "text-[#FF3333]" : "text-emerald-400"
                        }`}
                      >
                        {money(outstanding, currency)}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] leading-[1.7] text-white/40">
                        {outstanding > 0
                          ? "Invoiced when review closes. Refundable before kickoff."
                          : "Nothing outstanding — you're all paid up."}
                      </p>
                      {payableInvoice && (
                        <button
                          type="button"
                          onClick={() => setPayingOrderId(payableInvoice.id)}
                          className="mt-3 w-full border border-[#FF3333] bg-[#FF3333]/10 py-[9px] font-mono text-[10px] tracking-[0.2em] text-[#FF3333] transition-colors hover:bg-[#FF3333] hover:text-black"
                        >
                          PAY {money(payableInvoice.balance_due_cents, payableInvoice.currency)}
                        </button>
                      )}
                    </div>

                    {agreement && (
                      <div className={`p-4 ${panelGold}`}>
                        <span className="font-mono text-[9px] tracking-[0.22em] text-[#F6DC9A]">
                          YOUR AGREEMENT
                        </span>
                        <p className="mt-2 font-mono text-[11px] leading-[1.8] text-white/65">
                          {agreement.project_title}, signed{" "}
                          {date(agreement.client_signed_at ?? agreement.created_at)}. Total{" "}
                          {money(agreement.total_price_cents, "usd")}, deposit paid.
                        </p>
                        <Link
                          to="/proposals/$proposalId"
                          params={{ proposalId: agreement.id }}
                          className={`mt-3 w-full justify-center ${btnGold}`}
                        >
                          VIEW AGREEMENT ↗
                        </Link>
                      </div>
                    )}

                    <div className={`p-4 ${panel}`}>
                      <span className="font-mono text-[9px] tracking-[0.22em] text-white/40">
                        YOUR DESIGNER
                      </span>
                      <p className="mt-2 font-mono text-[11px] leading-[1.8] text-white/65">
                        Rory Ulloa
                        <br />
                        <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a>
                        <br />
                        <a href={`tel:${LEGAL_IDENTITY.phone.replace(/[^\d+]/g, "")}`}>
                          {LEGAL_IDENTITY.phone}
                        </a>
                      </p>
                    </div>
                  </aside>
                </div>
              ))}

            {tab === "timeline" &&
              (activeProject ? (
                <section className={`max-w-[56rem] p-6 ${panel}`}>
                  <h2 className="text-xl uppercase text-white">{activeProject.title}</h2>
                  <Timeline project={activeProject} />
                </section>
              ) : (
                <p className="font-mono text-xs text-white/40">No timeline yet.</p>
              ))}

            {tab === "proposals" && <Proposals proposals={proposalsData ?? []} />}

            {tab === "invoices" && <Invoices invoices={invoices} onPayBalance={setPayingOrderId} />}

            {tab === "profile" && (
              <div className="max-w-[56rem]">
                <ClientProfileForm email={data.email} />
              </div>
            )}
          </>
        )}
      </SignalShell>
    </>
  );
}
