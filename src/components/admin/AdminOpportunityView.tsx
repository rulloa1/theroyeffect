import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  adminAnalyzeOpportunity,
  adminSaveOpportunityLead,
  type OpportunityReportDto,
} from "@/utils/opportunity.functions";

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-white/50 hover:text-white"
    >
      {done ? <Check className="size-3" /> : <Copy className="size-3" />}
      {done ? "COPIED" : "COPY"}
    </button>
  );
}

export function AdminOpportunityView({
  onCall,
  onProposal,
  onLeadSaved,
}: {
  onCall?: (r: OpportunityReportDto) => void;
  onProposal?: (r: OpportunityReportDto) => void;
  onLeadSaved?: () => void;
}) {
  const analyze = useServerFn(adminAnalyzeOpportunity);
  const saveLead = useServerFn(adminSaveOpportunityLead);
  const [saving, setSaving] = useState(false);
  const [savedFor, setSavedFor] = useState<string | null>(null);

  const pushLead = async (r: OpportunityReportDto) => {
    setSaving(true);
    try {
      const res = await saveLead({
        data: {
          business: r.business,
          url: r.url,
          email: r.contactEmail,
          offer: `${r.primary.service} (${r.primary.price})`,
          notes: [
            "Sourced by Deal Finder",
            `Sell: ${r.primary.service} — ${r.primary.price}`,
            ...r.upsells.map((u) => `Upsell: ${u.service} — ${u.price}`),
            "",
            "Findings:",
            ...r.findings.map((f) => `- ${f}`),
            "",
            `Why it pays: ${r.moneyAngle}`,
          ]
            .join("\n")
            .slice(0, 4000),
        },
      });
      setSavedFor(r.business);
      toast.success(res.existing ? "Already in your pipeline" : "Added to your pipeline");
      onLeadSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the lead");
    } finally {
      setSaving(false);
    }
  };
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OpportunityReportDto | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !url.trim()) {
      toast.error("Enter a business name or website");
      return;
    }
    setLoading(true);
    try {
      setSavedFor(null);
      setReport(await analyze({ data: { businessName: name.trim(), url: url.trim() } }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const label = "font-mono text-[10px] tracking-widest text-white/50";
  const input =
    "mt-2 w-full border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none";

  return (
    <div className="space-y-8">
      <form onSubmit={run} className="border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-display text-2xl uppercase text-white">Find the deal</h2>
        <p className="mt-2 max-w-2xl font-mono text-xs text-white/60">
          Enter a business name, a website, or both. I scan the site, find the gaps, and tell you
          what to sell them, for how much, and how to pitch it.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className={label}>BUSINESS NAME</span>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bayou City Plumbing"
              maxLength={200}
            />
          </label>
          <label className="block">
            <span className={label}>WEBSITE</span>
            <input
              className={input}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              maxLength={300}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#FF3333] px-6 py-3 font-mono text-xs font-bold tracking-widest text-black disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {loading ? "ANALYZING…" : "ANALYZE"}
          </button>
        </div>
      </form>

      {report && (
        <div className="space-y-6">
          <div className="border border-white/10 p-6">
            <span className={label}>{report.url ?? "NO WEBSITE"}</span>
            <h3 className="mt-2 font-display text-3xl uppercase text-white">{report.business}</h3>
            {report.scanOk === false && (
              <p className="mt-2 font-mono text-xs text-amber-300">
                The website couldn’t be loaded — analysis is based on the name only.
              </p>
            )}
            <p className="mt-3 font-mono text-sm leading-relaxed text-white/70">{report.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {onProposal && (
                <button
                  type="button"
                  onClick={() => onProposal(report)}
                  className="bg-[#DFBA73] px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-black"
                >
                  CREATE PROPOSAL
                </button>
              )}
              <button
                type="button"
                disabled={saving || savedFor === report.business}
                onClick={() => void pushLead(report)}
                className="border border-white/20 px-5 py-2.5 font-mono text-xs tracking-widest text-white hover:border-white/50 disabled:opacity-50"
              >
                {savedFor === report.business
                  ? "IN PIPELINE ✓"
                  : saving
                    ? "SAVING…"
                    : "ADD TO PIPELINE"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-[#DFBA73]/50 bg-[#DFBA73]/[0.06] p-6">
              <span className="font-mono text-[10px] tracking-widest text-[#DFBA73]">
                SELL THIS
              </span>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-display text-2xl uppercase text-white">
                  {report.primary.service}
                </h4>
                <span className="font-mono text-lg text-[#DFBA73]">{report.primary.price}</span>
              </div>
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/70">
                {report.primary.why}
              </p>
              {report.upsells.length > 0 && (
                <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  <span className={label}>UPSELL</span>
                  {report.upsells.map((u) => (
                    <div key={u.service}>
                      <div className="flex justify-between gap-2 font-mono text-xs text-white">
                        <span>{u.service}</span>
                        <span className="text-[#DFBA73]">{u.price}</span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-white/55">{u.why}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-6 border-t border-white/10 pt-4 font-mono text-xs leading-relaxed text-white/80">
                <span className="text-[#DFBA73]">WHY IT PAYS: </span>
                {report.moneyAngle}
              </p>
            </div>

            <div className="border border-white/10 p-6">
              <span className={label}>WHAT I FOUND</span>
              <ul className="mt-3 space-y-2">
                {report.findings.map((f) => (
                  <li key={f} className="font-mono text-xs leading-relaxed text-white/75">
                    — {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <span className={label}>
                  OUTREACH EMAIL{report.contactEmail ? ` → ${report.contactEmail}` : ""}
                </span>
                <CopyButton text={`${report.emailSubject}\n\n${report.emailBody}`} />
              </div>
              <p className="mt-3 font-mono text-sm text-white">{report.emailSubject}</p>
              <p className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/70">
                {report.emailBody}
              </p>
            </div>
            <div className="border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <span className={label}>COLD CALL SCRIPT</span>
                <div className="flex gap-4">
                  {onCall && (
                    <button
                      type="button"
                      onClick={() => onCall(report)}
                      className="font-mono text-[10px] tracking-widest text-[#FF3333] hover:text-white"
                    >
                      CALL →
                    </button>
                  )}
                  <CopyButton text={report.callScript} />
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/70">
                {report.callScript}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
