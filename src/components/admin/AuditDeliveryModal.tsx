import { useState } from "react";
import { Send, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export interface AuditDeliveryModalProps {
  inquiry: {
    id: string;
    name: string;
    email: string;
    website_url?: string | null;
  };
  onClose: () => void;
  onDeliver: (
    inquiryId: string,
    name: string,
    email: string,
    domain: string,
    fix1: string,
    fix2: string,
    fix3: string,
    videoUrl: string,
  ) => Promise<void>;
}

export function AuditDeliveryModal({ inquiry, onClose, onDeliver }: AuditDeliveryModalProps) {
  const [fix1, setFix1] = useState("");
  const [fix2, setFix2] = useState("");
  const [fix3, setFix3] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sending, setSending] = useState(false);

  const domain = inquiry.website_url
    ? inquiry.website_url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")
    : "";

  const openSite = () => {
    if (inquiry.website_url) {
      window.open(
        inquiry.website_url.startsWith("http") ? inquiry.website_url : `https://${inquiry.website_url}`,
        "_blank",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fix1 || !fix2 || !fix3 || !videoUrl) {
      toast.error("Fill in all three fixes and the video URL");
      return;
    }
    if (!domain) {
      toast.error("This inquiry has no website URL — can't deliver an audit");
      return;
    }
    setSending(true);
    try {
      await onDeliver(
        inquiry.id,
        inquiry.name,
        inquiry.email,
        domain,
        fix1,
        fix2,
        fix3,
        videoUrl,
      );
      onClose();
    } catch {
      // toast handled by caller
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg border border-white/15 bg-[#0a0620] p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <span className="font-mono text-[10px] tracking-widest text-[#DFBA73]">
          DELIVER AUDIT
        </span>
        <h2 className="mt-2 font-display text-2xl uppercase text-white">
          5-Minute Audit Delivery
        </h2>
        <p className="mt-2 font-mono text-xs text-white/60">
          Recording for <strong className="text-white">{inquiry.name}</strong> ·{" "}
          <button onClick={openSite} className="text-[#FF3333] underline inline-flex items-center gap-1">
            {domain} <ExternalLink className="size-3" />
          </button>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              LOOM VIDEO URL
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.loom.com/share/..."
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              FIX #1 (HIGHEST IMPACT)
            </label>
            <input
              type="text"
              required
              value={fix1}
              onChange={(e) => setFix1(e.target.value)}
              maxLength={300}
              placeholder="Move the booking button above the fold on mobile"
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              FIX #2
            </label>
            <input
              type="text"
              required
              value={fix2}
              onChange={(e) => setFix2(e.target.value)}
              maxLength={300}
              placeholder="Reduce the contact form from 8 fields to 3"
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-white/50">
              FIX #3
            </label>
            <input
              type="text"
              required
              value={fix3}
              onChange={(e) => setFix3(e.target.value)}
              maxLength={300}
              placeholder="Add a headline that says what you do, not who you are"
              className="mt-1.5 w-full border border-white/15 bg-[#030014] p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-[#DFBA73] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <p className="font-mono text-[10px] text-white/40">
              Sends audit-delivered email + marks inquiry replied + moves lead to contacted
            </p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 bg-[#FF3333] px-6 py-3 font-mono text-xs font-bold tracking-widest text-black disabled:opacity-50"
            >
              <Send className="size-3.5" />
              {sending ? "SENDING…" : "DELIVER AUDIT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
