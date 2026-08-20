
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoryViewPage() {
    const params = useParams();

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCategory = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/admin/categories/${params.id}`,
                    {
                        cache: "no-store",
                    },
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch category",
                    );
                }

                setCategory(result.data);
            } catch (error) {
                console.error("Fetch category error:", error);

                setError(
                    error.message || "Failed to fetch category",
                );
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadCategory();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="p-10 text-center text-sm text-gray-500">
                Loading category...
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/categories"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Categories
                    </Link>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/categories"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Categories
                    </Link>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    Category not found.
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/admin/categories"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Categories
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-gray-900">
                        View Category
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View category details
                    </p>
                </div>

                <Link
                    href={`/admin/categories/${category._id}/edit`}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Edit Category
                </Link>
            </div>

            {/* Main Card */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Image */}
                <div className="border-b border-gray-200 bg-gray-50 p-6">
                    {category.image?.url ? (
                        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gray-100 sm:h-80">
                            <Image
                                src={category.image.url}
                                alt={category.name || "Category image"}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400 sm:h-80">
                            No image available
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Name */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Category Name
                            </p>

                            <p className="mt-2 text-base font-medium text-gray-900">
                                {category.name || "—"}
                            </p>
                        </div>

                        {/* Slug */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Slug
                            </p>

                            <p className="mt-2 text-base text-gray-700">
                                {category.slug || "—"}
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </p>

                            <div className="mt-2">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${category.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {category.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>
                        </div>

                        {/* Created */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Created
                            </p>

                            <p className="mt-2 text-sm text-gray-700">
                                {category.createdAt
                                    ? new Date(
                                        category.createdAt,
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )
                                    : "—"}
                            </p>
                        </div>

                        {/* Updated */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Last Updated
                            </p>

                            <p className="mt-2 text-sm text-gray-700">
                                {category.updatedAt
                                    ? new Date(
                                        category.updatedAt,
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Description
                        </p>

                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                            {category.description || "No description available."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}