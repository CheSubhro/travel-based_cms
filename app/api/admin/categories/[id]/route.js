import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Category from "@/models/Category";
import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { updateCategorySchema } from "@/lib/validation/category";
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
            return apiError("Invalid category ID", 400);
        }

        const category = await Category.findById(id).populate("image").lean();

        if (!category) {
            return apiError("Category not found", 404);
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("GET admin category error:", error);

        return apiError("Failed to fetch category", 500);
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
            return apiError("Invalid category ID", 400);
        }

        const body = await request.json();

        // Validate request body
        const validation = updateCategorySchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        // Use validated data only
        const updateData = validation.data;

        // Validate category image
        const { image } = updateData;

        if (image !== undefined && image !== null) {
            const mediaExists = await Media.exists({
                _id: image,
                isActive: true,
            });

            if (!mediaExists) {
                return apiError("Category image not found", 404);
            }
        }

        if (Object.keys(updateData).length === 0) {
            return apiError("No valid fields provided for update", 400);
        }

        const category = await Category.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("image")
            .lean();

        if (!category) {
            return apiError("Category not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        console.error("PATCH admin category error:", error);

        if (error.code === 11000) {
            return apiError("Category slug already exists", 409);
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return apiError("Category validation failed", 400, errors);
        }

        return apiError("Failed to update category", 500);
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
            return apiError("Invalid category ID", 400);
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return apiError("Category not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully",
            data: {
                id: category._id,
            },
        });
    } catch (error) {
        console.error("DELETE admin category error:", error);

        return apiError("Failed to delete category", 500);
    }
}