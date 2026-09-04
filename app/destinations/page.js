import Link from "next/link";

async function getDestinations() {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/destinations`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();

        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Failed to fetch destinations:", error);
        return [];
    }
}

function getImageUrl(image) {
    if (!image) {
        return null;
    }

    if (typeof image === "string") {
        return image;
    }

    return image.url || image.secure_url || null;
}

export default async function DestinationsPage() {

    const destinations = await getDestinations();

    const activeDestinations = destinations;

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
                        Explore beautiful destinations, discover new places, and
                        find inspiration for your next journey.
                    </p>
                </div>
            </section>

            {/* Destination List */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Popular Destinations
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Explore our collection of travel destinations.
                        </p>
                    </div>

                    {activeDestinations.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-900">
                                No destinations available
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Please check back later for new destinations.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {activeDestinations.map((destination) => {
                                const imageUrl = getImageUrl(
                                    destination.images?.[0] ||
                                        destination.featuredImage ||
                                        destination.image ||
                                        destination.coverImage,
                                );

                                return (
                                    <article
                                        key={destination._id}
                                        className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={
                                                    destination.title ||
                                                    destination.name ||
                                                    "Destination"
                                                }
                                                className="h-64 w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-64 w-full items-center justify-center bg-gray-200 text-gray-500">
                                                No image available
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {destination.title ||
                                                    destination.name}
                                            </h3>

                                            {destination.description && (
                                                <p className="mt-3 line-clamp-3 text-gray-600">
                                                    {destination.description}
                                                </p>
                                            )}

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
                    )}
                </div>
            </section>
        </main>
    );
}