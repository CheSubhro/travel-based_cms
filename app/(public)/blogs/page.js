

import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Tag from "@/models/Tag";
import Media from "@/models/Media";
import Category from "@/models/Category";
import User from "@/models/User";

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

function formatDate(date) {
    if (!date) {
        return null;
    }

    return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
}

function getSort(sort) {
    switch (sort) {
        case "oldest":
            return { publishedAt: 1 };

        case "title-asc":
            return { title: 1 };

        case "title-desc":
            return { title: -1 };

        case "latest":
        default:
            return { publishedAt: -1 };
    }
}

async function getTags() {
    return Tag.find({
        isActive: { $ne: false },
    })
        .sort({ name: 1 })
        .select("name slug")
        .lean();
}

async function getBlogs(searchParams) {
    try {
        await connectDB();

        const q = searchParams?.q?.trim() || "";
        const tagSlug = searchParams?.tag?.trim() || "";
        const sort = searchParams?.sort?.trim() || "latest";

        let page = Number(searchParams?.page || 1);

        if (!Number.isInteger(page) || page < 1) {
            page = 1;
        }

        /*
         * Base query
         *
         * Only published blogs are shown
         */
        const andConditions = [
            {
                status: "published",
            },
        ];

        /*
         * Search
         *
         * Searches:
         * - title
         * - excerpt
         * - content
         */
        if (q) {
            const searchRegex = new RegExp(q, "i");

            andConditions.push({
                $or: [
                    { title: searchRegex },
                    { excerpt: searchRegex },
                    { content: searchRegex },
                ],
            });
        }

        /*
         * Tag filter
         */
        if (tagSlug) {
            const tag = await Tag.findOne({
                slug: tagSlug,
                isActive: { $ne: false },
            })
                .select("_id")
                .lean();

            /*
             * If selected tag does not exist,
             * return empty result.
             */
            if (!tag) {
                const tags = await getTags();

                return {
                    blogs: [],
                    tags: JSON.parse(JSON.stringify(tags)),
                    total: 0,
                    totalPages: 1,
                    page: 1,
                    query: q,
                    tag: tagSlug,
                    sort,
                };
            }

            andConditions.push({
                tags: tag._id,
            });
        }

        const query = {
            $and: andConditions,
        };

        /*
         * Total matching blogs
         */
        const total = await Blog.countDocuments(query);

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
         * Fetch blogs
         */
        const blogs = await Blog.find(query)
            .populate("featuredImage")
            .populate("category", "name slug")
            .populate("tags", "name slug")
            .populate("author", "name")
            .sort(getSort(sort))
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .lean();

        const tags = await getTags();

        return {
            blogs: JSON.parse(JSON.stringify(blogs)),
            tags: JSON.parse(JSON.stringify(tags)),
            total,
            totalPages,
            page,
            query: q,
            tag: tagSlug,
            sort,
        };
    } catch (error) {
        console.error("Blogs page error:", error);

        return {
            blogs: [],
            tags: [],
            total: 0,
            totalPages: 1,
            page: 1,
            query: "",
            tag: "",
            sort: "latest",
        };
    }
}

/*
 * Create URL query string
 */
function createQueryString(params) {
    const query = new URLSearchParams();

    if (params.q) {
        query.set("q", params.q);
    }

    if (params.tag) {
        query.set("tag", params.tag);
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
                    href={`/blogs${createQueryString({
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
                    href={`/blogs${createQueryString({
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
                    href={`/blogs${createQueryString({
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

export default async function BlogsPage({ searchParams }) {
    const params = await searchParams;

    const {
        blogs,
        tags,
        total,
        totalPages,
        page,
        query,
        tag,
        sort,
    } = await getBlogs(params);

    const hasFilters = query || tag;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-300">
                        Travel Stories
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        Travel Blogs
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg text-gray-300">
                        Discover travel guides, local experiences, helpful
                        tips, and inspiring stories from beautiful
                        destinations.
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                    <form
                        method="GET"
                        action="/blogs"
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
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
                                placeholder="Search travel blogs..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            />
                        </div>

                        {/* Tag */}
                        <div>
                            <label
                                htmlFor="tag"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Tag
                            </label>

                            <select
                                id="tag"
                                name="tag"
                                defaultValue={tag}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            >
                                <option value="">
                                    All Tags
                                </option>

                                {tags.map((item) => (
                                    <option
                                        key={item._id}
                                        value={item.slug}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
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
                        <div className="flex items-end gap-3 md:col-span-2 lg:col-span-3">
                            <button
                                type="submit"
                                className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Apply Filters
                            </button>

                            <Link
                                href="/blogs"
                                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Clear
                            </Link>
                        </div>
                    </form>
                </div>
            </section>

            {/* Blog List */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    {/* Results Header */}
                    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {hasFilters
                                    ? "Filtered Travel Blogs"
                                    : "Latest Travel Blogs"}
                            </h2>

                            <p className="mt-2 text-gray-600">
                                {total} blog
                                {total !== 1 ? "s" : ""} found
                            </p>
                        </div>

                        {hasFilters && (
                            <Link
                                href="/blogs"
                                className="text-sm font-semibold text-gray-900 hover:underline"
                            >
                                Clear all filters →
                            </Link>
                        )}
                    </div>

                    {/* Results */}
                    {blogs.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <div className="text-4xl">🔎</div>

                            <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                No blogs found
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Try changing your search or tag filter.
                            </p>

                            <Link
                                href="/blogs"
                                className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                View all blogs
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {blogs.map((blog) => {
                                    const imageUrl = getImageUrl(
                                        blog.featuredImage,
                                    );

                                    return (
                                        <article
                                            key={blog._id}
                                            className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            {/* Image */}
                                            <Link
                                                href={`/blogs/${
                                                    blog.slug || blog._id
                                                }`}
                                            >
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={
                                                            blog.title ||
                                                            "Travel Blog"
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
                                                {/* Category + Featured */}
                                                <div className="flex items-center justify-between gap-3">
                                                    {blog.category?.name ? (
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {
                                                                blog.category
                                                                    .name
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">
                                                            Travel
                                                        </span>
                                                    )}

                                                    {blog.featured && (
                                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                                                    {blog.title}
                                                </h3>

                                                {/* Excerpt */}
                                                {blog.excerpt && (
                                                    <p className="mt-3 line-clamp-3 text-gray-600">
                                                        {blog.excerpt}
                                                    </p>
                                                )}

                                                {/* Tags */}
                                                {blog.tags?.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {blog.tags
                                                            .slice(0, 3)
                                                            .map((item) => (
                                                                <Link
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    href={`/blogs?tag=${item.slug}`}
                                                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
                                                                >
                                                                    #
                                                                    {item.name}
                                                                </Link>
                                                            ))}
                                                    </div>
                                                )}

                                                {/* Author + Date */}
                                                <div className="mt-5 flex items-center justify-between border-t pt-4">
                                                    <div>
                                                        {blog.author?.name && (
                                                            <p className="text-sm font-medium text-gray-700">
                                                                By{" "}
                                                                {
                                                                    blog.author
                                                                        .name
                                                                }
                                                            </p>
                                                        )}

                                                        {formatDate(
                                                            blog.publishedAt,
                                                        ) && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {formatDate(
                                                                    blog.publishedAt,
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Link
                                                        href={`/blogs/${
                                                            blog.slug ||
                                                            blog._id
                                                        }`}
                                                        className="font-semibold text-gray-900 hover:underline"
                                                    >
                                                        Read Blog →
                                                    </Link>
                                                </div>
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
                                    tag,
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

