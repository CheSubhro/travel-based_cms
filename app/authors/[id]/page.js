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

async function getAuthor(id) {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/authors/${id}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        return result.success ? result.data : null;
    } catch (error) {
        console.error("Failed to fetch author:", error);
        return null;
    }
}

export default async function AuthorPage({ params }) {
    const { id } = await params;

    const data = await getAuthor(id);

    if (!data) {
        return (
            <main className="min-h-screen bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Author Not Found
                    </h1>

                    <p className="mt-3 text-gray-600">
                        The author you are looking for does not exist or is no
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

    const { author, blogs } = data;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Author Hero */}
            <section className="bg-gray-900 px-6 py-16 text-white">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                        Travel Author
                    </p>

                    <h1 className="mt-3 text-4xl font-bold md:text-5xl">
                        {author.name || "Travel Author"}
                    </h1>

                    {author.email && (
                        <p className="mt-4 text-gray-300">{author.email}</p>
                    )}

                    <div className="mt-6">
                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-gray-200">
                            {blogs.length} Published{" "}
                            {blogs.length === 1 ? "Blog" : "Blogs"}
                        </span>
                    </div>
                </div>
            </section>

            {/* Blogs */}
            <section className="px-6 py-14">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Blogs by {author.name || "This Author"}
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Explore published travel stories and guides from
                            this author.
                        </p>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-900">
                                No published blogs
                            </h3>

                            <p className="mt-2 text-gray-600">
                                This author has not published any blogs yet.
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
                                                    {blog.category?.name ||
                                                        "Travel"}
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

                                            {formatDate(blog.publishedAt) && (
                                                <p className="mt-5 text-xs text-gray-500">
                                                    {formatDate(
                                                        blog.publishedAt,
                                                    )}
                                                </p>
                                            )}

                                            <Link
                                                href={`/blogs/${
                                                    blog.slug || blog._id
                                                }`}
                                                className="mt-4 inline-block font-semibold text-gray-900 hover:underline"
                                            >
                                                Read Blog →
                                            </Link>
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
                            ← Back to Blogs
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}