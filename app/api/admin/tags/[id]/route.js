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