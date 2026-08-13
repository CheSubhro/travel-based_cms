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