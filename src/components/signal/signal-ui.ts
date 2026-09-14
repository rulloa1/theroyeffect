/**
 * Signal design tokens as Tailwind class strings.
 *
 * These mirror the "Signal" direction (option 1c) from the Claude Design
 * handoff: a near-black `#030014` ground, red `#FF3333` reserved for whatever
 * needs a decision right now, gold `#DFBA73` for the secondary/automated
 * track, and IBM Plex Mono for every label.
 */

/** Uppercase mono eyebrow above a section. */
export const label = "font-mono text-[10px] tracking-[0.22em] text-white/45";

/** Neutral panel: hairline border on a barely-there fill. */
export const panel = "border border-white/10 bg-white/[0.02]";

/** Panel for something that needs a decision. */
export const panelUrgent =
  "border border-[#FF3333]/50 bg-[#FF3333]/[0.06] shadow-[0_30px_70px_-40px_rgba(255,51,51,0.5)]";

/** Panel for the automated / gold track. */
export const panelGold = "border border-[#DFBA73]/30 bg-[#DFBA73]/[0.06]";

/** Primary nav pill in the hub header. */
export const navPill = (active: boolean) =>
  active
    ? "border border-[#FF3333] bg-[#FF3333] px-3.5 py-2 font-mono text-[10px] font-bold tracking-[0.2em] text-black whitespace-nowrap"
    : "border border-white/15 px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] text-white/60 transition-colors hover:border-white/40 hover:text-white whitespace-nowrap";

/** Filter chip above the action queue. */
export const chip = (active: boolean) =>
  active
    ? "border border-[#FF3333] bg-[#FF3333] px-2.5 py-[5px] font-mono text-[9px] font-bold tracking-[0.2em] text-black whitespace-nowrap"
    : "border border-white/15 px-2.5 py-[5px] font-mono text-[9px] tracking-[0.2em] text-white/55 transition-colors hover:border-white/40 hover:text-white whitespace-nowrap";

/** Solid red call to action. */
export const btnPrimary =
  "inline-flex items-center gap-1.5 bg-[#FF3333] px-[18px] py-[9px] font-mono text-[10px] font-bold tracking-[0.2em] text-black transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap";

/** Gold-outlined action — the "worth doing, not urgent" tier. */
export const btnGold =
  "inline-flex items-center gap-1.5 border border-[#DFBA73] px-[18px] py-[9px] font-mono text-[10px] tracking-[0.2em] text-[#DFBA73] transition-colors hover:bg-[#DFBA73] hover:text-black disabled:opacity-50 whitespace-nowrap";

/** Quiet outlined action. */
export const btnGhost =
  "inline-flex items-center gap-1.5 border border-white/[0.18] px-4 py-[9px] font-mono text-[10px] tracking-[0.2em] text-white/70 transition-colors hover:border-white hover:text-white disabled:opacity-50 whitespace-nowrap";

/** Compact outlined action for card footers. */
export const btnGhostSm =
  "inline-flex items-center gap-1.5 border border-white/15 px-3.5 py-[7px] font-mono text-[10px] tracking-[0.2em] text-white/80 transition-colors hover:border-white hover:text-white disabled:opacity-50 whitespace-nowrap";

/** Compact solid action for card footers. */
export const btnPrimarySm =
  "inline-flex items-center gap-1.5 bg-[#FF3333] px-3.5 py-[7px] font-mono text-[10px] font-bold tracking-[0.2em] text-black transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap";

/** Solid red status flag. */
export const flagUrgent =
  "bg-[#FF3333] px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.16em] text-black whitespace-nowrap";

/** Outlined neutral status flag. */
export const flagNeutral =
  "border border-white/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-white/50 whitespace-nowrap";

/** Text input styled for the hub. */
export const input =
  "w-full border border-white/[0.12] bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/30 focus:border-[#FF3333] focus:outline-none";

/** Native select styled for the hub — needs an opaque background for options. */
export const select =
  "border border-white/15 bg-[#030014] px-2.5 py-[7px] font-mono text-[11px] text-white focus:border-[#FF3333] focus:outline-none";

/** Dashed empty state. */
export const emptyState = "border border-dashed border-white/15 px-6 py-14 text-center";
