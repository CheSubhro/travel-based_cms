import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Destination from "@/models/Destination";

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const type = searchParams.get("type");
        const id = searchParams.get("id");

        if (!type || !id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Type and id are required",
                },
                {
                    status: 400,
                },
            );
        }

        if (type === "blog") {
            const currentBlog = await Blog.findOne({
                _id: id,
                status: "published",
            })
                .select("category")
                .lean();

            if (!currentBlog) {
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

            const query = {
                _id: { $ne: id },
                status: "published",
            };

            if (currentBlog.category) {
                query.category = currentBlog.category;
            }

            const blogs = await Blog.find(query)
                .populate("featuredImage")
                .populate("category")
                .populate("author", "name email")
                .sort({
                    publishedAt: -1,
                    createdAt: -1,
                })
                .limit(3)
                .lean();

            return NextResponse.json({
                success: true,
                data: blogs,
            });
        }

        if (type === "destination") {
            const currentDestination = await Destination.findOne({
                _id: id,
                status: "published",
            })
                .select("categories")
                .lean();

            if (!currentDestination) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Destination not found",
                    },
                    {
                        status: 404,
                    },
                );
            }

            const query = {
                _id: { $ne: id },
                status: "published",
            };

            if (currentDestination.categories?.length > 0) {
                query.categories = {
                    $in: currentDestination.categories,
                };
            }

            const destinations = await Destination.find(query)
                .populate("featuredImage")
                .populate("categories")
                .populate("author", "name email")
                .sort({
                    createdAt: -1,
                })
                .limit(3)
                .lean();

            return NextResponse.json({
                success: true,
                data: destinations,
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: "Invalid content type",
            },
            {
                status: 400,
            },
        );
    } catch (error) {
        console.error("GET related content error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch related content",
            },
            {
                status: 500,
            },
        );
    }
}