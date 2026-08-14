
import { z } from "zod";

import { ROLE_VALUES } from "@/constants/roles";

import { emailSchema, passwordSchema } from "./common";

export const createUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name cannot exceed 100 characters"),

        email: emailSchema,

        password: passwordSchema,

        role: z.enum(ROLE_VALUES).optional(),

        isActive: z.boolean().optional(),
    })
    .strict();

export const updateUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name cannot exceed 100 characters")
            .optional(),

        email: emailSchema.optional(),

        password: passwordSchema.optional(),

        role: z.enum(ROLE_VALUES).optional(),

        isActive: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required for update",
    });