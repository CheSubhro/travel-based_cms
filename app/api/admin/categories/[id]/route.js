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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid category ID",
                },
                {
                    status: 400,
                },
            );
        }

        const category = await Category.findById(id).populate("image").lean();

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("GET admin category error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch category",
            },
            {
                status: 500,
            },
        );
    }
}

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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid category ID",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        // Validate request body
        const validation = updateCategorySchema.safeParse(body);

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

        // Use validated data only
        const updateData = validation.data;

        // Validate category image
        const { image } = updateData;

        if (image !== undefined && image !== null) {
            if (!mongoose.Types.ObjectId.isValid(image)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid category image ID",
                    },
                    {
                        status: 400,
                    },
                );
            }

            const mediaExists = await Media.exists({
                _id: image,
                isActive: true,
            });

            if (!mediaExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Category image not found",
                    },
                    {
                        status: 404,
                    },
                );
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No valid fields provided for update",
                },
                {
                    status: 400,
                },
            );
        }

        const category = await Category.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("image")
            .lean();

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        console.error("PATCH admin category error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category slug already exists",
                },
                {
                    status: 409,
                },
            );
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Category validation failed",
                    errors,
                },
                {
                    status: 400,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update category",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN]);

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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid category ID",
                },
                {
                    status: 400,
                },
            );
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404,
                },
            );
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

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete category",
            },
            {
                status: 500,
            },
        );
    }
}