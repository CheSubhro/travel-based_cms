
import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z
    .string()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: "Invalid MongoDB ObjectId",
    });

export const getGallerySchema = z.object({
    destinationId: objectIdSchema,
});

export const createGallerySchema = z.object({
    destinationId: objectIdSchema,

    imageIds: z
        .array(objectIdSchema)
        .min(1, "imageIds must contain at least one image"),
});

export const updateGallerySchema = z.object({
    destinationId: objectIdSchema,

    imageIds: z
        .array(objectIdSchema)
        .min(1, "imageIds must contain at least one image"),
});

export const deleteGallerySchema = z.object({
    destinationId: objectIdSchema,
    imageId: objectIdSchema,
});