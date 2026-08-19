"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

export default function MediaPage() {

    const [media, setMedia] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const limit = 10;

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [previewImage, setPreviewImage] = useState(null);

    const [deleteMedia, setDeleteMedia] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadMedia = async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                params.set("page", page);
                params.set("limit", limit);

                const response = await fetch(
                    `/api/admin/media?${params.toString()}`,
                    {
                        cache: "no-store",
                    },
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to fetch media");
                }

                setMedia(result.data || []);
                setTotal(result.pagination?.total || 0);
                setTotalPages(result.pagination?.totalPages || 1);
            } catch (error) {
                console.error("Fetch media error:", error);

                setError(error.message || "Failed to fetch media");
            } finally {
                setLoading(false);
            }
        };

        loadMedia();
    }, [page]);

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "—";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleToggleStatus = async (id) => {
        try {
            setError("");

            const response = await fetch(`/api/admin/media/${id}`, {
                method: "PATCH",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update media status",
                );
            }

            setMedia((previous) =>
                previous.map((item) =>
                    item._id === id
                        ? {
                              ...item,
                              isActive: result.data.isActive,
                          }
                        : item,
                ),
            );
        } catch (error) {
            console.error("Toggle media status error:", error);

            setError(error.message || "Failed to update media status");
        }
    };

    const handleDeleteMedia = async () => {
        if (!deleteMedia) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/admin/media/${deleteMedia._id}`,
                {
                    method: "DELETE",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete media");
            }

            setMedia((previous) =>
                previous.filter((item) => item._id !== deleteMedia._id),
            );

            setTotal((previous) => Math.max(previous - 1, 0));

            setDeleteMedia(null);
        } catch (error) {
            console.error("Delete media error:", error);

            setError(error.message || "Failed to delete media");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Media</h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your media files
                    </p>
                </div>

                <Link
                    href="/admin/media/upload"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Upload Media
                </Link>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-4 text-sm text-gray-500">
                {total} media {total !== 1 ? "files" : "file"} found
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Loading media...
                    </div>
                ) : media.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">No media found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Media
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Type
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Dimensions
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Size
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Uploaded
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {media.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewImage(
                                                                item,
                                                            )
                                                        }
                                                        className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                                                    >
                                                        <img
                                                            src={item.url}
                                                            alt={
                                                                item.alt ||
                                                                item.originalName ||
                                                                "Media"
                                                            }
                                                            className="h-full w-full object-cover transition hover:scale-105"
                                                        />
                                                    </button>
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-400">
                                                        No
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="max-w-xs truncate font-medium text-gray-900">
                                                        {item.originalName ||
                                                            "Untitled"}
                                                    </p>

                                                    <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                        {item.alt || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div>
                                                <span className="text-sm font-medium capitalize text-gray-700">
                                                    {item.resourceType || "—"}
                                                </span>

                                                {item.format && (
                                                    <p className="mt-1 text-xs uppercase text-gray-400">
                                                        {item.format}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-600">
                                                {item.width && item.height
                                                    ? `${item.width} × ${item.height}`
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-600">
                                                {formatFileSize(item.bytes)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleStatus(item._id)
                                                }
                                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                                    item.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                            >
                                                {item.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-600">
                                                {item.createdAt
                                                    ? new Date(
                                                          item.createdAt,
                                                      ).toLocaleDateString(
                                                          "en-IN",
                                                          {
                                                              day: "numeric",
                                                              month: "short",
                                                              year: "numeric",
                                                          },
                                                      )
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/admin/media/${item._id}/edit`}
                                                    className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteMedia(item)
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

            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-lg text-white transition hover:bg-gray-700"
                        >
                            ×
                        </button>

                        <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                            <img
                                src={previewImage.url}
                                alt={
                                    previewImage.alt ||
                                    previewImage.originalName ||
                                    "Media preview"
                                }
                                className="max-h-[75vh] max-w-full object-contain"
                            />
                        </div>

                        <div className="mt-4">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {previewImage.originalName || "Untitled"}
                            </p>

                            {previewImage.alt && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {previewImage.alt}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {deleteMedia && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={() => {
                        if (!deleting) {
                            setDeleteMedia(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">
                            Delete Media
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Are you sure you want to delete this media? This
                            action cannot be undone.
                        </p>

                        <div className="mt-4 rounded-lg bg-gray-50 p-3">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {deleteMedia.originalName || "Untitled"}
                            </p>

                            {deleteMedia.alt && (
                                <p className="mt-1 truncate text-xs text-gray-500">
                                    {deleteMedia.alt}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteMedia(null)}
                                disabled={deleting}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteMedia}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}