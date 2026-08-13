import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import User from "@/models/User";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

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