import { useState } from "react";
import { Send, X, Rocket, Palette, CheckCircle2 } from "lucide-react";

export type DeliveryType = "design-approval" | "launch-ready" | "handover";

export interface ProjectDeliveryModalProps {
  type: DeliveryType;
  project: {
    id: string;
    name: string;
    email: string;
    projectTitle: string;
  };
  onClose: () => void;
  onSend: (data: {
    designUrl?: string;
    notes?: string;
    goLiveDate?: string;
    checklist?: string[];
    walkthroughUrl?: string;
    quickStartItems?: string[];
  }) => Promise<void>;
}

const CONFIG: Record<
  DeliveryType,
  {
    title: string;
    label: string;
    icon: typeof Send;
    needsDesignUrl?: boolean;
    needsWalkthroughUrl?: boolean;
    needsGoLiveDate?: boolean;
    description: string;
  }
> = {
  "design-approval": {
    title: "Design Approval Request",
    label: "SEND APPROVAL REQUEST",
    icon: Palette,
    needsDesignUrl: true,
    description:
      "Sends the design-approval-request email. The client reviews and replies 'approved' or requests changes.",
  },
  "launch-ready": {
    title: "Launch Readiness",
    label: "SEND LAUNCH READY",
    icon: Rocket,
    needsGoLiveDate: true,
    description:
      "Sends the launch-ready email with go-live date and checklist. Client confirms domain access.",
  },
  handover: {
    title: "Post-Launch Handover",
    label: "SEND HANDOVER",
    icon: CheckCircle2,
    needsWalkthroughUrl: true,
    description:
      "Sends the handover email with walkthrough video + access details. Starts the 14-day support window.",
  },
};

export function ProjectDeliveryModal({
  type,
  project,
  onClose,
  onSend,
}: ProjectDeliveryModalProps) {
  const config = CONFIG[type];
  const Icon = config.icon;

  const [designUrl, setDesignUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [walkthroughUrl, setWalkthroughUrl] = useState("");
  const [quickStartItems, setQuickStartItems] = useState(
    "Edit content: Log in at /admin with your credentials\nCheck leads: Inquiries appear in the admin dashboard\nView analytics: Dashboard linked in your portal",
  );
  const [checklist, setChecklist] = useState(
    "All forms tested end-to-end\nMobile + desktop verified\nAnalytics + SEO tags configured\nPerformance optimized",
  );
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (config.needsDesignUrl && !designUrl.trim()) return;
    if (config.needsWalkthroughUrl && !walkthroughUrl.trim()) return;

    setSending(true);
    try {
      const payload: {
        designUrl?: string;
        notes?: string;
        goLiveDate?: string;
        checklist?: string[];
        walkthroughUrl?: string;
        quickStartItems?: string[];
      } = {};
      if (designUrl) payload.designUrl = designUrl;
      if (notes) payload.notes = notes;
      if (goLiveDate) payload.goLiveDate = goLiveDate;
      if (checklist)
        payload.checklist = checklist
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      if (walkthroughUrl) payload.walkthroughUrl = walkthroughUrl;
      if (quickStartItems)
        payload.quickStartItems = quickStartItems
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      await onSend(payload);
      onClose();
    } catch {
      // handled by caller
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg border border-white/15 bg-[#0a0620] p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white">
          <X className="size-5" />
        </button>

        <span className="font-mono text-[10px] tracking-widest text-[#DFBA73]">
          PROJECT DELIVERY
        </span>
        <h2 className="mt-2 flex items-center gap-2 font-display text-2xl uppercase text-white">
          <Icon className="size-5 text-[#DFBA73]" />
          {config.title}
        </h2>
        <p className="mt-2 font-mono text-xs text-white/60">
          For <strong className="text-white">{project.name}</strong> · {project.projectTitle}
        </p>
        <p className="mt-2 font-mono text-[10px] text-white/40">{config.description}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {config.needsDesignUrl && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                DESIGN URL (FIGMA / PORTAL)
              </label>
              <input
                type="url"
                required
                value={designUrl}
                onChange={(e) => setDesignUrl(e.target.value)}
                placeholder="https://www.figma.com/proto/..."
                className={inputClass}
              />
            </div>
          )}
          {config.needsWalkthroughUrl && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                WALKTHROUGH VIDEO URL (LOOM)
              </label>
              <input
                type="url"
                required
                value={walkthroughUrl}
                onChange={(e) => setWalkthroughUrl(e.target.value)}
                placeholder="https://www.loom.com/share/..."
                className={inputClass}
              />
            </div>
          )}
          {config.needsGoLiveDate && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                TARGET GO-LIVE DATE
              </label>
              <input
                type="text"
                value={goLiveDate}
                onChange={(e) => setGoLiveDate(e.target.value)}
                placeholder="Friday, October 18"
                className={inputClass}
              />
            </div>
          )}
          {type === "launch-ready" && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                PRE-LAUNCH CHECKLIST (ONE PER LINE)
              </label>
              <textarea
                rows={4}
                value={checklist}
                onChange={(e) => setChecklist(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          )}
          {type === "handover" && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                QUICK START ITEMS (ONE PER LINE)
              </label>
              <textarea
                rows={4}
                value={quickStartItems}
                onChange={(e) => setQuickStartItems(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          )}
          {type === "design-approval" && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-white/50">
                NOTES (OPTIONAL)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="I've highlighted the two areas we discussed changing..."
                className={`${inputClass} resize-none`}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-4">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 bg-[#FF3333] px-6 py-3 font-mono text-xs font-bold tracking-widest text-black disabled:opacity-50"
            >
              <Send className="size-3.5" />
              {sending ? "SENDING…" : config.label}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
