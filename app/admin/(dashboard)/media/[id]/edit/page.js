"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Toast from "@/components/admin/Toast";

export default function EditMediaPage() {
    const params = useParams();
    const router = useRouter();

    const [media, setMedia] = useState(null);
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [toast, setToast] = useState({
        type: "success",
        message: "",
    });

    const showToast = (type, message) => {
        setToast({
            type,
            message,
        });
    };

    const closeToast = () => {
        setToast({
            type: "success",
            message: "",
        });
    };

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

                const item = result.data;

                setMedia(item);
                setIsActive(item.isActive ?? true);
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        try {
            setSaving(true);

            const response = await fetch(`/api/admin/media/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isActive,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update media");
            }

            showToast("success", "Media updated successfully.");

            setTimeout(() => {
                router.push("/admin/media");
                router.refresh();
            }, 800);
        } catch (error) {
            console.error("Update media error:", error);

            showToast("error", error.message || "Failed to update media");

            setError(error.message || "Failed to update media");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading media...</p>
            </div>
        );
    }

    if (!media) {
        return (
            <div>
                <Link
                    href="/admin/media"
                    className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    ← Back to Media
                </Link>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Media not found.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toast
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
            />

            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/media"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Media
                    </Link>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Edit Media
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update media status.
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    {/* Media Preview */}
                    <div className="mb-6">
                        <div className="flex items-start gap-4">
                            {media.url ? (
                                <img
                                    src={media.url}
                                    alt={media.originalName || "Media"}
                                    className="h-28 w-28 shrink-0 rounded-lg border border-gray-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                    No image
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="break-words font-medium text-gray-900">
                                    {media.originalName || "Untitled"}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {media.format
                                        ? media.format.toUpperCase()
                                        : "—"}

                                    {media.width && media.height
                                        ? ` • ${media.width} × ${media.height}`
                                        : ""}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {media.bytes
                                        ? `${(
                                              media.bytes /
                                              (1024 * 1024)
                                          ).toFixed(2)} MB`
                                        : "—"}
                                </p>

                                {media.resourceType && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Type: {media.resourceType}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Active / Inactive */}
                        <div>
                            <label
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                                    isActive
                                        ? "border-green-200 bg-green-50"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(event) =>
                                        setIsActive(event.target.checked)
                                    }
                                    disabled={saving}
                                    className="h-4 w-4 rounded border-gray-300"
                                />

                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Active Media
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Active media can be used throughout the
                                        CMS.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                            <Link
                                href="/admin/media"
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}