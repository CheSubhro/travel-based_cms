
import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const locationSchema = z
    .object({
        country: z.string().trim().optional(),
        state: z.string().trim().optional(),
        city: z.string().trim().optional(),
        address: z.string().trim().optional(),
    })
    .optional();

const baseDestinationSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(150, "Title cannot exceed 150 characters"),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers and hyphens",
        ),

    shortDescription: z
        .string()
        .trim()
        .min(10, "Short description must be at least 10 characters")
        .max(300, "Short description cannot exceed 300 characters"),

    description: z
        .string()
        .min(20, "Description must be at least 20 characters"),

    location: locationSchema,

    images: z.array(objectIdSchema).optional(),

    featuredImage: objectIdSchema.nullable().optional(),

    featured: z.boolean().optional(),

    status: z.enum(["draft", "published", "archived"]).optional(),

    categories: z.array(objectIdSchema).optional(),
});

export const createDestinationSchema = baseDestinationSchema.extend({
    title: baseDestinationSchema.shape.title,
    slug: baseDestinationSchema.shape.slug,
    shortDescription: baseDestinationSchema.shape.shortDescription,
    description: baseDestinationSchema.shape.description,
});

export const updateDestinationSchema = baseDestinationSchema.partial();