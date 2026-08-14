import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import Media from "@/models/Media";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { createDestinationSchema } from "@/lib/validation/destination";
import { getValidationErrors } from "@/lib/validation/common";

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

        const destinations = await Destination.find()
            .populate("images")
            .populate("featuredImage")
            .populate("categories")
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: destinations,
        });
    } catch (error) {
        console.error("GET admin destinations error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch destinations",
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

        const validation = createDestinationSchema.safeParse(body);

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

        const data = validation.data;

        const {
            title,
            slug,
            shortDescription,
            description,
            location,
            images,
            featuredImage,
            featured,
            status,
            categories,
        } = data;

        if (featuredImage !== undefined) {
            if (
                featuredImage !== null &&
                !mongoose.Types.ObjectId.isValid(featuredImage)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid featured image ID",
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (featuredImage) {
                const mediaExists = await Media.exists({
                    _id: featuredImage,
                    isActive: true,
                });

                if (!mediaExists) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Featured image not found",
                        },
                        {
                            status: 404,
                        },
                    );
                }
            }
        }

        if (data.images?.length > 0) {
            const mediaCount = await Media.countDocuments({
                _id: { $in: data.images },
                isActive: true,
            });

            if (mediaCount !== data.images.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "One or more images were not found or inactive",
                    },
                    {
                        status: 404,
                    },
                );
            }
        }

        if (data.categories?.length > 0) {
            const categoryCount = await Category.countDocuments({
                _id: { $in: data.categories },
                isActive: true,
            });

            if (categoryCount !== data.categories.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "One or more categories were not found or inactive",
                    },
                    {
                        status: 404,
                    },
                );
            }
        }
        const destination = await Destination.create({
            title,
            slug,
            shortDescription,
            description,
            location,
            images,
            featuredImage,
            featured,
            status,
            categories,
            author: session.userId,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Destination created successfully",
                data: destination,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin destination error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination slug already exists",
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create destination",
            },
            {
                status: 500,
            },
        );
    }
}