import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

// GET /api/admin/users
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

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("GET admin users error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch users",
            },
            {
                status: 500,
            },
        );
    }
}

// POST /api/admin/users
export async function POST(request) {
    try {
        await connectDB();

        const session = await getSession();

        // Only Admin can create users
        const authorization = requireRole(session, [ROLES.ADMIN]);

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

        const { name, email, password, role, isActive } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, email and password are required",
                },
                {
                    status: 400,
                },
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User with this email already exists",
                },
                {
                    status: 409,
                },
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: role || ROLES.AUTHOR,
            isActive: isActive !== undefined ? isActive : true,
        });

        return NextResponse.json(
            {
                success: true,
                message: "User created successfully",
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin users error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User with this email already exists",
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
                    message: "User validation failed",
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
                message: "Failed to create user",
            },
            {
                status: 500,
            },
        );
    }
}