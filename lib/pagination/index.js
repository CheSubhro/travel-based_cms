
export const getPaginationParams = (searchParams) => {
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = Math.max(
        Number.parseInt(pageParam || "1", 10),
        1,
    );

    const requestedLimit = Math.max(
        Number.parseInt(limitParam || "10", 10),
        1,
    );

    const limit = Math.min(requestedLimit, 100);

    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };
};

export const createPaginationMeta = ({
    page,
    limit,
    total,
}) => {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};