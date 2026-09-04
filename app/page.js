import Link from "next/link";

const getImageUrl = (image) => {
    if (!image) {
        return "";
    }

    if (typeof image === "string") {
        return image;
    }

    return image.url || "";
};

async function getHomeData() {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const [destinationsResponse, blogsResponse] = await Promise.all([
            fetch(`${baseUrl}/api/admin/destinations?limit=6`, {
                cache: "no-store",
            }),
            fetch(`${baseUrl}/api/admin/blogs?limit=6`, {
                cache: "no-store",
            }),
        ]);

        const destinationsResult = destinationsResponse.ok
            ? await destinationsResponse.json()
            : { data: [] };

        const blogsResult = blogsResponse.ok
            ? await blogsResponse.json()
            : { data: [] };

        return {
            destinations: destinationsResult.data || [],
            blogs: blogsResult.data || [],
        };
    } catch (error) {
        console.error("Home page data error:", error);

        return {
            destinations: [],
            blogs: [],
        };
    }
}

export default async function Home() {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Travel Explorer";

    const { destinations, blogs } = await getHomeData();

    const featuredDestinations = destinations
        .filter((destination) => destination.isActive !== false)
        .slice(0, 6);

    const publishedBlogs = blogs
        .filter(
            (blog) =>
                blog.isActive !== false &&
                (!blog.status || blog.status.toLowerCase() === "published"),
        )
        .slice(0, 6);

    return (
        <main className="min-h-screen bg-white text-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gray-900">
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gray-300">
                            Explore • Travel • Discover
                        </p>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Discover your next
                            <span className="block text-gray-300">
                                unforgettable journey
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                            Explore beautiful destinations, discover inspiring
                            travel stories, and plan your next adventure with{" "}
                            {appName}.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/destinations"
                                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                            >
                                Explore Destinations
                            </Link>

                            <Link
                                href="/blogs"
                                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Read Travel Stories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Destinations */}
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Explore
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight">
                            Featured Destinations
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Find amazing places for your next adventure.
                        </p>
                    </div>

                    <Link
                        href="/destinations"
                        className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                        View all destinations →
                    </Link>
                </div>

                {featuredDestinations.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredDestinations.map((destination) => {
                            const imageUrl = getImageUrl(
                                destination.image ||
                                    destination.coverImage ||
                                    destination.featuredImage,
                            );

                            return (
                                <Link
                                    key={destination._id}
                                    href={`/destinations/${destination.slug || destination._id}`}
                                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="relative h-56 overflow-hidden bg-gray-100">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={
                                                    destination.title ||
                                                    destination.name ||
                                                    "Destination"
                                                }
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                                No image available
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold">
                                            {destination.title ||
                                                destination.name}
                                        </h3>

                                        {destination.description && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                                                {destination.description}
                                            </p>
                                        )}

                                        <span className="mt-4 inline-block text-sm font-semibold text-gray-900">
                                            Explore destination →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-10 text-center">
                        <p className="text-gray-500">
                            No destinations available yet.
                        </p>
                    </div>
                )}
            </section>

            {/* Travel Stories */}
            <section className="bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Inspiration
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight">
                                Latest Travel Stories
                            </h2>

                            <p className="mt-2 text-gray-600">
                                Get inspired before you start your journey.
                            </p>
                        </div>

                        <Link
                            href="/blogs"
                            className="text-sm font-semibold text-gray-900 hover:underline"
                        >
                            View all stories →
                        </Link>
                    </div>

                    {publishedBlogs.length > 0 ? (
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {publishedBlogs.map((blog) => {
                                const imageUrl = getImageUrl(
                                    blog.image ||
                                        blog.featuredImage ||
                                        blog.coverImage,
                                );

                                return (
                                    <Link
                                        key={blog._id}
                                        href={`/blogs/${blog.slug || blog._id}`}
                                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={
                                                        blog.title ||
                                                        "Travel story"
                                                    }
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                                    No image available
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h3 className="line-clamp-2 text-xl font-semibold">
                                                {blog.title}
                                            </h3>

                                            {blog.excerpt && (
                                                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                                                    {blog.excerpt}
                                                </p>
                                            )}

                                            <span className="mt-4 inline-block text-sm font-semibold text-gray-900">
                                                Read story →
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                            <p className="text-gray-500">
                                No published stories available yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="rounded-3xl bg-gray-900 px-6 py-12 text-center sm:px-12">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Ready to explore?
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-300">
                        Start discovering destinations and travel experiences
                        that are waiting for you.
                    </p>

                    <Link
                        href="/destinations"
                        className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                        Start Exploring
                    </Link>
                </div>
            </section>
        </main>
    );
}