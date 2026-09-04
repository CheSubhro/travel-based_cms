

import Link from "next/link";

async function getCategories() {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/categories`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();

        return result.success ? result.data : [];
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
                        Explore
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        Travel Categories
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg text-gray-300">
                        Discover travel stories, guides, destinations, and
                        experiences organized by category.
                    </p>
                </div>
            </section>

            {/* Categories */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    {categories.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900">
                                No categories available
                            </h2>

                            <p className="mt-3 text-gray-600">
                                There are no active categories available at
                                the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={`/categories/${category.slug}`}
                                    className="group rounded-xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 transition group-hover:text-gray-700">
                                                {category.name}
                                            </h2>

                                            {category.description && (
                                                <p className="mt-3 line-clamp-3 text-gray-600">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>

                                        <span className="text-xl text-gray-400 transition group-hover:translate-x-1">
                                            →
                                        </span>
                                    </div>

                                    <div className="mt-6 border-t pt-4">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Explore Category
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

