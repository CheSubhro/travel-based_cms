import Link from "next/link";

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

async function getBlogs() {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/blogs`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();

        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return [];
    }
}

export default async function BlogsPage() {
    const blogs = await getBlogs();

    const publishedBlogs = blogs;

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
                        Discover travel guides, local experiences, helpful tips,
                        and inspiring stories from beautiful destinations.
                    </p>
                </div>
            </section>

            {/* Blog List */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Latest Travel Blogs
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Explore our latest travel stories, guides, and
                            helpful travel tips.
                        </p>
                    </div>

                    {publishedBlogs.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-900">
                                No blogs available
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Please check back later for new travel blogs.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {publishedBlogs.map((blog) => {
                                const imageUrl = getImageUrl(
                                    blog.featuredImage,
                                );

                                return (
                                    <article
                                        key={blog._id}
                                        className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
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
                                                    className="h-64 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-64 w-full items-center justify-center bg-gray-200 text-gray-500">
                                                    No image available
                                                </div>
                                            )}
                                        </Link>

                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-3">
                                                {blog.category?.name ? (
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {blog.category.name}
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

                                            <h3 className="mt-3 text-2xl font-bold text-gray-900">
                                                {blog.title}
                                            </h3>

                                            {blog.excerpt && (
                                                <p className="mt-3 line-clamp-3 text-gray-600">
                                                    {blog.excerpt}
                                                </p>
                                            )}

                                            <div className="mt-5 flex items-center justify-between border-t pt-4">
                                                <div>
                                                    {blog.author?.name && (
                                                        <p className="text-sm font-medium text-gray-700">
                                                            By{" "}
                                                            {blog.author.name}
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
                                                        blog.slug || blog._id
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
                    )}
                </div>
            </section>
        </main>
    );
}