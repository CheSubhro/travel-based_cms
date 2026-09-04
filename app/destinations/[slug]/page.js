import Link from "next/link";

async function getDestination(slug) {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/destinations/${slug}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        return result.success ? result.data : null;
    } catch (error) {
        console.error("Failed to fetch destination:", error);
        return null;
    }
}

export default async function DestinationDetailsPage({ params }) {
    const { slug } = await params;

    const destination = await getDestination(slug);

    if (!destination) {
        return (
            <main className="min-h-screen bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Destination Not Found
                    </h1>

                    <p className="mt-3 text-gray-600">
                        The destination you are looking for does not exist.
                    </p>

                    <Link
                        href="/destinations"
                        className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        ← Back to Destinations
                    </Link>
                </div>
            </main>
        );
    }

    const location = destination.location || {};
    const categories = destination.categories || [];
    const images = destination.images || [];

    const featuredImage =
        typeof destination.featuredImage === "object"
            ? destination.featuredImage
            : images[0] || null;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-16 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-5">
                        <Link
                            href="/destinations"
                            className="text-sm font-medium text-gray-300 transition hover:text-white"
                        >
                            ← All Destinations
                        </Link>
                    </div>

                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
                        {location.city
                            ? `${location.city}, ${location.state || location.country || ""}`
                            : "Explore Destination"}
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        {destination.title}
                    </h1>

                    {destination.shortDescription && (
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
                            {destination.shortDescription}
                        </p>
                    )}

                    {categories.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <span
                                    key={category._id}
                                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-gray-200"
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Content */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Featured Image */}
                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                {featuredImage?.url ? (
                                    <div className="aspect-video bg-gray-100">
                                        <img
                                            src={featuredImage.url}
                                            alt={
                                                featuredImage.alt ||
                                                destination.title
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex aspect-video items-center justify-center bg-gray-200 text-gray-500">
                                        No featured image available
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    About {destination.title}
                                </h2>

                                <div className="mt-5 whitespace-pre-line text-base leading-8 text-gray-600">
                                    {destination.description}
                                </div>
                            </article>

                            {/* Gallery */}
                            {images.length > 0 && (
                                <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Gallery
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Explore more views of{" "}
                                            {destination.title}.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {images.map((image) => (
                                            <div
                                                key={image._id}
                                                className="overflow-hidden rounded-xl bg-gray-100"
                                            >
                                                {image.url ? (
                                                    <img
                                                        src={image.url}
                                                        alt={
                                                            image.alt ||
                                                            destination.title
                                                        }
                                                        className="aspect-video h-full w-full object-cover transition duration-300 hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-video items-center justify-center text-sm text-gray-400">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Location */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Location
                                </h2>

                                <div className="mt-5 space-y-4 text-sm text-gray-600">
                                    {location.country && (
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Country
                                            </p>
                                            <p className="mt-1">
                                                {location.country}
                                            </p>
                                        </div>
                                    )}

                                    {location.state && (
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                State
                                            </p>
                                            <p className="mt-1">
                                                {location.state}
                                            </p>
                                        </div>
                                    )}

                                    {location.city && (
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                City
                                            </p>
                                            <p className="mt-1">
                                                {location.city}
                                            </p>
                                        </div>
                                    )}

                                    {location.address && (
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Address
                                            </p>
                                            <p className="mt-1 leading-6">
                                                {location.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Categories */}
                            {categories.length > 0 && (
                                <div className="rounded-2xl bg-white p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Categories
                                    </h2>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <span
                                                key={category._id}
                                                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author */}
                            {destination.author && (
                                <div className="rounded-2xl bg-white p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Published By
                                    </h2>

                                    <p className="mt-4 font-medium text-gray-900">
                                        {destination.author.name}
                                    </p>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    );
}