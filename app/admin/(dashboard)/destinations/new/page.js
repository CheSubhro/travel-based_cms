"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewDestinationPage() {
    const router = useRouter();

    const [categories, setCategories] = useState([]);
    const [media, setMedia] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        location: {
            country: "",
            state: "",
            city: "",
            address: "",
        },
        images: [],
        featuredImage: "",
        featured: false,
        status: "draft",
        categories: [],
    });

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                setLoadingData(true);
                setError("");

                const [categoriesResponse, mediaResponse] = await Promise.all([
                    fetch("/api/admin/categories?limit=100"),
                    fetch("/api/admin/media?limit=100"),
                ]);

                if (!categoriesResponse.ok) {
                    throw new Error("Failed to fetch categories");
                }

                if (!mediaResponse.ok) {
                    throw new Error("Failed to fetch media");
                }

                const categoriesData = await categoriesResponse.json();
                const mediaData = await mediaResponse.json();

                setCategories(categoriesData.data || []);
                setMedia(mediaData.data || []);
            } catch (error) {
                console.error("Fetch destination form data error:", error);
                setError("Failed to load categories and media");
            } finally {
                setLoadingData(false);
            }
        };

        fetchFormData();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleLocationChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            location: {
                ...previous.location,
                [name]: value,
            },
        }));
    };

    const handleCategoryChange = (categoryId) => {
        setFormData((previous) => {
            const alreadySelected = previous.categories.includes(categoryId);

            return {
                ...previous,
                categories: alreadySelected
                    ? previous.categories.filter((id) => id !== categoryId)
                    : [...previous.categories, categoryId],
            };
        });
    };

    const handleGalleryChange = (imageId) => {
        setFormData((previous) => {
            const alreadySelected = previous.images.includes(imageId);

            return {
                ...previous,
                images: alreadySelected
                    ? previous.images.filter((id) => id !== imageId)
                    : [...previous.images, imageId],
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/admin/destinations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to create destination",
                );
            }

            router.push("/admin/destinations");
            router.refresh();
        } catch (error) {
            console.error("Create destination error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading form data...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Create Destination
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Add a new travel destination.
                    </p>
                </div>

                <Link
                    href="/admin/destinations"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    Back to Destinations
                </Link>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Basic Information
                    </h2>

                    <div className="grid gap-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                placeholder="Enter destination title"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Slug
                            </label>

                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                placeholder="example-destination"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Short Description
                            </label>

                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                placeholder="Short description"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={8}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                placeholder="Write destination description"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Location
                    </h2>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Country
                            </label>

                            <input
                                type="text"
                                name="country"
                                value={formData.location.country}
                                onChange={handleLocationChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                State
                            </label>

                            <input
                                type="text"
                                name="state"
                                value={formData.location.state}
                                onChange={handleLocationChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.location.city}
                                onChange={handleLocationChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Address
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={formData.location.address}
                                onChange={handleLocationChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Categories
                    </h2>

                    {categories.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No categories available.
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <label
                                    key={category._id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(
                                            category._id,
                                        )}
                                        onChange={() =>
                                            handleCategoryChange(category._id)
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />

                                    <span className="text-sm text-gray-700">
                                        {category.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Featured Image
                    </h2>

                    <select
                        name="featuredImage"
                        value={formData.featuredImage}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    >
                        <option value="">Select featured image</option>

                        {media.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.originalName || item.publicId}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Gallery Images
                    </h2>

                    {media.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No media available.
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {media.map((item) => {
                                const selected = formData.images.includes(
                                    item._id,
                                );

                                return (
                                    <label
                                        key={item._id}
                                        className={`cursor-pointer overflow-hidden rounded-lg border ${
                                            selected
                                                ? "border-gray-900 ring-2 ring-gray-900"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <div className="aspect-video bg-gray-100">
                                            <img
                                                src={item.url}
                                                alt={item.alt || ""}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 p-3">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() =>
                                                    handleGalleryChange(
                                                        item._id,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-300"
                                            />

                                            <span className="truncate text-xs text-gray-600">
                                                {item.originalName ||
                                                    item.publicId}
                                            </span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Publishing
                    </h2>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <label
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                    formData.featured
                                        ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                                        : "border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={(event) =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            featured: event.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />

                                <span className="text-sm text-gray-700">
                                    Featured destination
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/admin/destinations"
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Destination"}
                    </button>
                </div>
            </form>
        </div>
    );
}