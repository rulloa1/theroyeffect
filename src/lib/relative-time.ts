/**
 * Mono age stamps for the hub's list views — "2 DAYS", "THIS WEEK".
 *
 * Deliberately terse and uppercase: these sit in IBM Plex Mono labels next to
 * a name, not in prose. `now` is injectable so the output is testable.
 */

const DAY_MS = 86_400_000;

/** Whole days between `iso` and `now`, clamped at zero. */
export function daysSince(iso: string | null | undefined, now: number = Date.now()): number {
  if (!iso) return 0;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now - then) / DAY_MS));
}

/** Age as a short uppercase stamp. */
export function relativeAge(iso: string | null | undefined, now: number = Date.now()): string {
  const days = daysSince(iso, now);
  if (days === 0) return "TODAY";
  if (days === 1) return "1 DAY";
  if (days < 7) return `${days} DAYS`;
  if (days < 14) return "THIS WEEK";
  if (days < 60) return `${Math.floor(days / 7)} WEEKS`;
  return `${Math.floor(days / 30)} MONTHS`;
}
