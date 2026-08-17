
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [featured, setFeatured] = useState("");
    const [category, setCategory] = useState("");

    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.set("page", page);
            params.set("limit", limit);

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (status) {
                params.set("status", status);
            }

            if (featured) {
                params.set("featured", featured);
            }

            if (category) {
                params.set("category", category);
            }

            params.set("sortBy", sortBy);
            params.set("sortOrder", sortOrder);

            const response = await fetch(
                `/api/admin/destinations?${params.toString()}`,
                {
                    cache: "no-store",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to fetch destinations",
                );
            }

            setDestinations(result.data);
            setTotal(result.pagination.total);
            setTotalPages(result.pagination.totalPages);
        } catch (error) {
            console.error("Fetch destinations error:", error);

            setError(
                error.message || "Failed to fetch destinations",
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(
                "/api/admin/categories?limit=100",
                {
                    cache: "no-store",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to fetch categories",
                );
            }

            setCategories(result.data);
        } catch (error) {
            console.error("Fetch categories error:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchDestinations();
    }, [page, status, featured, category, sortBy, sortOrder]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);

        fetchDestinations();
    };

    const handleReset = () => {
        setSearch("");
        setStatus("");
        setFeatured("");
        setCategory("");
        setSortBy("createdAt");
        setSortOrder("desc");
        setPage(1);
    };

    const handleDelete = async (destinationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this destination?",
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/destinations/${destinationId}`,
                {
                    method: "DELETE",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete destination",
                );
            }

            fetchDestinations();
        } catch (error) {
            console.error("Delete destination error:", error);

            setError(
                error.message || "Failed to delete destination",
            );
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Destinations
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your travel destinations
                    </p>
                </div>

                <Link
                    href="/admin/destinations/new"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Add Destination
                </Link>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
                >
                    <div className="xl:col-span-2">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search destinations..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                        >
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Featured
                        </label>

                        <select
                            value={featured}
                            onChange={(event) => {
                                setFeatured(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                        >
                            <option value="">All</option>
                            <option value="true">Featured</option>
                            <option value="false">Not Featured</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={(event) => {
                                setCategory(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                        >
                            <option value="">All Categories</option>

                            {categories.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Sort
                        </label>

                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(event) => {
                                const [field, order] =
                                    event.target.value.split("-");

                                setSortBy(field);
                                setSortOrder(order);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                        >
                            <option value="createdAt-desc">Newest</option>

                            <option value="createdAt-asc">Oldest</option>

                            <option value="title-asc">Title A-Z</option>

                            <option value="title-desc">Title Z-A</option>

                            <option value="location-asc">Location A-Z</option>

                            <option value="location-desc">Location Z-A</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-4 text-sm text-gray-500">
                {total} destination{total !== 1 ? "s" : ""} found
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Loading destinations...
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No destinations found.
                        </p>

                        <Link
                            href="/admin/destinations/new"
                            className="mt-3 inline-block text-sm font-medium text-gray-900 underline"
                        >
                            Add your first destination
                        </Link>
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
                                        Location
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Categories
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Featured
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {destinations.map((destination) => (
                                    <tr
                                        key={destination._id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {destination.title}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {destination.slug}
                                                </p>
                                            </div>
                                        </td>

                                        <td>
                                            {[
                                                destination.location?.city,
                                                destination.location?.state,
                                                destination.location?.country,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex max-w-xs flex-wrap gap-1.5">
                                                {destination.categories
                                                    ?.length > 0 ? (
                                                    destination.categories.map(
                                                        (item) => (
                                                            <span
                                                                key={item._id}
                                                                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                                                            >
                                                                {item.name}
                                                            </span>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    destination.status ===
                                                    "published"
                                                        ? "bg-green-100 text-green-700"
                                                        : destination.status ===
                                                            "draft"
                                                          ? "bg-yellow-100 text-yellow-700"
                                                          : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {destination.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            {destination.featured ? (
                                                <span className="text-sm font-medium text-gray-900">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    No
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/admin/destinations/${destination._id}/edit`}
                                                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            destination._id,
                                                        )
                                                    }
                                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => current - 1)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((current) => current + 1)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}