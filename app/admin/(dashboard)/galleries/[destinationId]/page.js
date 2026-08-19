

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewDestinationGalleryPage() {
    const params = useParams();
    const destinationId = params?.destinationId;

    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!destinationId) {
            return;
        }

        const fetchDestination = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/admin/destinations", {
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch destination"
                    );
                }

                const destinations = result.data || [];

                const foundDestination = destinations.find(
                    (item) => item._id === destinationId
                );

                if (!foundDestination) {
                    throw new Error("Destination not found");
                }

                setDestination(foundDestination);
            } catch (error) {
                console.error("Fetch destination gallery error:", error);

                setError(
                    error.message || "Failed to load destination gallery"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDestination();
    }, [destinationId]);

    if (loading) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/galleries"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Galleries
                    </Link>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-gray-500">
                        Loading gallery...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/galleries"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Galleries
                    </Link>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!destination) {
        return null;
    }

    const images = destination.images || [];
    const featuredImage = destination.featuredImage;

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/admin/galleries"
                    className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    ← Back to Galleries
                </Link>

                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {destination.title || "Untitled"}
                    </h1>

                    {destination.slug && (
                        <p className="mt-1 text-sm text-gray-500">
                            {destination.slug}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Destination
                    </p>

                    <p className="mt-2 text-lg font-semibold text-gray-900">
                        {destination.title || "Untitled"}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total Images
                    </p>

                    <p className="mt-2 text-lg font-semibold text-gray-900">
                        {images.length}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                    </p>

                    <div className="mt-2">
                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                destination.status === "published"
                                    ? "bg-green-100 text-green-700"
                                    : destination.status === "draft"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {destination.status || "—"}
                        </span>
                    </div>
                </div>
            </div>

            {featuredImage?.url && (
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            Cover Image
                        </h2>
                    </div>

                    <div className="p-5">
                        <img
                            src={featuredImage.url}
                            alt={
                                featuredImage.alt ||
                                destination.title ||
                                "Cover image"
                            }
                            className="h-64 w-full rounded-xl object-cover"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                Gallery Images
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {images.length}{" "}
                                {images.length === 1 ? "image" : "images"}
                            </p>
                        </div>
                    </div>
                </div>

                {images.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No gallery images found for this destination.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4">
                        {images.map((image, index) => {
                            const imageUrl =
                                typeof image === "string"
                                    ? image
                                    : image?.url;

                            const imageAlt =
                                typeof image === "string"
                                    ? `${destination.title || "Gallery"} image ${
                                          index + 1
                                      }`
                                    : image?.alt ||
                                      `${destination.title || "Gallery"} image ${
                                          index + 1
                                      }`;

                            return (
                                <div
                                    key={
                                        image?._id ||
                                        image?.publicId ||
                                        imageUrl ||
                                        index
                                    }
                                    className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={imageAlt}
                                            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex aspect-square items-center justify-center text-xs text-gray-400">
                                            Image unavailable
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

