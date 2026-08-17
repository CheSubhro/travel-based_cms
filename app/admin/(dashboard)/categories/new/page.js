
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateCategoryPage() {

    const [media, setMedia] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState([]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
        setFieldErrors([]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");
            setFieldErrors([]);

            const payload = {
                name: formData.name.trim(),
                slug: formData.slug.trim().toLowerCase(),
                description: formData.description.trim(),
                isActive: formData.isActive,
            };

            if (formData.image.trim()) {
                payload.image = formData.image.trim();
            }

            const response = await fetch("/api/admin/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                setFieldErrors(result.errors || []);

                throw new Error(
                    result.message || "Failed to create category",
                );
            }

            router.push("/admin/categories");
        } catch (error) {
            console.error("Create category error:", error);

            setError(
                error.message || "Failed to create category",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                setLoadingData(true);
                setError("");

                const response = await fetch("/api/admin/media?limit=100");

                if (!response.ok) {
                    throw new Error("Failed to fetch media");
                }

                const result = await response.json();

                setMedia(result.data || []);
            } catch (error) {
                console.error("Fetch category media error:", error);
                setError("Failed to load media");
            } finally {
                setLoadingData(false);
            }
        };

        fetchMedia();
    }, []);

    const handleImageChange = (imageId) => {
        setFormData((previous) => ({
            ...previous,
            image: previous.image === imageId ? "" : imageId,
        }));
    };

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/admin/categories"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Categories
                </Link>

                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Create Category
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Create a new travel category
                    </p>
                </div>
            </div>

            <div className="max-w-3xl">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {fieldErrors.length > 0 && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-700">
                                Please fix the following:
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-600">
                                {fieldErrors.map((item, index) => (
                                    <li key={index}>
                                        {typeof item === "string"
                                            ? item
                                            : item.message || "Invalid value"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Category Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Beach"
                                required
                                maxLength={100}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Minimum 2 characters, maximum 100 characters.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="slug"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Slug
                            </label>

                            <input
                                id="slug"
                                name="slug"
                                type="text"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="e.g. beach"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Use lowercase letters, numbers and hyphens.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe this category..."
                                rows={5}
                                maxLength={500}
                                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Maximum 500 characters.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Image
                            </label>

                            <p className="mb-4 text-xs text-gray-500">
                                Optional. Select an image from the Media
                                Library.
                            </p>

                            {media.length === 0 ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        No media available.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {media.map((item) => {
                                        const selected =
                                            formData.image === item._id;

                                        return (
                                            <button
                                                key={item._id}
                                                type="button"
                                                onClick={() =>
                                                    handleImageChange(item._id)
                                                }
                                                className={`overflow-hidden rounded-lg border text-left transition ${
                                                    selected
                                                        ? "border-gray-900 ring-2 ring-gray-900"
                                                        : "border-gray-200 hover:border-gray-400"
                                                }`}
                                            >
                                                <div className="aspect-video bg-gray-100">
                                                    <img
                                                        src={item.url}
                                                        alt={item.alt || ""}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="p-3">
                                                    <p className="truncate text-xs font-medium text-gray-700">
                                                        {item.originalName ||
                                                            item.publicId}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {selected
                                                            ? "Selected"
                                                            : "Select image"}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {formData.image && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            image: "",
                                        }))
                                    }
                                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    Remove selected image
                                </button>
                            )}
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300"
                                />

                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Active Category
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Active categories can be used across the
                                        Travel CMS.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
                        <Link
                            href="/admin/categories"
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}