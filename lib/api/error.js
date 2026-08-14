
import { NextResponse } from "next/server";

export const apiError = (
    message = "Something went wrong",
    status = 500,
    errors = undefined,
) => {
    return NextResponse.json(
        {
            success: false,
            message,
            ...(errors ? { errors } : {}),
        },
        {
            status,
        },
    );
};