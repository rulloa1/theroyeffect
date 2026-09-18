import { describe, expect, it } from "vitest";
import { daysSince, relativeAge } from "@/lib/relative-time";

const NOW = new Date("2026-03-13T12:00:00Z").getTime();
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

describe("daysSince", () => {
  it("counts whole days and never goes negative", () => {
    expect(daysSince(daysAgo(0), NOW)).toBe(0);
    expect(daysSince(daysAgo(5), NOW)).toBe(5);
    // A future date must not read as negative age.
    expect(daysSince(new Date(NOW + 5 * 86_400_000).toISOString(), NOW)).toBe(0);
  });

  it("survives a missing or unparseable date", () => {
    expect(daysSince(null, NOW)).toBe(0);
    expect(daysSince(undefined, NOW)).toBe(0);
    expect(daysSince("not-a-date", NOW)).toBe(0);
  });
});

describe("relativeAge", () => {
  it("names the near past in whole units", () => {
    expect(relativeAge(daysAgo(0), NOW)).toBe("TODAY");
    expect(relativeAge(daysAgo(1), NOW)).toBe("1 DAY");
    expect(relativeAge(daysAgo(3), NOW)).toBe("3 DAYS");
    expect(relativeAge(daysAgo(6), NOW)).toBe("6 DAYS");
  });

  it("collapses the wider past into coarser buckets", () => {
    expect(relativeAge(daysAgo(9), NOW)).toBe("THIS WEEK");
    expect(relativeAge(daysAgo(21), NOW)).toBe("3 WEEKS");
    expect(relativeAge(daysAgo(90), NOW)).toBe("3 MONTHS");
  });

  it("falls back to TODAY rather than throwing on bad input", () => {
    expect(relativeAge(null, NOW)).toBe("TODAY");
    expect(relativeAge("not-a-date", NOW)).toBe("TODAY");
  });
});
