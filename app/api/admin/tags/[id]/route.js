import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Tag from "@/models/Tag";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

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
                    message: "Invalid tag ID",
                },
                {
                    status: 400,
                },
            );
        }

        const tag = await Tag.findById(id).lean();

        if (!tag) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tag not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: tag,
        });
    } catch (error) {
        console.error("GET admin tag error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch tag",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(request, { params }) {
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
                    message: "Invalid tag ID",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const allowedFields = ["name", "slug", "isActive"];

        const updateData = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No valid fields provided for update",
                },
                {
                    status: 400,
                },
            );
        }

        const tag = await Tag.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).lean();

        if (!tag) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tag not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Tag updated successfully",
            data: tag,
        });
    } catch (error) {
        console.error("PATCH admin tag error:", error);

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
                message: "Failed to update tag",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const session = await getSession();

        // Permanent delete শুধুমাত্র Admin করতে পারবে
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
                    message: "Invalid tag ID",
                },
                {
                    status: 400,
                },
            );
        }

        const tag = await Tag.findByIdAndDelete(id);

        if (!tag) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tag not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Tag deleted successfully",
            data: {
                id: tag._id,
            },
        });
    } catch (error) {
        console.error("DELETE admin tag error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete tag",
            },
            {
                status: 500,
            },
        );
    }
}