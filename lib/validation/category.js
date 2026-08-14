
import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .max(100, "Category name cannot exceed 100 characters"),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers and hyphens",
        ),

    description: z
        .string()
        .trim()
        .max(500, "Category description cannot exceed 500 characters")
        .optional(),

    image: objectIdSchema.nullable().optional(),

    isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();