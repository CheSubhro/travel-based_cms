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

async function getFeaturedContent() {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/featured`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return {
                destinations: [],
                blogs: [],
            };
        }

        const result = await response.json();

        return result.success
            ? result.data
            : {
                  destinations: [],
                  blogs: [],
              };
    } catch (error) {
        console.error("Failed to fetch featured content:", error);

        return {
            destinations: [],
            blogs: [],
        };
    }
}

export default async function FeaturedPage() {
    const { destinations, blogs } = await getFeaturedContent();

    const hasFeaturedContent = destinations.length > 0 || blogs.length > 0;

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-gray-900 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
                        Featured
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        Featured Travel Content
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
                        Explore our handpicked destinations and travel stories
                        selected to inspire your next journey.
                    </p>
                </div>
            </section>

            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    {!hasFeaturedContent ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900">
                                No Featured Content
                            </h2>

                            <p className="mt-3 text-gray-600">
                                Featured destinations and blogs will appear here
                                when they are available.
                            </p>
                        </div>
                    ) : (
                        <>
                            {destinations.length > 0 && (
                                <div>
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-bold text-gray-900">
                                            Featured Destinations
                                        </h2>

                                        <p className="mt-2 text-gray-600">
                                            Discover some of our most
                                            recommended travel destinations.
                                        </p>
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {destinations.map((destination) => {
                                            const imageUrl =
                                                getImageUrl(
                                                    destination.featuredImage,
                                                ) ||
                                                getImageUrl(
                                                    destination.images?.[0],
                                                );

                                            return (
                                                <article
                                                    key={destination._id}
                                                    className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                                >
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
                                                                    "Travel Destination"
                                                                }
                                                                className="h-64 w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-64 w-full items-center justify-center bg-gray-200 text-gray-500">
                                                                No image
                                                                available
                                                            </div>
                                                        )}
                                                    </Link>

                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {destination
                                                                    .location
                                                                    ?.city ||
                                                                    destination
                                                                        .location
                                                                        ?.state ||
                                                                    "Travel Destination"}
                                                            </span>

                                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                                Featured
                                                            </span>
                                                        </div>

                                                        <h3 className="mt-3 text-2xl font-bold text-gray-900">
                                                            {destination.title}
                                                        </h3>

                                                        {destination.shortDescription && (
                                                            <p className="mt-3 line-clamp-3 text-gray-600">
                                                                {
                                                                    destination.shortDescription
                                                                }
                                                            </p>
                                                        )}

                                                        {destination.categories
                                                            ?.length > 0 && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {destination.categories
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            category,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    category._id
                                                                                }
                                                                                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                                                                            >
                                                                                {
                                                                                    category.name
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        )}

                                                        <Link
                                                            href={`/destinations/${
                                                                destination.slug ||
                                                                destination._id
                                                            }`}
                                                            className="mt-5 inline-block font-semibold text-gray-900 hover:underline"
                                                        >
                                                            Explore Destination
                                                            →
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {blogs.length > 0 && (
                                <div className="mt-20">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-bold text-gray-900">
                                            Featured Blogs
                                        </h2>

                                        <p className="mt-2 text-gray-600">
                                            Read our selected travel stories,
                                            guides, and tips.
                                        </p>
                                    </div>

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
                                                            blog.slug ||
                                                            blog._id
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
                                                                No image
                                                                available
                                                            </div>
                                                        )}
                                                    </Link>

                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {blog.category
                                                                    ?.name ||
                                                                    "Travel"}
                                                            </span>

                                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                                Featured
                                                            </span>
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
                                                                {blog.author
                                                                    ?.name && (
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        By{" "}
                                                                        {
                                                                            blog
                                                                                .author
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
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-12">
                        <Link
                            href="/"
                            className="font-semibold text-gray-900 hover:underline"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}