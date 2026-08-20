

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GalleriesPage() {
    
    const [destinations, setDestinations] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadGalleries = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/admin/destinations", {
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch galleries",
                    );
                }

                setDestinations(result.data || []);
            } catch (error) {
                console.error("Fetch galleries error:", error);

                setError(error.message || "Failed to fetch galleries");
            } finally {
                setLoading(false);
            }
        };

        loadGalleries();
    }, []);

    const filteredDestinations = selectedDestination
        ? destinations.filter(
              (destination) => destination._id === selectedDestination
          )
        : destinations;

    return (
        <div>
            <div className="mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Galleries
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage destination galleries
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <label
                    htmlFor="destination"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Select Destination
                </label>

                <select
                    id="destination"
                    value={selectedDestination}
                    onChange={(event) =>
                        setSelectedDestination(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                >
                    <option value="">All destinations</option>

                    {destinations.map((destination) => (
                        <option key={destination._id} value={destination._id}>
                            {destination.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Loading galleries...
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No galleries found.
                        </p>
                    </div>
                ) : filteredDestinations.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No gallery found for this destination.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Destination
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Cover Image
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Images
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {filteredDestinations.map((destination) => {
                                    const imageCount =
                                        destination.images?.length || 0;

                                    const featuredImage =
                                        destination.featuredImage;

                                    return (
                                        <tr
                                            key={destination._id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {destination.title ||
                                                            "Untitled"}
                                                    </p>

                                                    {destination.slug && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {destination.slug}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {featuredImage?.url ? (
                                                    <img
                                                        src={featuredImage.url}
                                                        alt={
                                                            featuredImage.alt ||
                                                            destination.title ||
                                                            "Gallery"
                                                        }
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-400">
                                                        No
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {imageCount}{" "}
                                                    {imageCount === 1
                                                        ? "image"
                                                        : "images"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                                        destination.status ===
                                                        "published"
                                                            ? "bg-green-100 text-green-700"
                                                            : destination.status ===
                                                                "draft"
                                                              ? "bg-yellow-100 text-yellow-700"
                                                              : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {destination.status || "—"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/admin/galleries/${destination._id}`}
                                                    className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                                                >
                                                    View Gallery
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

