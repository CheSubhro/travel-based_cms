
import { z } from "zod";

export const objectIdSchema = z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId",
);

export const emailSchema = z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .transform((value) => value.toLowerCase());

export const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters");

export function getValidationErrors(error) {
    return error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
    }));
}