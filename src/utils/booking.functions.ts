import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  bookingSlotSchema,
  bookDiscoverySlot,
  formatSlot,
  getAvailableSlots,
} from "@/utils/booking.server";

const slotListSchema = z.object({
  count: z.number().int().min(1).max(20).default(3),
});

export const getDiscoveryAvailability = createServerFn({ method: "GET" })
  .inputValidator((input) => slotListSchema.parse(input))
  .handler(async ({ data }) => {
    const open = await getAvailableSlots(data.count);
    return {
      slots: open.map((slot) => ({
        slot_start: slot.toISOString(),
        spoken: formatSlot(slot),
      })),
    };
  });

const bookingRequestSchema = bookingSlotSchema.extend({
  smsService: z.boolean().default(false),
  smsMarketing: z.boolean().default(false),
});

export const bookDiscoveryCall = createServerFn({ method: "POST" })
  .inputValidator((input) => bookingRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { smsService, smsMarketing, ...slot } = data;
    return bookDiscoverySlot(slot, undefined, {
      sms_service_consent: smsService,
      sms_marketing_consent: smsMarketing,
    });
  });
