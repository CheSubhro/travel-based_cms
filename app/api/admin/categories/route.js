import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Category from "@/models/Category";
import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { createCategorySchema } from "@/lib/validation/category";
import { getValidationErrors } from "@/lib/validation/common";

import { apiError } from "@/lib/api/error";

export async function POST(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const body = await request.json();

        // Validate request body
        const validation = createCategorySchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
            );
        }

        // Use validated data only
        const data = validation.data;

        const { name, slug, description, image, isActive } = data;

        // Validate category image
        if (image !== undefined && image !== null) {
            const mediaExists = await Media.exists({
                _id: image,
                isActive: true,
            });

            if (!mediaExists) {
                return apiError("Category image not found", 404);
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
            return apiError("Category slug already exists", 409);
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return apiError("Category validation failed", 400, errors);
        }

        return apiError("Failed to create category", 500);
    }
}

export async function GET() {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
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

        return apiError("Failed to fetch categories", 500);
    }
}