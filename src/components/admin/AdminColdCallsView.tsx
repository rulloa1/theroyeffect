import { useEffect, useState } from "react";
import { Loader2, PhoneCall, X } from "lucide-react";
import type { ColdCall } from "@/utils/coldcalls.functions";

export interface ColdCallPrefill {
  businessName: string;
  phone?: string;
  website?: string | null;
  talkingPoints?: string | null;
  redesignRunId?: string | null;
}

interface Props {
  calls: ColdCall[];
  busy: string | null;
  prefill: ColdCallPrefill | null;
  onStart: (input: {
    businessName: string;
    phone: string;
    website: string | null;
    talkingPoints: string | null;
    redesignRunId: string | null;
  }) => void;
  onDelete: (id: string) => void;
  date: (value: string) => string;
}

const STATUS_COLOR: Record<string, string> = {
  failed: "text-[#FF3333]",
  ended: "text-emerald-400",
  queued: "text-[#DFBA73]",
  ringing: "text-[#DFBA73]",
  "in-progress": "text-white",
};

export function AdminColdCallsView({ calls, busy, prefill, onStart, onDelete, date }: Props) {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [talkingPoints, setTalkingPoints] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [open, setOpen] = useState<ColdCall | null>(null);

  useEffect(() => {
    if (!prefill) return;
    setBusinessName(prefill.businessName);
    setPhone(prefill.phone ?? "");
    setWebsite(prefill.website ?? "");
    setTalkingPoints(prefill.talkingPoints ?? "");
    setRunId(prefill.redesignRunId ?? null);
  }, [prefill]);

  const calling = busy === "cold-call";

  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF3333]">
        Voice agent · outbound
      </span>
      <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight text-white md:text-5xl">
        LET THE AGENT MAKE THE CALL
      </h2>
      <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-white/60">
        Give the voice agent a business and a number. It calls, opens with your talking points, and
        writes the transcript and summary back here when the call ends.
      </p>

      <form
        className="mt-8 grid max-w-3xl gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (calling || !businessName.trim() || !phone.trim()) return;
          onStart({
            businessName: businessName.trim(),
            phone: phone.trim(),
            website: website.trim() || null,
            talkingPoints: talkingPoints.trim() || null,
            redesignRunId: runId,
          });
        }}
      >
        <div>
          <label
            htmlFor="cc-name"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40"
          >
            Business
          </label>
          <input
            id="cc-name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className="mt-2 w-full border border-white/15 bg-white/[0.02] px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:border-[#FF3333] focus:outline-none"
            placeholder="Whitfield Plumbing"
          />
        </div>
        <div>
          <label
            htmlFor="cc-phone"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40"
          >
            Phone
          </label>
          <input
            id="cc-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            className="mt-2 w-full border border-white/15 bg-white/[0.02] px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:border-[#FF3333] focus:outline-none"
            placeholder="(713) 555-0114"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="cc-site"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40"
          >
            Their website (optional)
          </label>
          <input
            id="cc-site"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="mt-2 w-full border border-white/15 bg-white/[0.02] px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:border-[#FF3333] focus:outline-none"
            placeholder="whitfieldplumbing.com"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="cc-points"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40"
          >
            Talking points
          </label>
          <textarea
            id="cc-points"
            rows={4}
            value={talkingPoints}
            onChange={(event) => setTalkingPoints(event.target.value)}
            className="mt-2 w-full border border-white/15 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/25 focus:border-[#FF3333] focus:outline-none"
            placeholder="What the agent should open with and ask for."
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={calling || !businessName.trim() || !phone.trim()}
            className="flex items-center gap-2 bg-[#FF3333] px-7 py-4 font-mono text-xs font-bold tracking-widest text-black disabled:opacity-50"
          >
            {calling ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <PhoneCall className="size-3.5" />
            )}
            {calling ? "DIALLING…" : "START CALL"}
          </button>
        </div>
      </form>

      <div className="mt-12 border-t border-white/10 pt-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Call log
        </span>
        {calls.length === 0 && (
          <p className="mt-6 font-mono text-xs text-white/40">No calls placed yet.</p>
        )}
        <div className="mt-4 divide-y divide-white/10 border-t border-white/10">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 md:flex-1">
                <p className="truncate font-mono text-sm text-white">{call.business_name}</p>
                <p className="truncate font-mono text-[10px] text-white/40">
                  {call.phone} · {date(call.created_at)}
                </p>
              </div>
              <span
                className={`font-mono text-[11px] uppercase tracking-widest md:w-32 ${
                  STATUS_COLOR[call.status] ?? "text-white/60"
                }`}
              >
                {call.status}
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOpen(call)}
                  className="font-mono text-[11px] tracking-widest text-[#DFBA73] hover:text-white"
                >
                  OPEN ↗
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(call.id)}
                  className="font-mono text-[11px] tracking-widest text-white/35 hover:text-[#FF3333]"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#07031a] p-6 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-3xl text-white">{open.business_name}</h3>
                <p className="mt-2 font-mono text-[11px] text-white/40">
                  {open.phone} · {open.status}
                  {open.ended_reason ? ` · ${open.ended_reason}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="text-white/50 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {open.error_message && (
              <p className="mt-6 border border-[#FF3333]/40 bg-[#FF3333]/10 p-4 font-mono text-xs text-[#FF3333]">
                {open.error_message}
              </p>
            )}

            {open.talking_points && (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Talking points
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                  {open.talking_points}
                </p>
              </div>
            )}

            {open.summary && (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Summary
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{open.summary}</p>
              </div>
            )}

            {open.recording_url && (
              <audio controls src={open.recording_url} className="mt-8 w-full">
                <track kind="captions" />
              </audio>
            )}

            {open.transcript && (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Transcript
                </p>
                <p className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/60">
                  {open.transcript}
                </p>
              </div>
            )}

            {!open.summary && !open.transcript && !open.error_message && (
              <p className="mt-8 font-mono text-xs text-white/40">
                Nothing back from the agent yet. The transcript lands here when the call ends.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
