import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Destination from "@/models/Destination";
import Media from "@/models/Media";
import Category from "@/models/Category";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { updateDestinationSchema } from "@/lib/validation/destination";
import { getValidationErrors } from "@/lib/validation/common";

import { apiError } from "@/lib/api/error";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return apiError("Invalid destination ID", 400);
        }

        const destination = await Destination.findById(id)
            .populate("images")
            .populate("featuredImage")
            .populate("categories")
            .populate("author", "name email")
            .lean();

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        return NextResponse.json({
            success: true,
            data: destination,
        });
    } catch (error) {
        console.error("GET admin destination error:", error);

        return apiError("Failed to fetch destination", 500);
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return apiError("Invalid destination ID", 400);
        }

        const body = await request.json();

        const validation = updateDestinationSchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        const updateData = validation.data;

        const { featuredImage } = updateData;

        if (featuredImage !== undefined) {
            if (
                featuredImage !== null &&
                !mongoose.Types.ObjectId.isValid(featuredImage)
            ) {
                return apiError("Invalid featured image ID", 400);
            }

            if (featuredImage) {
                const mediaExists = await Media.exists({
                    _id: featuredImage,
                    isActive: true,
                });

                if (!mediaExists) {
                    return apiError("Featured image not found", 404);
                }
            }
        }

        if (updateData.images?.length > 0) {
            const mediaCount = await Media.countDocuments({
                _id: { $in: updateData.images },
                isActive: true,
            });

            if (mediaCount !== updateData.images.length) {
                return apiError(
                    "One or more images were not found or inactive",
                    404,
                );
            }
        }

        if (updateData.categories?.length > 0) {
            const categoryCount = await Category.countDocuments({
                _id: { $in: updateData.categories },
                isActive: true,
            });

            if (categoryCount !== updateData.categories.length) {
                return apiError(
                    "One or more categories were not found or inactive",
                    404,
                );
            }
        }

        if (Object.keys(updateData).length === 0) {
            return apiError("No valid fields provided for update", 400);
        }

        const destination = await Destination.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            },
        )
            .populate("images")
            .populate("featuredImage")
            .populate("categories")
            .populate("author", "name email");

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Destination updated successfully",
            data: destination,
        });
    } catch (error) {
        console.error("PATCH admin destination error:", error);

        if (error.code === 11000) {
            return apiError("Destination slug already exists", 409);
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return apiError("Validation failed", 400, errors);
        }

        return apiError("Failed to update destination", 500);
    }
}

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
            return apiError("Invalid destination ID", 400);
        }

        const destination = await Destination.findByIdAndDelete(id);

        if (!destination) {
            return apiError("Destination not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Destination deleted successfully",
            data: {
                id: destination._id,
            },
        });
    } catch (error) {
        console.error("DELETE admin destination error:", error);

        return apiError("Failed to delete destination", 500);
    }
}