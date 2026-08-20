"use client";

import Link from "next/link";
import { useState } from "react";

import Toast from "@/components/admin/Toast";

export default function NewTagPage() {
    
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const generateSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const handleNameChange = (event) => {
        const value = event.target.value;

        setName(value);

        if (!slug) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (!name.trim()) {
                setError("Tag name is required.");
                return;
            }

            if (!slug.trim()) {
                setError("Tag slug is required.");
                return;
            }

            const response = await fetch("/api/admin/tags", {
                method: "POST",
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

                throw new Error(result.message || "Failed to create tag");
            }

            setToast({
                show: true,
                message: "Tag created successfully.",
                type: "success",
            });

            setTimeout(() => {
                window.location.href = "/admin/tags";
            }, 800);
        } catch (error) {
            console.error("Create tag error:", error);

            setError(error.message || "Failed to create tag");
        } finally {
            setSaving(false);
        }
    };

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
                        Add Tag
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Create a new tag
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
                                onChange={handleNameChange}
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
                            {saving ? "Creating..." : "Create Tag"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}