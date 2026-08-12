import connectDB from "@/lib/mongodb";
import { successResponse } from "@/lib/apiResponse";
import { handleApiError } from "@/lib/errorHandler";

export async function GET() {
    try {
        await connectDB();

        return successResponse(null, "Database connected");
    } catch (error) {
        return handleApiError(error);
    }
}