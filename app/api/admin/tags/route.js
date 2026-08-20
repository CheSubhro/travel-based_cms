import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Tag from "@/models/Tag";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import getPagination from "@/utils/pagination";

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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

        const { name, slug, isActive } = body;

        const tag = await Tag.create({
            name,
            slug,
            isActive,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Tag created successfully",
                data: tag,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin tag error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tag slug already exists",
                },
                {
                    status: 409,
                },
            );
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Tag validation failed",
                    errors,
                },
                {
                    status: 400,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create tag",
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET(request) {
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

        const { searchParams } = new URL(request.url);

        const page = searchParams.get("page") || 1;
        const limit = searchParams.get("limit") || 10;
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status") || "all";

        const {
            page: currentPage,
            limit: perPage,
            skip,
        } = getPagination(page, limit);

        const filter = {};

        if (search) {
            const searchTerm = escapeRegex(search);

            filter.$or = [
                {
                    name: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    slug: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
            ];
        }

        if (status === "active") {
            filter.isActive = true;
        }

        if (status === "inactive") {
            filter.isActive = false;
        }

        const [tags, total] = await Promise.all([
            Tag.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .lean(),

            Tag.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / perPage);

        return NextResponse.json({
            success: true,
            data: tags,
            pagination: {
                page: currentPage,
                limit: perPage,
                total,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
            },
        });
    } catch (error) {
        console.error("GET admin tags error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch tags",
            },
            {
                status: 500,
            },
        );
    }
}