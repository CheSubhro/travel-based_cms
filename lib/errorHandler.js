
import { errorResponse } from "./apiResponse";

export const handleApiError = (error) => {
    console.error("API Error:", error);

    if (error.name === "ValidationError") {
        return errorResponse("Validation failed", 400);
    }

    if (error.name === "CastError") {
        return errorResponse("Invalid ID format", 400);
    }

    return errorResponse(error.message || "Internal Server Error", 500);
};