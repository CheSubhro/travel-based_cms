"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Toast from "@/components/admin/Toast";

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

            setTags(result.data || []);
        } catch (error) {
            console.error("Fetch tags error:", error);
            setError(error.message || "Failed to fetch tags");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTags();
    }, []);

    const filteredTags = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return tags.filter((tag) => {
            const matchesSearch =
                !searchValue ||
                tag.name?.toLowerCase().includes(searchValue) ||
                tag.slug?.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && tag.isActive === true) ||
                (statusFilter === "inactive" && tag.isActive === false);

            return matchesSearch && matchesStatus;
        });
    }, [tags, search, statusFilter]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this tag?",
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await fetch(`/api/admin/tags/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete tag");
            }

            setTags((previous) => previous.filter((tag) => tag._id !== id));
        } catch (error) {
            console.error("Delete tag error:", error);
            setError(error.message || "Failed to delete tag");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tags</h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your content tags
                    </p>
                </div>

                <Link
                    href="/admin/tags/new"
                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
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

            {/* Search / Filter */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <div>
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
                            placeholder="Search by tag name or slug..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tag-status"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Status
                        </label>

                        <select
                            id="tag-status"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {(search || statusFilter !== "all") && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {filteredTags.length} of {tags.length} tags
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                            }}
                            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Tags Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Loading tags...
                    </div>
                ) : tags.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">No tags found.</p>

                        <Link
                            href="/admin/tags/new"
                            className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            + Add Tag
                        </Link>
                    </div>
                ) : filteredTags.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No tags match your search or filter.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                            }}
                            className="mt-4 text-sm font-medium text-gray-700 underline hover:text-gray-900"
                        >
                            Clear filters
                        </button>
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
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">
                                                {tag.name || "Untitled"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-500">
                                                {tag.slug || "—"}
                                            </p>
                                        </td>

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

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    href={`/admin/tags/${tag._id}/edit`}
                                                    className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(tag._id)
                                                    }
                                                    className="text-sm font-medium text-red-600 transition hover:text-red-700"
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
        </div>
    );
}