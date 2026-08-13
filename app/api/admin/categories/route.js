import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Category from "@/models/Category";
import User from "@/models/User";

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

        const { name, slug, description, image, isActive } = body;

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            isActive,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category created successfully",
                data: category,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin category error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category slug already exists",
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
                    message: "Category validation failed",
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
                message: "Failed to create category",
            },
            {
                status: 500,
            },
        );
    }
}