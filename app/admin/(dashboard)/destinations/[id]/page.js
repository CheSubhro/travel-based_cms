

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ViewDestinationPage() {
    
    const params = useParams();

    const destinationId = params.id;

    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDestination = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/admin/destinations/${destinationId}`,
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                            "Failed to fetch destination",
                    );
                }

                setDestination(result.data);
            } catch (error) {
                console.error(
                    "Fetch destination error:",
                    error,
                );

                setError(
                    error.message ||
                        "Failed to load destination",
                );
            } finally {
                setLoading(false);
            }
        };

        if (destinationId) {
            fetchDestination();
        }
    }, [destinationId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading destination...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>

                <div className="mt-4">
                    <Link
                        href="/admin/destinations"
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        ← Back to Destinations
                    </Link>
                </div>
            </div>
        );
    }

    if (!destination) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">
                        Destination not found.
                    </p>
                </div>
            </div>
        );
    }

    const featuredImage =
        typeof destination.featuredImage === "object"
            ? destination.featuredImage
            : null;

    const images = destination.images || [];

    const categories = destination.categories || [];

    const author =
        typeof destination.author === "object"
            ? destination.author
            : null;

    const location = destination.location || {};

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {destination.title}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View destination details.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/destinations"
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Back
                    </Link>

                    <Link
                        href={`/admin/destinations/${destination._id}/edit`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Edit Destination
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                            <div className="flex aspect-video items-center justify-center bg-gray-100">
                                <p className="text-sm text-gray-500">
                                    No featured image
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Description
                        </h2>

                        <div className="space-y-4 text-sm leading-7 text-gray-600">
                            {destination.shortDescription && (
                                <p className="font-medium text-gray-700">
                                    {destination.shortDescription}
                                </p>
                            )}

                            {destination.description ? (
                                <p className="whitespace-pre-line">
                                    {destination.description}
                                </p>
                            ) : (
                                <p className="text-gray-400">
                                    No description available.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Gallery Images
                            </h2>

                            <span className="text-sm text-gray-500">
                                {images.length} image
                                {images.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {images.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No gallery images available.
                            </p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {images.map((image) => (
                                    <div
                                        key={image._id}
                                        className="overflow-hidden rounded-lg border border-gray-200"
                                    >
                                        {image.url ? (
                                            <div className="aspect-video bg-gray-100">
                                                <img
                                                    src={image.url}
                                                    alt={
                                                        image.alt ||
                                                        destination.title
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex aspect-video items-center justify-center bg-gray-100">
                                                <span className="text-xs text-gray-400">
                                                    No image
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-3">
                                            <p className="truncate text-xs text-gray-600">
                                                {image.originalName ||
                                                    image.publicId ||
                                                    "Image"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Destination Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Status
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        destination.status ===
                                        "published"
                                            ? "bg-green-100 text-green-700"
                                            : destination.status ===
                                                "archived"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                    {destination.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Featured
                                </p>

                                <p className="mt-1 text-sm text-gray-700">
                                    {destination.featured
                                        ? "Yes"
                                        : "No"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Slug
                                </p>

                                <p className="mt-1 break-all text-sm text-gray-700">
                                    {destination.slug}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Location
                        </h2>

                        <div className="space-y-3 text-sm text-gray-600">
                            {location.country && (
                                <p>
                                    <span className="font-medium text-gray-900">
                                        Country:
                                    </span>{" "}
                                    {location.country}
                                </p>
                            )}

                            {location.state && (
                                <p>
                                    <span className="font-medium text-gray-900">
                                        State:
                                    </span>{" "}
                                    {location.state}
                                </p>
                            )}

                            {location.city && (
                                <p>
                                    <span className="font-medium text-gray-900">
                                        City:
                                    </span>{" "}
                                    {location.city}
                                </p>
                            )}

                            {location.address && (
                                <p>
                                    <span className="font-medium text-gray-900">
                                        Address:
                                    </span>{" "}
                                    {location.address}
                                </p>
                            )}

                            {!location.country &&
                                !location.state &&
                                !location.city &&
                                !location.address && (
                                    <p className="text-gray-400">
                                        No location information
                                        available.
                                    </p>
                                )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Categories
                        </h2>

                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No categories assigned.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <span
                                        key={category._id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Author
                        </h2>

                        {author ? (
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {author.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {author.email}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">
                                Author information unavailable.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
