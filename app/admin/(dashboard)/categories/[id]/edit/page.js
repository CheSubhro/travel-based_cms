
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCategoryPage() {
    
    const router = useRouter();
    const params = useParams();

    const categoryId = params?.id;

    const [media, setMedia] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        isActive: true,
    });

    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState([]);

    useEffect(() => {
        if (!categoryId) {
            return;
        }

        const fetchData = async () => {
            try {
                setLoadingData(true);
                setError("");
                setFieldErrors([]);

                const [categoryResponse, mediaResponse] =
                    await Promise.all([
                        fetch(`/api/admin/categories/${categoryId}`, {
                            cache: "no-store",
                        }),
                        fetch("/api/admin/media?limit=100", {
                            cache: "no-store",
                        }),
                    ]);

                const categoryResult = await categoryResponse.json();
                const mediaResult = await mediaResponse.json();

                if (!categoryResponse.ok) {
                    throw new Error(
                        categoryResult.message ||
                            "Failed to fetch category",
                    );
                }

                if (!mediaResponse.ok) {
                    throw new Error(
                        mediaResult.message || "Failed to fetch media",
                    );
                }

                const category = categoryResult.data;

                setFormData({
                    name: category.name || "",
                    slug: category.slug || "",
                    description: category.description || "",
                    image: category.image?._id || category.image || "",
                    isActive: category.isActive ?? true,
                });

                setMedia(mediaResult.data || []);
            } catch (error) {
                console.error("Fetch category edit data error:", error);

                setError(
                    error.message || "Failed to load category data",
                );
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [categoryId]);

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

            if (formData.image) {
                payload.image = formData.image;
            } else {
                payload.image = null;
            }

            const response = await fetch(
                `/api/admin/categories/${categoryId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                setFieldErrors(result.errors || []);

                throw new Error(
                    result.message || "Failed to update category",
                );
            }

            router.push("/admin/categories");
            router.refresh();
        } catch (error) {
            console.error("Update category error:", error);

            setError(
                error.message || "Failed to update category",
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading category...
                </p>
            </div>
        );
    }

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
                        Edit Category
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Update category information
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
                                            : item.message ||
                                              "Invalid value"}
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
                                required
                                maxLength={100}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Minimum 2 characters, maximum 100
                                characters.
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
                                rows={5}
                                maxLength={500}
                                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                            <p className="mt-1.5 text-xs text-gray-500">
                                Maximum 500 characters.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="image"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Image
                            </label>

                            <select
                                id="image"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            >
                                <option value="">
                                    No image
                                </option>

                                {media.map((item) => (
                                    <option
                                        key={item._id}
                                        value={item._id}
                                    >
                                        {item.originalName ||
                                            item.publicId}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-1.5 text-xs text-gray-500">
                                Optional. Select an active Media item.
                            </p>

                            {formData.image && (
                                <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                                    {media
                                        .filter(
                                            (item) =>
                                                item._id ===
                                                formData.image,
                                        )
                                        .map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-3 p-3"
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={item.alt || ""}
                                                    className="h-16 w-24 rounded-md object-cover"
                                                />

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                        {item.originalName ||
                                                            item.publicId}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Selected image
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
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
                                        Active categories can be used across
                                        the Travel CMS.
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
                            {loading
                                ? "Updating..."
                                : "Update Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}