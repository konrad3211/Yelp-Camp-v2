import z from "zod";

export const registerSchema = z.object({
  username: z
    .string({
      error: "Username is required",
    })
    .trim()
    .regex(/^[a-zA-Z0-9_.]+$/, "Special characters are not allowed")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username can't be longer than 30 characters"),

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

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/,
      "Must contain a special character",
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .pipe(z.email("Invalid email address")),

  password: z.string({ error: "Password is required" }).trim().min(1),
});
