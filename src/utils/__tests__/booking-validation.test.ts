import { describe, expect, it } from "vitest";
import {
  bookingSlotSchema,
  centralWallClockToUtc,
  formatSlot,
  isOfferedSlot,
  SLOT_HOURS_CENTRAL,
  SLOT_MINUTES,
} from "@/utils/booking.server";

const futureSlot = () => new Date(Date.now() + 48 * 3600_000).toISOString();

describe("bookingSlotSchema", () => {
  it("accepts a complete booking request", () => {
    const parsed = bookingSlotSchema.parse({
      full_name: "Jane Doe",
      email: "jane@company.com",
      phone: "(281) 555-1234",
      slot_start: futureSlot(),
      time_zone: "America/Chicago",
      notes: "Want to talk about a redesign.",
    });
    expect(parsed.full_name).toBe("Jane Doe");
    expect(parsed.time_zone).toBe("America/Chicago");
  });

  it("defaults the time zone when omitted", () => {
    const parsed = bookingSlotSchema.parse({
      full_name: "Jane Doe",
      email: "jane@company.com",
      slot_start: futureSlot(),
    });
    expect(parsed.time_zone).toBe("America/Chicago");
  });

  it("rejects missing name, bad email, and empty slot", () => {
    expect(() =>
      bookingSlotSchema.parse({ full_name: "", email: "jane@company.com", slot_start: futureSlot() }),
    ).toThrow();
    expect(() =>
      bookingSlotSchema.parse({ full_name: "Jane", email: "not-an-email", slot_start: futureSlot() }),
    ).toThrow();
    expect(() =>
      bookingSlotSchema.parse({ full_name: "Jane", email: "jane@company.com", slot_start: "" }),
    ).toThrow();
  });

  it("rejects over-long fields that could bloat the database", () => {
    expect(() =>
      bookingSlotSchema.parse({
        full_name: "x".repeat(121),
        email: "jane@company.com",
        slot_start: futureSlot(),
      }),
    ).toThrow();
    expect(() =>
      bookingSlotSchema.parse({
        full_name: "Jane",
        email: "jane@company.com",
        slot_start: futureSlot(),
        notes: "x".repeat(2001),
      }),
    ).toThrow();
  });
});

describe("slot configuration", () => {
  it("offers 15-minute slots at 10am, 1pm and 3pm Central", () => {
    expect(SLOT_MINUTES).toBe(15);
    expect(SLOT_HOURS_CENTRAL).toEqual([10, 13, 15]);
  });

  it("maps Central wall-clock slots to UTC on both sides of the DST change", () => {
    // Daylight time (CDT, UTC-5): 10am Central = 15:00 UTC.
    expect(centralWallClockToUtc(2026, 8, 25, 10).toISOString()).toBe("2026-08-25T15:00:00.000Z");
    // Standard time from Nov 1, 2026 (CST, UTC-6): 10am Central = 16:00 UTC.
    expect(centralWallClockToUtc(2026, 11, 3, 10).toISOString()).toBe("2026-11-03T16:00:00.000Z");
  });

  it("only accepts offered weekday slots, in Central time, across DST", () => {
    // Tue Aug 25 2026, 15:00 UTC = 10am CDT.
    expect(isOfferedSlot(new Date(Date.UTC(2026, 7, 25, 15)))).toBe(true);
    // Tue Nov 3 2026: 16:00 UTC is 10am CST; 15:00 UTC is 9am and not offered.
    expect(isOfferedSlot(new Date(Date.UTC(2026, 10, 3, 16)))).toBe(true);
    expect(isOfferedSlot(new Date(Date.UTC(2026, 10, 3, 15)))).toBe(false);
    // Sat Aug 29 2026 at 10am CDT: weekends are never offered.
    expect(isOfferedSlot(new Date(Date.UTC(2026, 7, 29, 15)))).toBe(false);
    // Off the hour.
    expect(isOfferedSlot(new Date(Date.UTC(2026, 7, 25, 15, 30)))).toBe(false);
  });

  it("formats slots in Central time for confirmation emails", () => {
    // 2026-08-25 15:00 UTC = 10:00 AM Central (CDT).
    const spoken = formatSlot(new Date(Date.UTC(2026, 7, 25, 15, 0, 0)));
    expect(spoken).toContain("10:00");
    expect(spoken).toContain("August 25");
  });
});
