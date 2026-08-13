import { z } from "zod";

export const createBookingSchema = z.object({
  checkIn: z.string({
    error: "Check-in date is required",
  }),

  checkOut: z.string({
    error: "Check-out date is required",
  }),
});
