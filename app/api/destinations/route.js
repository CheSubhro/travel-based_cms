import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Destination from "@/models/Destination";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

export async function GET() {
    try {
        await connectDB();

        const destinations = await Destination.find({
            status: "published",
        })
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
        console.error("GET destinations error:", error);

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

