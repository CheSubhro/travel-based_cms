
export const successResponse = (
    data = null,
    message = "Success",
    status = 200,
) => {
    return Response.json(
        {
        success: true,
        message,
        data,
        },
        { status },
    );
};

export const errorResponse = (
    message = "Something went wrong",
    status = 500,
) => {
    return Response.json(
        {
        success: false,
        message,
        },
        { status },
    );
};