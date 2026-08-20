"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TagsPage() {
    
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadTags = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/admin/tags", {
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to fetch tags");
                }

                if (!cancelled) {
                    setTags(result.data || []);
                }
            } catch (error) {
                console.error("Fetch tags error:", error);

                if (!cancelled) {
                    setError(error.message || "Failed to fetch tags");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadTags();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredTags = tags.filter((tag) => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return true;
        }

        return (
            tag.name?.toLowerCase().includes(searchValue) ||
            tag.slug?.toLowerCase().includes(searchValue)
        );
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tags</h1>

                    <p className="mt-1 text-sm text-gray-500">Manage tags</p>
                </div>

                <Link
                    href="/admin/tags/new"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    + Add Tag
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <label
                    htmlFor="tag-search"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Search Tags
                </label>

                <input
                    id="tag-search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or slug..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
            </div>

            {/* Tags Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">Loading tags...</p>
                    </div>
                ) : tags.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">No tags found.</p>

                        <Link
                            href="/admin/tags/new"
                            className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            + Add Tag
                        </Link>
                    </div>
                ) : filteredTags.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No tags found for "{search}".
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Name
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Slug
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Created
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {filteredTags.map((tag) => (
                                    <tr
                                        key={tag._id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        {/* Name */}
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">
                                                {tag.name || "Untitled"}
                                            </p>
                                        </td>

                                        {/* Slug */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-500">
                                                {tag.slug || "—"}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                                    tag.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {tag.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-500">
                                                {tag.createdAt
                                                    ? new Date(
                                                          tag.createdAt,
                                                      ).toLocaleDateString()
                                                    : "—"}
                                            </p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <Link
                                                href={`/admin/tags/${tag._id}`}
                                                className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                                            >
                                                View
                                            </Link>

                                            <span className="mx-2 text-gray-300">
                                                |
                                            </span>

                                            <Link
                                                href={`/admin/tags/${tag._id}/edit`}
                                                className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}