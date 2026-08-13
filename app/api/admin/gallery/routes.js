
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Destination from "@/models/Destination";
import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";


export async function GET(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [
            ROLES.ADMIN,
            ROLES.EDITOR,
        ]);

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

        const { searchParams } = new URL(request.url);

        const destinationId = searchParams.get("destinationId");

        if (!destinationId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        if (!mongoose.Types.ObjectId.isValid(destinationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

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

export async function POST(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [
            ROLES.ADMIN,
            ROLES.EDITOR,
        ]);

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

        const body = await request.json();

        const { destinationId, imageIds } = body;

        if (!destinationId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        if (!mongoose.Types.ObjectId.isValid(destinationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

        if (!Array.isArray(imageIds) || imageIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "imageIds must be a non-empty array",
                },
                {
                    status: 400,
                },
            );
        }

        const invalidImageIds = imageIds.filter(
            (imageId) => !mongoose.Types.ObjectId.isValid(imageId),
        );

        if (invalidImageIds.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "One or more image IDs are invalid",
                },
                {
                    status: 400,
                },
            );
        }

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

export async function PATCH(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [
            ROLES.ADMIN,
            ROLES.EDITOR,
        ]);

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

        const body = await request.json();

        const { destinationId, imageIds } = body;

        if (!destinationId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        if (!mongoose.Types.ObjectId.isValid(destinationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

        if (!Array.isArray(imageIds)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "imageIds must be an array",
                },
                {
                    status: 400,
                },
            );
        }

        const invalidImageIds = imageIds.filter(
            (imageId) => !mongoose.Types.ObjectId.isValid(imageId),
        );

        if (invalidImageIds.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "One or more image IDs are invalid",
                },
                {
                    status: 400,
                },
            );
        }

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

        const currentImageIds = destination.images.map((imageId) =>
            imageId.toString(),
        );

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

        const sortedCurrentIds = [...currentImageIds].sort();
        const sortedRequestedIds = [...imageIds].sort();

        const sameImages = sortedCurrentIds.every(
            (imageId, index) => imageId === sortedRequestedIds[index],
        );

        if (!sameImages) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Reorder request contains invalid gallery images",
                },
                {
                    status: 400,
                },
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

export async function DELETE(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [
            ROLES.ADMIN,
            ROLES.EDITOR,
        ]);

        if (!authorization.authorized) {
            return NextResponse.json(
                {
                    success: false,
                    message: authorization.message,
                },
                {
                    status: 403,
                },
            );
        }

        const { searchParams } = new URL(request.url);

        const destinationId = searchParams.get("destinationId");
        const imageId = searchParams.get("imageId");

        if (!destinationId || !imageId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination ID and image ID are required",
                },
                {
                    status: 400,
                },
            );
        }

        if (!mongoose.Types.ObjectId.isValid(destinationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

        if (!mongoose.Types.ObjectId.isValid(imageId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid image ID",
                },
                {
                    status: 400,
                },
            );
        }

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

        const imageExists = destination.images.some(
            (id) => id.toString() === imageId,
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

        destination.images = destination.images.filter(
            (id) => id.toString() !== imageId,
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

