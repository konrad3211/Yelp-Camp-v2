import { z } from "zod";

export const createReviewSchema = z.object({
  text: z
    .string({ error: "Review text is required" })
    .trim()
    .min(3, "Review must be at least 3 characters")
    .max(1000, "Review can't be longer than 1000 characters"),

  rating: z.coerce
    .number({ error: "Rating is required" })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating can't be greater than 5"),
});

//partial daje mozliwosc zmiany tylko jednego parametru
export const updateReviewSchema = createReviewSchema.partial();
