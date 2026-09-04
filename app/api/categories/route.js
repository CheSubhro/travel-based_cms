

import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find({
            isActive: true,
        })
            .populate("image")
            .sort({
                name: 1,
            })
            .lean();

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("GET public categories error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
                data: [],
            },
            {
                status: 500,
            },
        );
    }
}

