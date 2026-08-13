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
                    message: "Invalid blog ID",
                },
                {
                    status: 400,
                },
            );
        }

        const blog = await Blog.findById(id)
            .populate("featuredImage")
            .populate("category")
            .populate("tags")
            .populate("author", "name email")
            .lean();

        if (!blog) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Blog not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: blog,
        });
    } catch (error) {
        console.error("GET admin blog error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch blog",
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
                    message: "Invalid blog ID",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const allowedFields = [
            "title",
            "slug",
            "excerpt",
            "content",
            "featuredImage",
            "category",
            "tags",
            "status",
            "featured",
            "publishedAt",
            "seo",
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
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

        // Automatically set publishedAt when blog becomes published
        if (updateData.status === "published" && !updateData.publishedAt) {
            updateData.publishedAt = new Date();
        }

        // Clear publishedAt when moving back to draft/archived
        if (updateData.status && updateData.status !== "published") {
            updateData.publishedAt = null;
        }

        const blog = await Blog.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("featuredImage")
            .populate("category")
            .populate("tags")
            .populate("author", "name email");

        if (!blog) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Blog not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error) {
        console.error("PATCH admin blog error:", error);

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
                message: "Failed to update blog",
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
                    message: "Invalid blog ID",
                },
                {
                    status: 400,
                },
            );
        }

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Blog not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Blog deleted successfully",
            data: {
                id: blog._id,
            },
        });
    } catch (error) {
        console.error("DELETE admin blog error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete blog",
            },
            {
                status: 500,
            },
        );
    }
}