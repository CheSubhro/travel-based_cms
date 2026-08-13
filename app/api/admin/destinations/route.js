import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import Media from "@/models/Media";
import Category from "@/models/Category";
import User from "@/models/User";
import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

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

        const destinations = await Destination.find()
            .populate("images")
            .populate("categories")
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: destinations,
        });
    } catch (error) {
        console.error("GET admin destinations error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch destinations",
            },
            {
                status: 500,
            },
        );
    }
}