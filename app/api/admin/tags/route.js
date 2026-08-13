import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Tag from "@/models/Tag";

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

export async function GET() {
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

        const tags = await Tag.find().sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            data: tags,
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