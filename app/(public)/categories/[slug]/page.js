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

async function getCategory(slug) {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/categories/${slug}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        return result.success ? result.data : null;
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return null;
    }
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;

    const data = await getCategory(slug);

    if (!data) {
        return (
            <main className="min-h-screen bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Category Not Found
                    </h1>

                    <p className="mt-3 text-gray-600">
                        The category you are looking for does not exist or is no
                        longer available.
                    </p>

                    <Link
                        href="/blogs"
                        className="mt-6 inline-flex font-semibold text-gray-900 hover:underline"
                    >
                        ← Back to Blogs
                    </Link>
                </div>
            </main>
        );
    }

    const { category, blogs } = data;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-300">
                        Travel Category
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        {category.name}
                    </h1>

                    {category.description && (
                        <p className="mt-5 max-w-2xl text-lg text-gray-300">
                            {category.description}
                        </p>
                    )}

                    <p className="mt-5 text-sm text-gray-400">
                        {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}{" "}
                        available
                    </p>
                </div>
            </section>

            {/* Blog List */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {category.name} Blogs
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Explore travel stories, guides, and useful
                            information from this category.
                        </p>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-900">
                                No blogs available
                            </h3>

                            <p className="mt-2 text-gray-600">
                                There are no published blogs in this category
                                yet.
                            </p>
                        </div>
                    ) : (
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
                                                <span className="text-sm font-medium text-gray-600">
                                                    {category.name}
                                                </span>

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

                    <div className="mt-10">
                        <Link
                            href="/blogs"
                            className="font-semibold text-gray-900 hover:underline"
                        >
                            ← Back to All Blogs
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}