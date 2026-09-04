import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Destination from "@/models/Destination";
import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Category from "@/models/Category";
import User from "@/models/User";
import Tag from "@/models/Tag";

export async function GET() {
    try {
        await connectDB();

        const destinations = await Destination.find({
            status: "published",
            featured: true,
        })
            .populate("featuredImage")
            .populate("images")
            .populate("categories")
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .lean();

        const blogs = await Blog.find({
            status: "published",
            featured: true,
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
            data: {
                destinations,
                blogs,
            },
        });
    } catch (error) {
        console.error("GET featured content error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch featured content",
            },
            {
                status: 500,
            },
        );
    }
}
