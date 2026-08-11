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
    .min(1, "House number is required")
    .max(20, "House number is too long"),
  price: z
    .number({ error: "Price is required" })
    .min(0, "Price can't be negative")
    .max(1000000, "Price is too high"),

  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description can't be longer than 2000 characters"),

  images: z
    .instanceof(FileList, {
      message: "Images are required",
    })
    .refine((files) => files.length >= 6, {
      message: "Select at least 6 images",
    })
    .refine((files) => files.length <= 8, {
      message: "You can upload up to 8 images",
    })
    .refine(
      (files) =>
        Array.from(files).every((file) => file.type.startsWith("image/")),
      {
        message: "Only image files are allowed",
      },
    )
    .refine(
      (files) =>
        Array.from(files).every((file) => file.size <= 5 * 1024 * 1024),
      {
        message: "Each image must be smaller than 5MB",
      },
    ),
});

export type CreateCampgroundFormData = z.infer<typeof createCampgroundSchema>;

export const updateCampgroundSchema = createCampgroundSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type UpdateCampgroundFormData = z.infer<typeof updateCampgroundSchema>;

export const updateImagesSchema = createCampgroundSchema
  .pick({
    images: true,
  })
  .extend({
    images: z
      .instanceof(FileList)
      .refine((files) => files.length >= 1, {
        message: "Select at least one image",
      })
      .refine((files) => files.length <= 2, {
        message: "You can upload up to 2 images",
      }),
  });

export type UpdateImagesFormData = z.infer<typeof updateImagesSchema>;
