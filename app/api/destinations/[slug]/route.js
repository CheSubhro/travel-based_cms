import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Destination from "@/models/Destination";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { slug } = await params;

        const destination = await Destination.findOne({
            slug,
            status: "published",
        })
            .populate("images")
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
        console.error("GET single destination error:", error);

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