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

import { apiError } from "@/lib/api/error";
import { getPaginationParams, createPaginationMeta } from "@/lib/pagination";

export async function GET(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { searchParams } = new URL(request.url);
        const { page, limit, skip } = getPaginationParams(searchParams);
        const status = searchParams.get("status");
        const featured = searchParams.get("featured");
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        const filter = {};

        if (status) {
            const allowedStatuses = ["draft", "published", "archived"];

            if (!allowedStatuses.includes(status)) {
                return apiError("Invalid destination status", 400);
            }

            filter.status = status;
        }

        if (featured !== null) {
            if (featured !== "true" && featured !== "false") {
                return apiError("Featured must be true or false", 400);
            }

            filter.featured = featured === "true";
        }

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return apiError("Invalid category ID", 400);
            }

            filter.categories = category;
        }

        if (search?.trim()) {
            const searchTerm = search.trim();

            filter.$or = [
                {
                    title: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    shortDescription: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    location: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
            ];
        }

        const [destinations, total] = await Promise.all([
            Destination.find(filter)
                .populate("images")
                .populate("featuredImage")
                .populate("categories")
                .populate("author", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Destination.countDocuments(filter),
        ]);

        const pagination = createPaginationMeta({
            page,
            limit,
            total,
        });

        return NextResponse.json({
            success: true,
            data: destinations,
            pagination,
            filters: {
                status: status || null,
                featured: featured !== null ? featured === "true" : null,
                category: category || null,
                search: search?.trim() || null,
            },
        });
    } catch (error) {
        console.error("GET admin destinations error:", error);

        return apiError("Failed to fetch destinations", 500);
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

        const validation = createDestinationSchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Validation failed",
                400,
                getValidationErrors(validation.error),
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

        // Validate featured image
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

        // Validate gallery images
        if (images?.length > 0) {
            const mediaCount = await Media.countDocuments({
                _id: { $in: images },
                isActive: true,
            });

            if (mediaCount !== images.length) {
                return apiError(
                    "One or more images were not found or inactive",
                    404,
                );
            }
        }

        // Validate categories
        if (categories?.length > 0) {
            const categoryCount = await Category.countDocuments({
                _id: { $in: categories },
                isActive: true,
            });

            if (categoryCount !== categories.length) {
                return apiError(
                    "One or more categories were not found or inactive",
                    404,
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
            return apiError("Destination slug already exists", 409);
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return apiError("Destination validation failed", 400, errors);
        }

        return apiError("Failed to create destination", 500);
    }
}