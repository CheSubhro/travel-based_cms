import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Destination from "@/models/Destination";
import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Category from "@/models/Category";
import User from "@/models/User";

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim();

        if (!query) {
            return NextResponse.json({
                success: true,
                data: {
                    destinations: [],
                    blogs: [],
                },
            });
        }

        const searchRegex = new RegExp(query, "i");

        const destinations = await Destination.find({
            status: "published",
            $or: [
                { title: searchRegex },
                { slug: searchRegex },
                { shortDescription: searchRegex },
                { description: searchRegex },
                { country: searchRegex },
                { state: searchRegex },
                { city: searchRegex },
            ],
        })
            .populate("featuredImage")
            .populate("images")
            .populate("categories")
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .lean();

        const blogs = await Blog.find({
            status: "published",
            $or: [
                { title: searchRegex },
                { slug: searchRegex },
                { excerpt: searchRegex },
                { content: searchRegex },
            ],
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
        console.error("GET public search error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to search content",
            },
            {
                status: 500,
            },
        );
    }
}