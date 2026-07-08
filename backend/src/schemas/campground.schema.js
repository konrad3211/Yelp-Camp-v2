import { z } from "zod";

export const createCampgroundSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title can't be longer than 100 characters"),

  location: z
    .string({ error: "Location is required" })
    .trim()
    .min(2, "Location is required")
    .max(100, "Location can't be longer than 100 characters"),

  price: z.coerce
    .number({ error: "Price is required" })
    .min(0, "Price can't be negative")
    .max(1000000, "Price is too high"),

  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description can't be longer than 2000 characters"),
});

export const updateCampgroundSchema = createCampgroundSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
