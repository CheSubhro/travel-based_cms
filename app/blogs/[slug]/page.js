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

async function getBlog(slug) {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/blogs/${slug}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        return result.success ? result.data : null;
    } catch (error) {
        console.error("Failed to fetch blog:", error);
        return null;
    }
}

export default async function BlogDetailsPage({ params }) {
    const { slug } = await params;

    const blog = await getBlog(slug);

    if (!blog) {
        return (
            <main className="min-h-screen bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Blog Not Found
                    </h1>

                    <p className="mt-3 text-gray-600">
                        The blog you are looking for does not exist or is no
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

    const imageUrl = getImageUrl(blog.featuredImage);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-16 text-white">
                <div className="mx-auto max-w-4xl">
                    <div className="flex flex-wrap items-center gap-3">
                        {blog.category?.name && (
                            <span className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                                {blog.category.name}
                            </span>
                        )}

                        {blog.featured && (
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                Featured
                            </span>
                        )}
                    </div>

                    <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                        {blog.title}
                    </h1>

                    {blog.excerpt && (
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
                            {blog.excerpt}
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                        {blog.author?.name && (
                            <span>By {blog.author.name}</span>
                        )}

                        {formatDate(blog.publishedAt) && (
                            <span>{formatDate(blog.publishedAt)}</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Blog Content */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-4xl">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={blog.title}
                            className="mb-10 h-auto max-h-[550px] w-full rounded-xl object-cover shadow-sm"
                        />
                    ) : (
                        <div className="mb-10 flex h-80 w-full items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                            No image available
                        </div>
                    )}

                    <article className="rounded-xl bg-white p-6 shadow-sm md:p-10">
                        <div className="whitespace-pre-line text-lg leading-8 text-gray-700">
                            {blog.content}
                        </div>

                        {/* Tags */}
                        {blog.tags?.length > 0 && (
                            <div className="mt-10 border-t pt-6">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                                    Tags
                                </h2>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <span
                                            key={tag._id}
                                            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Back */}
                    <div className="mt-8">
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