import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string({
      error: "Full name is required",
    })
    .trim()
    .regex(
      /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
      "Special characters are not allowed",
    )
    .min(3, "Full name must be at least 3 characters")
    .max(30, "Full name  can't be longer than 30 characters"),

  email: z.string().trim().pipe(z.email("Invalid email address")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const updateUserPasswordSchema = z.object({
  newPassword: z
    .string({ error: "New Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/,
      "Must contain a special character",
    ),
  currentPassword: z
    .string({ error: "New Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/,
      "Must contain a special character",
    ),
});

export type UpdatePasswordFormData = z.infer<typeof updateUserPasswordSchema>;

export const updateUserImageSchema = z.object({
  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Image is required")
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024,
      "Image must be smaller than 5MB",
    )
    .refine(
      (files) => files[0]?.type.startsWith("image/"),
      "File must be an image",
    ),
});

export type UpdateUserImageFormData = z.infer<typeof updateUserImageSchema>;
