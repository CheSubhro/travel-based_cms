import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

import Media from "@/models/Media";
import Blog from "@/models/Blog";
import Destination from "@/models/Destination";
import Category from "@/models/Category";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { apiError } from "@/lib/api/error";

export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return apiError("Invalid media ID", 400);
        }

        const media = await Media.findById(id);

        if (!media) {
            return apiError("Media not found", 404);
        }

        // Check Blog usage
        const blogUsingMedia = await Blog.exists({
            $or: [
                {
                    featuredImage: media._id,
                },
                {
                    images: media._id,
                },
            ],
        });

        if (blogUsingMedia) {
            return apiError(
                "This media is being used by a blog and cannot be deleted",
                409,
            );
        }

        // Check Destination usage
        const destinationUsingMedia = await Destination.exists({
            $or: [
                {
                    featuredImage: media._id,
                },
                {
                    images: media._id,
                },
            ],
        });

        if (destinationUsingMedia) {
            return apiError(
                "This media is being used by a destination and cannot be deleted",
                409,
            );
        }

        // Check Category usage
        const categoryUsingMedia = await Category.exists({
            image: media._id,
        });

        if (categoryUsingMedia) {
            return apiError(
                "This media is being used by a category and cannot be deleted",
                409,
            );
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(media.publicId, {
            resource_type: media.resourceType || "image",
        });

        // Delete from MongoDB
        await Media.findByIdAndDelete(media._id);

        return NextResponse.json({
            success: true,
            message: "Media deleted successfully",
            data: {
                id: media._id,
                publicId: media.publicId,
            },
        });
    } catch (error) {
        console.error("DELETE admin media error:", error);

        return apiError("Failed to delete media", 500);
    }
}

export async function GET(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { id } = await params;

        if (!id) {
            return apiError("Media ID is required", 400);
        }

        const media = await Media.findById(id)
            .populate("uploadedBy", "name email")
            .lean();

        if (!media) {
            return apiError("Media not found", 404);
        }

        return NextResponse.json({
            success: true,
            data: media,
        });
    } catch (error) {
        console.error("GET admin media by ID error:", error);

        if (error.name === "CastError") {
            return apiError("Invalid media ID", 400);
        }

        return apiError("Failed to fetch media", 500);
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return apiError("Invalid media ID", 400);
        }

        const body = await request.json();

        const alt = typeof body.alt === "string" ? body.alt.trim() : undefined;

        const caption =
            typeof body.caption === "string" ? body.caption.trim() : undefined;

        const isActive =
            typeof body.isActive === "boolean" ? body.isActive : undefined;

        if (alt !== undefined && !alt) {
            return apiError("Alt text is required", 400);
        }

        if (alt !== undefined && alt.length > 200) {
            return apiError("Alt text cannot exceed 200 characters", 400);
        }

        if (caption !== undefined && caption.length > 500) {
            return apiError("Caption cannot exceed 500 characters", 400);
        }

        const updateData = {};

        if (alt !== undefined) {
            updateData.alt = alt;
        }

        if (caption !== undefined) {
            updateData.caption = caption;
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        if (Object.keys(updateData).length === 0) {
            return apiError("No valid fields to update", 400);
        }

        const media = await Media.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("uploadedBy", "name email")
            .lean();

        if (!media) {
            return apiError("Media not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Media updated successfully",
            data: media,
        });
    } catch (error) {
        console.error("PATCH admin media error:", error);

        if (error.name === "ValidationError") {
            return apiError(error.message, 400);
        }

        return apiError("Failed to update media", 500);
    }
}

