import { useState } from "react";
import { Send, X } from "lucide-react";
import { toast } from "sonner";

export interface DiscoveryRecapModalProps {
  booking: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    slot_start: string;
  };
  onClose: () => void;
  onSend: (
    bookingId: string,
    name: string,
    email: string,
    businessName: string,
    summary: string,
    recommendedTier: string,
    whyFit: string,
    timeline: string,
    investment: string,
    deposit: string,
    includes: string[],
    proposalId?: string,
  ) => Promise<void>;
}

const TIERS = ["Brand Sprint — $2,500", "Website / UI-UX — $5,000", "Design + Build — $8,000", "Retainer — $3,000/mo"];

export function DiscoveryRecapModal({ booking, onClose, onSend }: DiscoveryRecapModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [summary, setSummary] = useState("");
  const [tier, setTier] = useState<string>(TIERS[2]!);
  const [whyFit, setWhyFit] = useState("");
  const [timeline, setTimeline] = useState("4-5 weeks from kickoff to launch");
  const [investment, setInvestment] = useState("$8,000");
  const [deposit, setDeposit] = useState("$4,000 deposit");
  const [includes, setIncludes] = useState("Full responsive design (mobile → desktop)\nNo-code build with CMS, forms & payments\nLaunch, analytics & SEO basics\n14-day post-launch support");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      toast.error("Write a summary of what they're solving");
      return;
    }
    setSending(true);
    try {
      await onSend(
        booking.id,
        booking.full_name,
        booking.email,
        businessName,
        summary,
        tier,
        whyFit,
        timeline,
        investment,
        deposit,
        includes.split("\n").map((s) => s.trim()).filter(Boolean),
      );
      onClose();
    } catch {
      // handled by caller
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg border border-white/15 bg-[#0a0620] p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white">
          <X className="size-5" />
        </button>

        <span className="font-mono text-[10px] tracking-widest text-[#DFBA73]">
          DISCOVERY CALL RECAP
        </span>
        <h2 className="mt-2 font-display text-2xl uppercase text-white">Written Recommendation</h2>
        <p className="mt-2 font-mono text-xs text-white/60">
          For <strong className="text-white">{booking.full_name}</strong> · call was on{" "}
          {new Date(booking.slot_start).toLocaleDateString()}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              BUSINESS NAME (OPTIONAL)
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Reyes Roofing"
              maxLength={200}
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              WHAT THEY'RE SOLVING
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Their current site loads slowly on mobile and the contact form is buried..."
              maxLength={2000}
              className="mt-1.5 w-full resize-none border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              RECOMMENDED TIER
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white focus:border-[#DFBA73] focus:outline-none"
            >
              {TIERS.map((t) => (
                <option key={t} value={t} className="bg-[#030014]">{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              WHY IT FITS
            </label>
            <input
              type="text"
              value={whyFit}
              onChange={(e) => setWhyFit(e.target.value)}
              placeholder="you need both the design and a live site"
              maxLength={500}
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                TIMELINE
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white focus:border-[#DFBA73] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                DEPOSIT
              </label>
              <input
                type="text"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white focus:border-[#DFBA73] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              INVESTMENT
            </label>
            <input
              type="text"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              WHAT'S INCLUDED (ONE PER LINE)
            </label>
            <textarea
              rows={4}
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
              className="mt-1.5 w-full resize-none border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white focus:border-[#DFBA73] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <p className="font-mono text-[10px] text-white/40">
              Sends discovery-recap email + marks booking completed + moves lead to proposal_sent
            </p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 bg-[#FF3333] px-6 py-3 font-mono text-xs font-bold tracking-widest text-black disabled:opacity-50"
            >
              <Send className="size-3.5" />
              {sending ? "SENDING…" : "SEND RECAP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
