import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { updateUserSchema } from "@/lib/validation/user";
import { getValidationErrors } from "@/lib/validation/common";

// GET /api/admin/users/:id
export async function GET(request, { params }) {
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

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user ID",
                },
                {
                    status: 400,
                },
            );
        }

        const user = await User.findById(id).select("-password").lean();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("GET admin user error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch user",
            },
            {
                status: 500,
            },
        );
    }
}

// PATCH /api/admin/users/:id
export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

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

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user ID",
                },
                {
                    status: 400,
                },
            );
        }

        if (session.userId.toString() === id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot modify your own account from this API",
                },
                {
                    status: 403,
                },
            );
        }

        const body = await request.json();

        const validation = updateUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: getValidationErrors(validation.error),
                },
                {
                    status: 400,
                },
            );
        }

        const updateData = validation.data;

        if (updateData.email !== undefined) {
            const existingUser = await User.findOne({
                email: updateData.email,
                _id: { $ne: id },
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
        }

        if (updateData.password !== undefined) {
            updateData.password = await hashPassword(updateData.password);
        }

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .select("-password")
            .lean();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        console.error("PATCH admin user error:", error);

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
                message: "Failed to update user",
            },
            {
                status: 500,
            },
        );
    }
}

// DELETE /api/admin/users/:id
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

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

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user ID",
                },
                {
                    status: 400,
                },
            );
        }

        if (session.userId.toString() === id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot delete your own account",
                },
                {
                    status: 403,
                },
            );
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
            data: {
                id: user._id,
            },
        });
    } catch (error) {
        console.error("DELETE admin user error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete user",
            },
            {
                status: 500,
            },
        );
    }
}