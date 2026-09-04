import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Category from "@/models/Category";
import Blog from "@/models/Blog";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { slug } = await params;

        const category = await Category.findOne({
            slug,
            isActive: true,
        }).lean();

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404,
                },
            );
        }

        const blogs = await Blog.find({
            category: category._id,
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
                category,
                blogs,
            },
        });
    } catch (error) {
        console.error("GET public category error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch category",
            },
            {
                status: 500,
            },
        );
    }
}