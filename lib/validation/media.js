
import { z } from "zod";

export const createMediaSchema = z.object({
    alt: z
        .string()
        .trim()
        .min(1, "Alt text is required")
        .max(200, "Alt text cannot exceed 200 characters"),

    caption: z
        .string()
        .trim()
        .max(500, "Caption cannot exceed 500 characters")
        .optional()
        .default(""),
});