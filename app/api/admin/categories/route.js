import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Category from "@/models/Category";
import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { createCategorySchema } from "@/lib/validation/category";
import { getValidationErrors } from "@/lib/validation/common";

export async function POST(request) {
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

        const body = await request.json();

        // Validate request body
        const validation = createCategorySchema.safeParse(body);

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
        const data = validation.data;

        const { name, slug, description, image, isActive } = data;

        // Validate category image
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

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            isActive,
        });

        const populatedCategory = await Category.findById(category._id)
            .populate("image")
            .lean();

        return NextResponse.json(
            {
                success: true,
                message: "Category created successfully",
                data: populatedCategory,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin category error:", error);

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
                message: "Failed to create category",
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET() {
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

        const categories = await Category.find()
            .populate("image")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("GET admin categories error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
            },
            {
                status: 500,
            },
        );
    }
}