

import { NextResponse } from "next/server";

export const apiError = (message, status = 500, errors) => {
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

