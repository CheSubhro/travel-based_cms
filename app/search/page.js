"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const queryFromUrl = searchParams.get("q") || "";

    const [query, setQuery] = useState(queryFromUrl);
    const [results, setResults] = useState({
        destinations: [],
        blogs: [],
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(Boolean(queryFromUrl));

    useEffect(() => {
        setQuery(queryFromUrl);

        if (!queryFromUrl.trim()) {
            setResults({
                destinations: [],
                blogs: [],
            });
            setSearched(false);
            return;
        }

        async function fetchResults() {
            try {
                setLoading(true);
                setSearched(true);

                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(queryFromUrl)}`,
                    {
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    setResults({
                        destinations: [],
                        blogs: [],
                    });
                    return;
                }

                const result = await response.json();

                if (result.success) {
                    setResults({
                        destinations: result.data?.destinations || [],
                        blogs: result.data?.blogs || [],
                    });
                } else {
                    setResults({
                        destinations: [],
                        blogs: [],
                    });
                }
            } catch (error) {
                console.error("Failed to search:", error);

                setResults({
                    destinations: [],
                    blogs: [],
                });
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [queryFromUrl]);

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            router.push("/search");
            return;
        }

        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }

    const totalResults = results.destinations.length + results.blogs.length;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gray-900 px-6 py-16 text-white">
                <div className="mx-auto max-w-5xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-300">
                        Explore
                    </p>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        Search Travel Content
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg text-gray-300">
                        Find destinations and travel stories from our website.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search destinations, blogs, places..."
                            className="w-full rounded-lg border border-gray-700 bg-white px-5 py-3 text-gray-900 outline-none focus:border-gray-400 sm:flex-1"
                        />

                        <button
                            type="submit"
                            className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-200"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* Results */}
            <section className="px-6 py-14">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <p className="text-lg font-medium text-gray-700">
                                Searching...
                            </p>
                        </div>
                    ) : !searched ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Start your search
                            </h2>

                            <p className="mt-2 text-gray-600">
                                Search for a destination, place, travel guide,
                                or blog.
                            </p>
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900">
                                No results found
                            </h2>

                            <p className="mt-2 text-gray-600">
                                No content matched{" "}
                                <span className="font-semibold">
                                    &quot;{queryFromUrl}&quot;
                                </span>
                                .
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Search Results
                                </h2>

                                <p className="mt-2 text-gray-600">
                                    Found {totalResults} result
                                    {totalResults !== 1 ? "s" : ""} for{" "}
                                    <span className="font-semibold">
                                        &quot;{queryFromUrl}&quot;
                                    </span>
                                </p>
                            </div>

                            {/* Destinations */}
                            {results.destinations.length > 0 && (
                                <section className="mb-14">
                                    <h3 className="mb-6 text-2xl font-bold text-gray-900">
                                        Destinations
                                    </h3>

                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {results.destinations.map(
                                            (destination) => {
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
                                                        <Link
                                                            href={`/destinations/${
                                                                destination.slug ||
                                                                destination._id
                                                            }`}
                                                        >
                                                            {imageUrl ? (
                                                                <img
                                                                    src={
                                                                        imageUrl
                                                                    }
                                                                    alt={
                                                                        destination.title ||
                                                                        "Destination"
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
                                                            <h4 className="text-2xl font-bold text-gray-900">
                                                                {
                                                                    destination.title
                                                                }
                                                            </h4>

                                                            {destination.shortDescription && (
                                                                <p className="mt-3 line-clamp-3 text-gray-600">
                                                                    {
                                                                        destination.shortDescription
                                                                    }
                                                                </p>
                                                            )}

                                                            {(destination.city ||
                                                                destination.state ||
                                                                destination.country) && (
                                                                <p className="mt-4 text-sm text-gray-500">
                                                                    {[
                                                                        destination.city,
                                                                        destination.state,
                                                                        destination.country,
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            ", ",
                                                                        )}
                                                                </p>
                                                            )}

                                                            <Link
                                                                href={`/destinations/${
                                                                    destination.slug ||
                                                                    destination._id
                                                                }`}
                                                                className="mt-5 inline-block font-semibold text-gray-900 hover:underline"
                                                            >
                                                                View Destination
                                                                →
                                                            </Link>
                                                        </div>
                                                    </article>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Blogs */}
                            {results.blogs.length > 0 && (
                                <section>
                                    <h3 className="mb-6 text-2xl font-bold text-gray-900">
                                        Blogs
                                    </h3>

                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {results.blogs.map((blog) => {
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

                                                            {blog.featured && (
                                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="mt-3 text-2xl font-bold text-gray-900">
                                                            {blog.title}
                                                        </h4>

                                                        {blog.excerpt && (
                                                            <p className="mt-3 line-clamp-3 text-gray-600">
                                                                {blog.excerpt}
                                                            </p>
                                                        )}

                                                        <div className="mt-5 border-t pt-4">
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

                                                            <Link
                                                                href={`/blogs/${
                                                                    blog.slug ||
                                                                    blog._id
                                                                }`}
                                                                className="mt-4 inline-block font-semibold text-gray-900 hover:underline"
                                                            >
                                                                Read Blog →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

function SearchPageFallback() {
    return (
        <main className="min-h-screen bg-gray-50 px-6 py-20">
            <div className="mx-auto max-w-5xl rounded-xl bg-white p-10 text-center shadow-sm">
                <p className="text-lg text-gray-600">Loading search...</p>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageFallback />}>
            <SearchPageContent />
        </Suspense>
    );
}