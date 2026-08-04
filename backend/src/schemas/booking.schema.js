import { z } from "zod";

export const createBookingSchema = z.object({
  checkIn: z.coerce.date({
    error: "Check-in date is required",
  }),

  checkOut: z.coerce.date({
    error: "Check-out date is required",
  }),
});
