
import { successResponse } from "@/lib/apiResponse";

export async function GET() {
    return successResponse(
        {
            status: "ok",
        },
            "API is healthy",
    );
}