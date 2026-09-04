import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import User from "@/models/User";
import Blog from "@/models/Blog";
import Media from "@/models/Media";
import Category from "@/models/Category";
import Tag from "@/models/Tag";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const author = await User.findById(id).select("name email").lean();

        if (!author) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Author not found",
                },
                {
                    status: 404,
                },
            );
        }

        const blogs = await Blog.find({
            author: id,
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
            data: {
                author,
                blogs,
            },
        });
    } catch (error) {
        console.error("GET public author error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch author",
            },
            {
                status: 500,
            },
        );
    }
}