import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Destination from "@/models/Destination";
import Category from "@/models/Category";
import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { apiError } from "@/lib/api/error";

export async function GET() {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const [
            // Blogs
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            archivedBlogs,
            featuredBlogs,
            recentBlogs,

            // Destinations
            totalDestinations,
            publishedDestinations,
            draftDestinations,
            archivedDestinations,
            featuredDestinations,
            recentDestinations,

            // Categories
            totalCategories,
            activeCategories,
            inactiveCategories,

            // Media
            totalMedia,
            activeMedia,
        ] = await Promise.all([
            // Blogs
            Blog.countDocuments(),
            Blog.countDocuments({ status: "published" }),
            Blog.countDocuments({ status: "draft" }),
            Blog.countDocuments({ status: "archived" }),
            Blog.countDocuments({ featured: true }),

            Blog.find().sort({ createdAt: -1 }).limit(5).lean(),

            // Destinations
            Destination.countDocuments(),
            Destination.countDocuments({ status: "published" }),
            Destination.countDocuments({ status: "draft" }),
            Destination.countDocuments({ status: "archived" }),
            Destination.countDocuments({ featured: true }),

            Destination.find().sort({ createdAt: -1 }).limit(5).lean(),

            // Categories
            Category.countDocuments(),
            Category.countDocuments({ isActive: true }),
            Category.countDocuments({ isActive: false }),

            // Media
            Media.countDocuments(),
            Media.countDocuments({ isActive: true }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                blogs: {
                    total: totalBlogs,
                    published: publishedBlogs,
                    draft: draftBlogs,
                    archived: archivedBlogs,
                    featured: featuredBlogs,
                    recent: recentBlogs,
                },

                destinations: {
                    total: totalDestinations,
                    published: publishedDestinations,
                    draft: draftDestinations,
                    archived: archivedDestinations,
                    featured: featuredDestinations,
                    recent: recentDestinations,
                },

                categories: {
                    total: totalCategories,
                    active: activeCategories,
                    inactive: inactiveCategories,
                },

                media: {
                    total: totalMedia,
                    active: activeMedia,
                },
            },
        });
    } catch (error) {
        console.error("GET admin dashboard statistics error:", error);

        return apiError("Failed to fetch dashboard statistics", 500);
    }
}