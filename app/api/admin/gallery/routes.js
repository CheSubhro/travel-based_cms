import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Destination from "@/models/Destination";
import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import {
    getGallerySchema,
    createGallerySchema,
    updateGallerySchema,
    deleteGallerySchema,
} from "@/lib/validation/gallery";

import { getValidationErrors } from "@/lib/validation/common";

import { apiError } from "@/lib/api/error";

export async function GET(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { searchParams } = new URL(request.url);

        const destinationId = searchParams.get("destinationId");

        const validation = getGallerySchema.safeParse({
            destinationId,
        });

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        const { destinationId: validatedDestinationId } = validation.data;

        const destination = await Destination.findById(validatedDestinationId)
            .populate("images")
            .populate("featuredImage")
            .lean();

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        return NextResponse.json({
            success: true,
            data: {
                destinationId: destination._id,
                destinationTitle: destination.title,
                featuredImage: destination.featuredImage,
                images: destination.images,
            },
        });
    } catch (error) {
        console.error("GET admin gallery error:", error);

        return apiError("Failed to fetch gallery", 500);
    }
}

export async function POST(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const body = await request.json();

        const validation = createGallerySchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        const { destinationId, imageIds } = validation.data;

        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        const mediaCount = await Media.countDocuments({
            _id: {
                $in: imageIds,
            },
            isActive: true,
        });

        if (mediaCount !== imageIds.length) {
            return apiError(
                "One or more images were not found or inactive",
                404,
            );
        }

        const existingImageIds = destination.images.map((imageId) =>
            imageId.toString(),
        );

        const newImageIds = imageIds.filter(
            (imageId) => !existingImageIds.includes(imageId),
        );

        if (newImageIds.length === 0) {
            return apiError(
                "All selected images are already in the gallery",
                409,
            );
        }

        destination.images.push(...newImageIds);

        await destination.save();

        const updatedDestination = await Destination.findById(destinationId)
            .populate("images")
            .populate("featuredImage")
            .lean();

        return NextResponse.json({
            success: true,
            message: "Images added to gallery successfully",
            data: {
                destinationId: updatedDestination._id,
                destinationTitle: updatedDestination.title,
                featuredImage: updatedDestination.featuredImage,
                images: updatedDestination.images,
            },
        });
    } catch (error) {
        console.error("POST admin gallery error:", error);

        return apiError("Failed to add images to gallery", 500);
    }
}

export async function PATCH(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const body = await request.json();
       
        const validation = updateGallerySchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        const { destinationId, imageIds } = validation.data;
        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        const currentImageIds = destination.images.map((imageId) =>
            imageId.toString(),
        );

        if (currentImageIds.length !== imageIds.length) {
            return apiError(
                "Reorder request must contain all existing gallery images",
                400,
            );
        }

        const uniqueImageIds = new Set(imageIds);

        if (uniqueImageIds.size !== imageIds.length) {
            return apiError(
                "Reorder request cannot contain duplicate image IDs",
                400,
            );
        }

        const sortedCurrentIds = [...currentImageIds].sort();

        const sortedRequestedIds = [...imageIds].sort();

        const sameImages = sortedCurrentIds.every(
            (imageId, index) => imageId === sortedRequestedIds[index],
        );

        if (!sameImages) {
            return apiError(
                "Reorder request contains invalid gallery images",
                400,
            );
        }

        destination.images = imageIds;

        await destination.save();

        const updatedDestination = await Destination.findById(destinationId)
            .populate("images")
            .populate("featuredImage")
            .lean();

        return NextResponse.json({
            success: true,
            message: "Gallery reordered successfully",
            data: {
                destinationId: updatedDestination._id,
                destinationTitle: updatedDestination.title,
                featuredImage: updatedDestination.featuredImage,
                images: updatedDestination.images,
            },
        });
    } catch (error) {
        console.error("PATCH admin gallery error:", error);

        return apiError("Failed to reorder gallery", 500);
    }
}

export async function DELETE(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { searchParams } = new URL(request.url);

        const destinationId = searchParams.get("destinationId");

        const imageId = searchParams.get("imageId");

        const validation = deleteGallerySchema.safeParse({
            destinationId,
            imageId,
        });

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        const {
            destinationId: validatedDestinationId,
            imageId: validatedImageId,
        } = validation.data;

        const destination = await Destination.findById(validatedDestinationId);

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        const imageExists = destination.images.some(
            (id) => id.toString() === validatedImageId,
        );

        if (!imageExists) {
            return apiError("Image is not present in the gallery", 404);
        }

        destination.images = destination.images.filter(
            (id) => id.toString() !== validatedImageId,
        );

        await destination.save();

        const updatedDestination = await Destination.findById(
            validatedDestinationId,
        )
            .populate("images")
            .populate("featuredImage")
            .lean();

        return NextResponse.json({
            success: true,
            message: "Image removed from gallery successfully",
            data: {
                destinationId: updatedDestination._id,
                destinationTitle: updatedDestination.title,
                featuredImage: updatedDestination.featuredImage,
                images: updatedDestination.images,
            },
        });
    } catch (error) {
        console.error("DELETE admin gallery error:", error);

        return apiError("Failed to remove image from gallery", 500);
    }
}