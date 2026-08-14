import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import User from "@/models/User";

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

        const filter = {};

        const [blogs, total] = await Promise.all([
            Blog.find(filter)
                .populate("featuredImage")
                .populate("category")
                .populate("tags")
                .populate("author", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Blog.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            data: blogs,
            pagination: createPaginationMeta({
                page,
                limit,
                total,
            }),
        });
    } catch (error) {
        console.error("GET admin blogs error:", error);

        return apiError("Failed to fetch blogs", 500);
    }
}