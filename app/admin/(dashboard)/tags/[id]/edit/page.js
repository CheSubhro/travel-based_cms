"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Toast from "@/components/admin/Toast";

export default function EditTagPage() {
    const params = useParams();
    const router = useRouter();
    const tagId = params?.id;

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    useEffect(() => {
        if (!tagId) {
            return;
        }

        let cancelled = false;

        const loadTag = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`/api/admin/tags/${tagId}`, {
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to fetch tag");
                }

                if (!cancelled) {
                    const tag = result.data;

                    setName(tag?.name || "");
                    setSlug(tag?.slug || "");
                    setIsActive(tag?.isActive ?? true);
                }
            } catch (error) {
                console.error("Fetch tag error:", error);

                if (!cancelled) {
                    setError(error.message || "Failed to load tag");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadTag();

        return () => {
            cancelled = true;
        };
    }, [tagId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Tag name is required.");
            return;
        }

        if (!slug.trim()) {
            setError("Tag slug is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await fetch(`/api/admin/tags/${tagId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    slug: slug.trim(),
                    isActive,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (Array.isArray(result.errors) && result.errors.length > 0) {
                    throw new Error(result.errors.join(", "));
                }

                throw new Error(result.message || "Failed to update tag");
            }

            setToast({
                show: true,
                message: "Tag updated successfully.",
                type: "success",
            });

            setTimeout(() => {
                router.push("/admin/tags");
            }, 800);
        } catch (error) {
            console.error("Update tag error:", error);

            setError(error.message || "Failed to update tag");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/tags"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Tags
                    </Link>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-gray-500">Loading tag...</p>
                </div>
            </div>
        );
    }

    if (error && !name && !slug) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/tags"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Tags
                    </Link>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast((previous) => ({
                        ...previous,
                        show: false,
                    }))
                }
            />

            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/tags"
                    className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    ← Back to Tags
                </Link>

                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Tag
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Update tag information
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            Tag Information
                        </h2>
                    </div>

                    <div className="space-y-6 p-5">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Enter tag name"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label
                                htmlFor="slug"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Slug
                            </label>

                            <input
                                id="slug"
                                type="text"
                                value={slug}
                                onChange={(event) =>
                                    setSlug(event.target.value)
                                }
                                placeholder="tag-slug"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Use lowercase letters, numbers and hyphens.
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <p className="mb-2 block text-sm font-medium text-gray-700">
                                Status
                            </p>

                            <label
                                htmlFor="isActive"
                                className="flex cursor-pointer items-center gap-3"
                            >
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(event) =>
                                        setIsActive(event.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />

                                <span className="text-sm font-medium text-gray-700">
                                    Active
                                </span>
                            </label>

                            <p className="mt-1.5 text-xs text-gray-500">
                                Active tags can be used throughout the CMS.
                                Uncheck to make this tag inactive.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                        <Link
                            href="/admin/tags"
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Updating..." : "Update Tag"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}