import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

// ============================================================
// GET - Get destination gallery
// ============================================================

export async function GET(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return NextResponse.json(
                {
                    success: false,
                    message: authorization.message,
                },
                {
                    status: authorization.status,
                },
            );
        }

        const { id } = await params;

        const validation = getGallerySchema.safeParse({
            destinationId: id,
        });

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: getValidationErrors(validation.error),
                },
                {
                    status: 400,
                },
            );
        }

        const { destinationId } = validation.data;

        const destination = await Destination.findById(destinationId)
            .populate("images")
            .populate("featuredImage")
            .lean();

        if (!destination) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination not found",
                },
                {
                    status: 404,
                },
            );
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

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch gallery",
            },
            {
                status: 500,
            },
        );
    }
}

// ============================================================
// POST - Add images to gallery
// ============================================================

export async function POST(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return NextResponse.json(
                {
                    success: false,
                    message: authorization.message,
                },
                {
                    status: authorization.status,
                },
            );
        }

        const { id } = await params;

        const body = await request.json();

        const validation = createGallerySchema.safeParse({
            destinationId: id,
            imageIds: body.imageIds,
        });

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: getValidationErrors(validation.error),
                },
                {
                    status: 400,
                },
            );
        }

        const { destinationId, imageIds } = validation.data;

        // --------------------------------------------------------
        // Check destination
        // --------------------------------------------------------

        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination not found",
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Check media
        // --------------------------------------------------------

        const mediaExists = await Media.find({
            _id: { $in: imageIds },
            isActive: true,
        }).select("_id");

        const existingMediaIds = mediaExists.map((media) =>
            media._id.toString(),
        );

        const missingImageIds = imageIds.filter(
            (imageId) => !existingMediaIds.includes(imageId),
        );

        if (missingImageIds.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "One or more images were not found or inactive",
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Check existing gallery images
        // --------------------------------------------------------

        const existingImageIds = destination.images.map((imageId) =>
            imageId.toString(),
        );

        const newImageIds = imageIds.filter(
            (imageId) => !existingImageIds.includes(imageId),
        );

        if (newImageIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All selected images are already in the gallery",
                },
                {
                    status: 409,
                },
            );
        }

        // --------------------------------------------------------
        // Add images
        // --------------------------------------------------------

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

        return NextResponse.json(
            {
                success: false,
                message: "Failed to add images to gallery",
            },
            {
                status: 500,
            },
        );
    }
}

// ============================================================
// PATCH - Reorder gallery
// ============================================================

export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return NextResponse.json(
                {
                    success: false,
                    message: authorization.message,
                },
                {
                    status: authorization.status,
                },
            );
        }

        const { id } = await params;

        const body = await request.json();

        const validation = updateGallerySchema.safeParse({
            destinationId: id,
            imageIds: body.imageIds,
        });

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: getValidationErrors(validation.error),
                },
                {
                    status: 400,
                },
            );
        }

        const { destinationId, imageIds } = validation.data;

        // --------------------------------------------------------
        // Find destination
        // --------------------------------------------------------

        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination not found",
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Check current gallery
        // --------------------------------------------------------

        const currentImageIds = destination.images.map((imageId) =>
            imageId.toString(),
        );

        // --------------------------------------------------------
        // Same number of images required
        // --------------------------------------------------------

        if (currentImageIds.length !== imageIds.length) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Reorder request must contain all existing gallery images",
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Check duplicate image IDs in request
        // --------------------------------------------------------

        const uniqueImageIds = new Set(imageIds);

        if (uniqueImageIds.size !== imageIds.length) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Reorder request cannot contain duplicate image IDs",
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Compare requested IDs with current IDs
        // --------------------------------------------------------

        const sortedCurrentIds = [...currentImageIds].sort();

        const sortedRequestedIds = [...imageIds].sort();

        const sameImages = sortedCurrentIds.every(
            (imageId, index) => imageId === sortedRequestedIds[index],
        );

        if (!sameImages) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Reorder request contains invalid gallery images",
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Reorder gallery
        // --------------------------------------------------------

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

        return NextResponse.json(
            {
                success: false,
                message: "Failed to reorder gallery",
            },
            {
                status: 500,
            },
        );
    }
}

// ============================================================
// DELETE - Remove image from gallery
// ============================================================

export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return NextResponse.json(
                {
                    success: false,
                    message: authorization.message,
                },
                {
                    status: authorization.status,
                },
            );
        }

        const { id } = await params;

        const { searchParams } = new URL(request.url);

        const imageId = searchParams.get("imageId");

        const validation = deleteGallerySchema.safeParse({
            destinationId: id,
            imageId,
        });

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: getValidationErrors(validation.error),
                },
                {
                    status: 400,
                },
            );
        }

        const { destinationId, imageId: validatedImageId } = validation.data;

        // --------------------------------------------------------
        // Find destination
        // --------------------------------------------------------

        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination not found",
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Check image exists in gallery
        // --------------------------------------------------------

        const imageExists = destination.images.some(
            (id) => id.toString() === validatedImageId,
        );

        if (!imageExists) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Image is not present in the gallery",
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Remove image from gallery
        // --------------------------------------------------------

        destination.images = destination.images.filter(
            (id) => id.toString() !== validatedImageId,
        );

        await destination.save();

        const updatedDestination = await Destination.findById(destinationId)
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

        return NextResponse.json(
            {
                success: false,
                message: "Failed to remove image from gallery",
            },
            {
                status: 500,
            },
        );
    }
}