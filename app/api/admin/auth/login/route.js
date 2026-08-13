import { NextResponse } from "next/server";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { ROLES } from "@/constants/roles";
import connectDB  from "../../../../../lib/mongodb";


export async function POST(request) {
    
    try {
        await connectDB();

        const body = await request.json();

        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                { status: 400 },
            );
        }

        const user = await User.findOne({
            email,
            isActive: true,
        }).select("+password");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 },
            );
        }

        if (user.role !== ROLES.ADMIN) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin access required",
                },
                { status: 403 },
            );
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 },
            );
        }

        const token = await createSession(user);

        const response = NextResponse.json({
            success: true,
            message: "Admin login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error("Admin login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 },
        );
    }
}