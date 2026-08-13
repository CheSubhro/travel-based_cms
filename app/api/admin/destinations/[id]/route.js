import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";

import Destination from "@/models/Destination";
import Media from "@/models/Media";
import Category from "@/models/Category";
import User from "@/models/User";

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
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

        const destination = await Destination.findById(id)
            .populate("images")
            .populate("featuredImage")
            .populate("categories")
            .populate("author", "name email")
            .lean();

        if (!destination) {
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

        return NextResponse.json({
            success: true,
            data: destination,
        });
    } catch (error) {
        console.error("GET admin destination error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch destination",
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
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const { featuredImage } = body;

        if (featuredImage !== undefined) {
            if (
                featuredImage !== null &&
                !mongoose.Types.ObjectId.isValid(featuredImage)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid featured image ID",
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (featuredImage) {
                const mediaExists = await Media.exists({
                    _id: featuredImage,
                    isActive: true,
                });

                if (!mediaExists) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Featured image not found",
                        },
                        {
                            status: 404,
                        },
                    );
                }
            }
        }

        const allowedFields = [
            "title",
            "slug",
            "shortDescription",
            "description",
            "location",
            "images",
            "featuredImage",
            "featured",
            "status",
            "categories",
        ];

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

        const destination = await Destination.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            },
        )
            .populate("images")
            .populate("featuredImage")
            .populate("categories")
            .populate("author", "name email");

        if (!destination) {
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

        return NextResponse.json({
            success: true,
            message: "Destination updated successfully",
            data: destination,
        });
    } catch (error) {
        console.error("PATCH admin destination error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Destination slug already exists",
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update destination",
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
                    message: "Invalid destination ID",
                },
                {
                    status: 400,
                },
            );
        }

        const destination = await Destination.findByIdAndDelete(id);

        if (!destination) {
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

        return NextResponse.json({
            success: true,
            message: "Destination deleted successfully",
            data: {
                id: destination._id,
            },
        });
    } catch (error) {
        console.error("DELETE admin destination error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete destination",
            },
            {
                status: 500,
            },
        );
    }
}