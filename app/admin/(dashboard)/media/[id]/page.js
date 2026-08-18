"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewMediaPage() {
    
    const params = useParams();

    const [media, setMedia] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMedia = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`/api/admin/media/${params.id}`, {
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to fetch media");
                }

                setMedia(result.data);
            } catch (error) {
                console.error("Fetch media error:", error);

                setError(error.message || "Failed to fetch media");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadMedia();
        }
    }, [params.id]);

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

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading media...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Link
                    href="/admin/media"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Media
                </Link>

                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!media) {
        return (
            <div>
                <Link
                    href="/admin/media"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Media
                </Link>

                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm text-gray-500">Media not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/admin/media"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Media
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-gray-900">
                        View Media
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View media file and metadata
                    </p>
                </div>

                <Link
                    href={`/admin/media/${media._id}/edit`}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    Edit Media
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Preview */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Preview
                    </h2>

                    <div className="overflow-hidden rounded-lg bg-gray-100">
                        {media.url ? (
                            <img
                                src={media.url}
                                alt={
                                    media.alt ||
                                    media.originalName ||
                                    "Media preview"
                                }
                                className="max-h-[500px] w-full object-contain"
                            />
                        ) : (
                            <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                                No preview available
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <p className="truncate text-sm font-medium text-gray-900">
                            {media.originalName || "Untitled"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {media.alt || "No alt text"}
                        </p>
                    </div>
                </div>

                {/* Metadata */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Media Metadata
                    </h2>

                    <div className="divide-y divide-gray-200">
                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Original Name
                            </p>

                            <p className="break-words text-sm text-gray-900 sm:col-span-2">
                                {media.originalName || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Resource Type
                            </p>

                            <p className="text-sm capitalize text-gray-900 sm:col-span-2">
                                {media.resourceType || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Format
                            </p>

                            <p className="text-sm uppercase text-gray-900 sm:col-span-2">
                                {media.format || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Dimensions
                            </p>

                            <p className="text-sm text-gray-900 sm:col-span-2">
                                {media.width && media.height
                                    ? `${media.width} × ${media.height}px`
                                    : "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                File Size
                            </p>

                            <p className="text-sm text-gray-900 sm:col-span-2">
                                {formatFileSize(media.bytes)}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Folder
                            </p>

                            <p className="break-words text-sm text-gray-900 sm:col-span-2">
                                {media.folder || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Alt Text
                            </p>

                            <p className="break-words text-sm text-gray-900 sm:col-span-2">
                                {media.alt || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Caption
                            </p>

                            <p className="break-words text-sm text-gray-900 sm:col-span-2">
                                {media.caption || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Status
                            </p>

                            <div className="sm:col-span-2">
                                <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                        media.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {media.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Public ID
                            </p>

                            <p className="break-all text-sm text-gray-900 sm:col-span-2">
                                {media.publicId || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                URL
                            </p>

                            <p className="break-all text-sm text-gray-900 sm:col-span-2">
                                {media.url || "—"}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Uploaded
                            </p>

                            <p className="text-sm text-gray-900 sm:col-span-2">
                                {formatDate(media.createdAt)}
                            </p>
                        </div>

                        <div className="grid gap-2 py-4 sm:grid-cols-3">
                            <p className="text-sm font-medium text-gray-500">
                                Updated
                            </p>

                            <p className="text-sm text-gray-900 sm:col-span-2">
                                {formatDate(media.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}