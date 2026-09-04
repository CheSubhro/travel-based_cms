
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import Category from "@/models/Category";

const ITEMS_PER_PAGE = 6;

function getImageUrl(image) {
    if (!image) {
        return null;
    }

    if (typeof image === "string") {
        return image;
    }

    return image.url || image.secure_url || null;
}

function getSort(sort) {
    switch (sort) {
        case "oldest":
            return { createdAt: 1 };

        case "title-asc":
            return { title: 1 };

        case "title-desc":
            return { title: -1 };

        case "latest":
        default:
            return { createdAt: -1 };
    }
}

async function getCategories() {
    return Category.find({
        isActive: { $ne: false },
    })
        .sort({ name: 1 })
        .select("name slug")
        .lean();
}

async function getDestinations(searchParams) {
    try {
        await connectDB();

        const q = searchParams?.q?.trim() || "";
        const categorySlug = searchParams?.category?.trim() || "";
        const location = searchParams?.location?.trim() || "";
        const sort = searchParams?.sort?.trim() || "latest";

        let page = Number(searchParams?.page || 1);

        if (!Number.isInteger(page) || page < 1) {
            page = 1;
        }

        /*
         * Base query
         *
         * Only published and active destinations
         */
        const andConditions = [
            {
                status: "published",
            },
            {
                isActive: { $ne: false },
            },
        ];

        /*
         * Search
         *
         * Searches:
         * - title
         * - shortDescription
         * - description
         * - city
         * - state
         * - country
         */
        if (q) {
            const searchRegex = new RegExp(q, "i");

            andConditions.push({
                $or: [
                    { title: searchRegex },
                    { shortDescription: searchRegex },
                    { description: searchRegex },
                    { "location.city": searchRegex },
                    { "location.state": searchRegex },
                    { "location.country": searchRegex },
                ],
            });
        }

        /*
         * Category filter
         */
        if (categorySlug) {
            const category = await Category.findOne({
                slug: categorySlug,
                isActive: { $ne: false },
            })
                .select("_id")
                .lean();

            /*
             * If selected category does not exist,
             * return empty result.
             */
            if (!category) {
                const categories = await getCategories();

                return {
                    destinations: [],
                    categories: JSON.parse(JSON.stringify(categories)),
                    total: 0,
                    totalPages: 1,
                    page: 1,
                    query: q,
                    category: categorySlug,
                    location,
                    sort,
                };
            }

            andConditions.push({
                categories: category._id,
            });
        }

        /*
         * Location filter
         *
         * Matches:
         * - city
         * - state
         * - country
         */
        if (location) {
            const locationRegex = new RegExp(location, "i");

            andConditions.push({
                $or: [
                    { "location.city": locationRegex },
                    { "location.state": locationRegex },
                    { "location.country": locationRegex },
                ],
            });
        }

        const query = {
            $and: andConditions,
        };

        /*
         * Total results
         */
        const total = await Destination.countDocuments(query);

        const totalPages = Math.max(
            Math.ceil(total / ITEMS_PER_PAGE),
            1,
        );

        /*
         * Prevent invalid page number
         */
        if (page > totalPages) {
            page = totalPages;
        }

        /*
         * Fetch destinations
         */
        const destinations = await Destination.find(query)
            .populate("featuredImage")
            .populate("images")
            .populate("categories", "name slug")
            .sort(getSort(sort))
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .lean();

        const categories = await getCategories();

        return {
            destinations: JSON.parse(JSON.stringify(destinations)),
            categories: JSON.parse(JSON.stringify(categories)),
            total,
            totalPages,
            page,
            query: q,
            category: categorySlug,
            location,
            sort,
        };
    } catch (error) {
        console.error("Destinations page error:", error);

        return {
            destinations: [],
            categories: [],
            total: 0,
            totalPages: 1,
            page: 1,
            query: "",
            category: "",
            location: "",
            sort: "latest",
        };
    }
}


function createQueryString(params) {
    const query = new URLSearchParams();

    if (params.q) {
        query.set("q", params.q);
    }

    if (params.category) {
        query.set("category", params.category);
    }

    if (params.location) {
        query.set("location", params.location);
    }

    if (params.sort && params.sort !== "latest") {
        query.set("sort", params.sort);
    }

    if (params.page && params.page > 1) {
        query.set("page", String(params.page));
    }

    const value = query.toString();

    return value ? `?${value}` : "";
}

/*
 * Pagination
 */
function Pagination({ currentPage, totalPages, filters }) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {/* Previous */}
            {currentPage > 1 && (
                <Link
                    href={`/destinations${createQueryString({
                        ...filters,
                        page: currentPage - 1,
                    })}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    ← Previous
                </Link>
            )}

            {/* Page Numbers */}
            {pages.map((page) => (
                <Link
                    key={page}
                    href={`/destinations${createQueryString({
                        ...filters,
                        page,
                    })}`}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        page === currentPage
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {page}
                </Link>
            ))}

            {/* Next */}
            {currentPage < totalPages && (
                <Link
                    href={`/destinations${createQueryString({
                        ...filters,
                        page: currentPage + 1,
                    })}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    Next →
                </Link>
            )}
        </div>
    );
}

export default async function DestinationsPage({ searchParams }) {
    const params = await searchParams;

    const {
        destinations,
        categories,
        total,
        totalPages,
        page,
        query,
        category,
        location,
        sort,
    } = await getDestinations(params);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-300">
                        Explore the world
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        Discover Destinations
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg text-gray-300">
                        Explore beautiful destinations, discover new places,
                        and find inspiration for your next journey.
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                    <form
                        method="GET"
                        action="/destinations"
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    >
                        {/* Search */}
                        <div>
                            <label
                                htmlFor="q"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Search
                            </label>

                            <input
                                id="q"
                                name="q"
                                type="search"
                                defaultValue={query}
                                placeholder="Search destinations..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label
                                htmlFor="category"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Category
                            </label>

                            <select
                                id="category"
                                name="category"
                                defaultValue={category}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {categories.map((item) => (
                                    <option
                                        key={item._id}
                                        value={item.slug}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label
                                htmlFor="location"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                defaultValue={location}
                                placeholder="City, state or country"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            />
                        </div>

                        {/* Sort */}
                        <div>
                            <label
                                htmlFor="sort"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Sort By
                            </label>

                            <select
                                id="sort"
                                name="sort"
                                defaultValue={sort}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            >
                                <option value="latest">
                                    Latest
                                </option>

                                <option value="oldest">
                                    Oldest
                                </option>

                                <option value="title-asc">
                                    Title A-Z
                                </option>

                                <option value="title-desc">
                                    Title Z-A
                                </option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-end gap-3 md:col-span-2 lg:col-span-4">
                            <button
                                type="submit"
                                className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Apply Filters
                            </button>

                            <Link
                                href="/destinations"
                                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Clear
                            </Link>
                        </div>
                    </form>
                </div>
            </section>

            {/* Destination List */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    {/* Results Header */}
                    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {query || category || location
                                    ? "Filtered Destinations"
                                    : "Popular Destinations"}
                            </h2>

                            <p className="mt-2 text-gray-600">
                                {total} destination
                                {total !== 1 ? "s" : ""} found
                            </p>
                        </div>

                        {(query || category || location) && (
                            <Link
                                href="/destinations"
                                className="text-sm font-semibold text-gray-900 hover:underline"
                            >
                                Clear all filters →
                            </Link>
                        )}
                    </div>

                    {/* Results */}
                    {destinations.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <div className="text-4xl">🔎</div>

                            <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                No destinations found
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Try changing your search or filters.
                            </p>

                            <Link
                                href="/destinations"
                                className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                View all destinations
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {destinations.map((destination) => {
                                    /*
                                     * Prefer first gallery image,
                                     * then featured image,
                                     * then other possible image fields.
                                     */
                                    const imageUrl = getImageUrl(
                                        destination.images?.[0] ||
                                            destination.featuredImage ||
                                            destination.image ||
                                            destination.coverImage,
                                    );

                                    const locationText = [
                                        destination.location?.city,
                                        destination.location?.state,
                                        destination.location?.country,
                                    ]
                                        .filter(Boolean)
                                        .join(", ");

                                    return (
                                        <article
                                            key={destination._id}
                                            className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            {/* Image */}
                                            <Link
                                                href={`/destinations/${
                                                    destination.slug ||
                                                    destination._id
                                                }`}
                                            >
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={
                                                            destination.title ||
                                                            destination.name ||
                                                            "Destination"
                                                        }
                                                        className="h-64 w-full object-cover transition duration-500 hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-64 w-full items-center justify-center bg-gray-200 text-gray-500">
                                                        No image available
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Content */}
                                            <div className="p-6">
                                                {/* Categories */}
                                                {destination.categories
                                                    ?.length > 0 && (
                                                    <div className="mb-3 flex flex-wrap gap-2">
                                                        {destination.categories
                                                            .slice(0, 2)
                                                            .map((item) => (
                                                                <Link
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    href={`/destinations?category=${item.slug}`}
                                                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            ))}
                                                    </div>
                                                )}

                                                {/* Title */}
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    {destination.title ||
                                                        destination.name}
                                                </h3>

                                                {/* Location */}
                                                {locationText && (
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        📍 {locationText}
                                                    </p>
                                                )}

                                                {/* Description */}
                                                {destination.shortDescription ? (
                                                    <p className="mt-3 line-clamp-3 text-gray-600">
                                                        {
                                                            destination.shortDescription
                                                        }
                                                    </p>
                                                ) : destination.description ? (
                                                    <p className="mt-3 line-clamp-3 text-gray-600">
                                                        {
                                                            destination.description
                                                        }
                                                    </p>
                                                ) : null}

                                                {/* Explore */}
                                                <Link
                                                    href={`/destinations/${
                                                        destination.slug ||
                                                        destination._id
                                                    }`}
                                                    className="mt-5 inline-flex font-semibold text-gray-900 hover:underline"
                                                >
                                                    Explore Destination →
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                filters={{
                                    q: query,
                                    category,
                                    location,
                                    sort,
                                }}
                            />
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

