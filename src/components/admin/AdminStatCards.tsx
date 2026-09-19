interface AdminStatCardsProps {
  activeProjectsCount: number;
  unreadInquiriesCount: number;
  pendingBalanceTotal: number;
  showcaseCount: number;
  /** Currency formatter shared with the rest of the dashboard. */
  money: (cents: number, currency: string) => string;
}

/** The four headline counters across the top of the dashboard. */
export function AdminStatCards({
  activeProjectsCount,
  unreadInquiriesCount,
  pendingBalanceTotal,
  showcaseCount,
  money,
}: AdminStatCardsProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="border border-white/10 bg-white/[0.02] p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Active Projects
        </span>
        <p className="mt-2 font-display text-3xl text-white">{activeProjectsCount}</p>
        <span className="mt-1 block font-mono text-[10px] text-white/40">
          Commissions & Retainers
        </span>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          New Inquiries
        </span>
        <p className="mt-2 font-display text-3xl text-[#FF3333]">{unreadInquiriesCount}</p>
        <span className="mt-1 block font-mono text-[10px] text-white/40">
          {unreadInquiriesCount === 0 ? "Inbox up to date" : "Unread client messages"}
        </span>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Pending Balances
        </span>
        <p className="mt-2 font-display text-3xl text-white">{money(pendingBalanceTotal, "USD")}</p>
        <span className="mt-1 block font-mono text-[10px] text-white/40">
          Awaiting project completion
        </span>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Showcase Work
        </span>
        <p className="mt-2 font-display text-3xl text-white">{showcaseCount}</p>
        <span className="mt-1 block font-mono text-[10px] text-white/40">Live portfolio items</span>
      </div>
    </div>
  );
}
