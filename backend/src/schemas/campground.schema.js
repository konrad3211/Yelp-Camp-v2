import { z } from "zod";

export const createCampgroundSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title can't be longer than 100 characters"),

  city: z
    .string({ error: "City is required" })
    .trim()
    .min(2, "City is required")
    .max(100, "City can't be longer than 100 characters"),

  street: z
    .string({ error: "Street is required" })
    .trim()
    .min(2, "Street is required")
    .max(100, "Street can't be longer than 100 characters"),

  houseNumber: z
    .string({ error: "House number is required" })
    .trim()
    .min(2, "House number is required")
    .max(100, "House number can't be longer than 100 characters"),

  price: z.coerce
    .number({ error: "Price is required" })
    .min(0, "Price can't be negative")
    .max(1000000, "Price is too high"),

  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description can't be longer than 2000 characters"),

  latitude: z.coerce
    .number()
    .min(-90, "Latitude must ba at least -90")
    .max(90, "Latitude must ba at most 90"),

  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be at least -180")
    .max(180, "Longitude must be at most 180"),
});

export const updateCampgroundSchema = createCampgroundSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
