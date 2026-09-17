import { useState } from "react";
import { Check, Copy, Download, ExternalLink, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ProjectProposal } from "@/utils/proposals.functions";
import {
  btnGhostSm,
  btnPrimary,
  btnPrimarySm,
  emptyState,
  label,
  panel,
} from "@/components/signal/signal-ui";

export interface AdminProposalsViewProps {
  proposals: ProjectProposal[];
  onCreateProposal: () => void;
  onEditProposal: (proposal: ProjectProposal) => void;
  onSendProposal: (proposalId: string) => Promise<void>;
  onDeleteProposal: (proposalId: string) => Promise<void>;
  money: (cents: number, currency: string) => string;
  date: (value: string | null) => string;
}

export function AdminProposalsView({
  proposals,
  onCreateProposal,
  onEditProposal,
  onSendProposal,
  onDeleteProposal,
  money,
  date,
}: AdminProposalsViewProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);

  const copyProposalLink = (token: string) => {
    const link = `${window.location.origin}/proposal/${token}`;
    void navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success("Proposal link copied to clipboard");
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const downloadPdf = async (prop: ProjectProposal) => {
    setPdfId(prop.id);
    try {
      const { adminDownloadProposalPdf } = await import("@/utils/proposals.functions");
      const res = await adminDownloadProposalPdf({ data: { id: prop.id } });
      if (!res.success || !res.pdfBase64) throw new Error(res.error || "Failed");
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${res.pdfBase64}`;
      link.download = res.filename || "proposal.pdf";
      link.click();
      toast.success("Proposal PDF downloaded");
    } catch {
      toast.error("Could not generate the PDF");
    } finally {
      setPdfId(null);
    }
  };

  const unsigned = proposals.filter((p) => p.status !== "signed").length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className={label}>
          {proposals.length} {proposals.length === 1 ? "AGREEMENT" : "AGREEMENTS"} · {unsigned}{" "}
          UNSIGNED
        </span>
        <button type="button" onClick={onCreateProposal} className={`ml-auto ${btnPrimary}`}>
          <Plus className="size-3.5" />
          CREATE PROPOSAL
        </button>
      </div>

      {proposals.length === 0 ? (
        <div className={emptyState}>
          <p className="font-display text-[22px] uppercase text-white/70">No agreements yet</p>
          <p className="mt-2 font-mono text-[11px] text-white/40">
            Scope agreements you generate show up here to send, sign and track.
          </p>
        </div>
      ) : (
        proposals.map((prop) => {
          const signed = prop.status === "signed";

          return (
            <article
              key={prop.id}
              className={`flex flex-wrap items-center gap-4 p-[18px] ${panel} transition-colors hover:border-white/20`}
            >
              <div className="min-w-0 flex-[1_1_240px]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-[19px] uppercase text-white">{prop.client_name}</h3>
                  <span
                    className={
                      signed
                        ? "bg-[#34d399] px-2 py-[3px] font-mono text-[9px] font-bold tracking-[0.2em] text-black whitespace-nowrap"
                        : prop.status === "archived"
                          ? "border border-white/15 px-2 py-[3px] font-mono text-[9px] tracking-[0.2em] text-white/50 whitespace-nowrap"
                          : "border border-[#FF3333]/50 bg-[#FF3333]/10 px-2 py-[3px] font-mono text-[9px] tracking-[0.2em] text-[#FF3333] whitespace-nowrap"
                    }
                  >
                    {/* `viewed` and `archived` are declared statuses too — neither is a
                        draft, and calling a delivered agreement DRAFT is worse than verbose. */}
                    {signed
                      ? "SIGNED"
                      : prop.status === "sent" || prop.status === "viewed"
                        ? "AWAITING SIGNATURE"
                        : prop.status === "archived"
                          ? "ARCHIVED"
                          : "DRAFT"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-white/45">
                  {prop.project_title} · {date(prop.created_at)} · timeline {prop.timeline_weeks}
                  {signed && prop.client_signature_name
                    ? ` · signed by ${prop.client_signature_name}`
                    : ""}
                </p>
              </div>

              <span className="font-display text-2xl text-white">
                {money(prop.total_price_cents, "usd")}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyProposalLink(prop.share_token)}
                  className={btnGhostSm}
                >
                  {copiedToken === prop.share_token ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copiedToken === prop.share_token ? "COPIED" : "LINK"}
                </button>

                <button
                  type="button"
                  disabled={pdfId === prop.id}
                  onClick={() => void downloadPdf(prop)}
                  className={btnGhostSm}
                >
                  <Download className="size-3" />
                  {pdfId === prop.id ? "BUILDING…" : "PDF"}
                </button>

                {signed ? (
                  <a
                    href={`/proposal/${prop.share_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnGhostSm}
                  >
                    VIEW AGREEMENT
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onEditProposal(prop)}
                      className={btnGhostSm}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      disabled={sendingId === prop.id}
                      onClick={async () => {
                        setSendingId(prop.id);
                        try {
                          await onSendProposal(prop.id);
                        } finally {
                          setSendingId(null);
                        }
                      }}
                      className={btnPrimarySm}
                    >
                      <Send className="size-3" />
                      {sendingId === prop.id
                        ? "SENDING…"
                        : prop.status === "draft"
                          ? "FINISH & SEND"
                          : "NUDGE CLIENT"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Delete this proposal?")) {
                      await onDeleteProposal(prop.id);
                      toast.success("Proposal deleted");
                    }
                  }}
                  className="p-1.5 text-white/40 transition-colors hover:text-[#FF3333]"
                  title="Delete proposal"
                  aria-label={`Delete proposal for ${prop.client_name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
