import { z } from "zod";

export const createConversationSchema = z.object({
  campgroundId: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid campground id"),
});

export const createMessageSchema = z.object({
  text: z
    .string({
      error: "Message text is required",
    })
    .trim()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
});
