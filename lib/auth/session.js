
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
    throw new Error("AUTH_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);

export const createSession = async (user) => {
    return new SignJWT({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
};

export const verifySession = async (token) => {
    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);

        return payload;
    } catch {
        return null;
    }
};

export const getSession = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
        return null;
    }

    return verifySession(token);
};