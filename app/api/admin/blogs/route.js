import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Tag from "@/models/Tag";
import User from "@/models/User";
import Category from "@/models/Category";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { apiError } from "@/lib/api/error";

import { getPaginationParams, createPaginationMeta } from "@/lib/pagination";

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

        const {
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            category,
            tags,
            status,
            featured,
            publishedAt,
            seo,
        } = body;

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

        const blog = await Blog.create({
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            category,
            tags,
            author: session.userId,
            status,
            featured,
            publishedAt,
            seo,
        });

        const populatedBlog = await Blog.findById(blog._id)
            .populate("featuredImage")
            .populate("category")
            .populate("tags")
            .populate("author", "name email")
            .lean();

        return NextResponse.json(
            {
                success: true,
                message: "Blog created successfully",
                data: populatedBlog,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin blog error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Blog slug already exists",
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create blog",
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [
            ROLES.ADMIN,
            ROLES.EDITOR,
            ROLES.AUTHOR,
        ]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { searchParams } = new URL(request.url);

        const { page, limit, skip } = getPaginationParams(searchParams);

        const status = searchParams.get("status");
        const featured = searchParams.get("featured");
        const category = searchParams.get("category");
        const tag = searchParams.get("tag");
        const author = searchParams.get("author");
        const search = searchParams.get("search");

        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const allowedSortFields = [
            "createdAt",
            "updatedAt",
            "title",
            "publishedAt",
        ];

        const allowedSortOrders = ["asc", "desc"];

        if (!allowedSortFields.includes(sortBy)) {
            return apiError("Invalid sort field", 400);
        }

        if (!allowedSortOrders.includes(sortOrder)) {
            return apiError("Invalid sort order", 400);
        }

        const filter = {};

        if (status) {
            const allowedStatuses = ["draft", "published", "archived"];

            if (!allowedStatuses.includes(status)) {
                return apiError("Invalid blog status", 400);
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

            filter.category = category;
        }

        if (tag) {
            if (!mongoose.Types.ObjectId.isValid(tag)) {
                return apiError("Invalid tag ID", 400);
            }

            filter.tags = tag;
        }

        if (author) {
            if (!mongoose.Types.ObjectId.isValid(author)) {
                return apiError("Invalid author ID", 400);
            }

            filter.author = author;
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
                    excerpt: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    slug: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    content: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
            ];
        }

        const sort = {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        };

        const [blogs, total] = await Promise.all([
            Blog.find(filter)
                .populate("featuredImage")
                .populate("category")
                .populate("tags")
                .populate("author", "name email")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            Blog.countDocuments(filter),
        ]);

        const pagination = createPaginationMeta({
            page,
            limit,
            total,
        });

        return NextResponse.json({
            success: true,
            data: blogs,
            pagination,
            filters: {
                status: status || null,
                featured: featured !== null ? featured === "true" : null,
                category: category || null,
                tag: tag || null,
                author: author || null,
                search: search?.trim() || null,
            },
            sorting: {
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("GET admin blogs error:", error);

        return apiError("Failed to fetch blogs", 500);
    }
}