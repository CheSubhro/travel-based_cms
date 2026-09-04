import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Tag from "@/models/Tag";
import User from "@/models/User";
import Category from "@/models/Category";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { slug } = await params;

        const blog = await Blog.findOne({
            slug,
            status: "published",
        })
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
        console.error("GET public blog details error:", error);

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