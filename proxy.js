
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

const secretKey = secret ? new TextEncoder().encode(secret) : null;

const verifySession = async (token) => {
    if (!token || !secretKey) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);

        return payload;
    } catch {
        return null;
    }
};

export async function proxy(request) {
    const sessionToken = request.cookies.get("session")?.value;

    const session = await verifySession(sessionToken);

    if (!session) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (session.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};