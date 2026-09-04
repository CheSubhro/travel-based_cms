
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Tag from "@/models/Tag";
import User from "@/models/User";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectDB();

        const blogs = await Blog.find({
            status: "published",
        })
            .populate("featuredImage")
            .populate("category")
            .populate("tags")
            .populate("author", "name email")
            .sort({
                publishedAt: -1,
                createdAt: -1,
            })
            .lean();

        return NextResponse.json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        console.error("GET public blogs error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch blogs",
            },
            {
                status: 500,
            },
        );
    }
}