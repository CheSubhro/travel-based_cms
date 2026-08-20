
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewCategoryPage() {
    
    const params = useParams();
    const categoryId = params?.id;

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!categoryId) {
            return;
        }

        const fetchCategory = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/admin/categories/${categoryId}`,
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
                    error.message || "Failed to load category",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId]);

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
                <p className="text-sm text-gray-500">
                    Loading category...
                </p>
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

                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-gray-500">
                        Category not found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/categories"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Categories
                </Link>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            View Category
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View category information
                        </p>
                    </div>

                    <Link
                        href={`/admin/categories/${category._id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Edit Category
                    </Link>
                </div>
            </div>

            {/* Category Details */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Category Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        {category.image?.url ? (
                            <img
                                src={category.image.url}
                                alt={category.name || "Category"}
                                className="h-24 w-24 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-gray-400">
                                No Image
                            </div>
                        )}

                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {category.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {category.slug}
                            </p>

                            <div className="mt-3">
                                <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${category.isActive
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
                    </div>
                </div>

                {/* Information */}
                <div className="divide-y divide-gray-200">
                    {/* Name */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Category Name
                        </div>

                        <div className="text-sm text-gray-900 sm:col-span-2">
                            {category.name || "—"}
                        </div>
                    </div>

                    {/* Slug */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Slug
                        </div>

                        <div className="text-sm text-gray-900 sm:col-span-2">
                            {category.slug || "—"}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Description
                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-6 text-gray-700 sm:col-span-2">
                            {category.description || "—"}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Status
                        </div>

                        <div className="sm:col-span-2">
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-medium ${category.isActive
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

                    {/* Image */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Image
                        </div>

                        <div className="sm:col-span-2">
                            {category.image?.url ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <img
                                        src={category.image.url}
                                        alt={
                                            category.image.alt ||
                                            category.name ||
                                            "Category image"
                                        }
                                        className="max-h-80 w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No image selected.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Created */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Created
                        </div>

                        <div className="text-sm text-gray-700 sm:col-span-2">
                            {formatDate(category.createdAt)}
                        </div>
                    </div>

                    {/* Updated */}
                    <div className="grid gap-2 px-6 py-5 sm:grid-cols-3">
                        <div className="text-sm font-medium text-gray-500">
                            Last Updated
                        </div>

                        <div className="text-sm text-gray-700 sm:col-span-2">
                            {formatDate(category.updatedAt)}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5">
                    <Link
                        href="/admin/categories"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Back
                    </Link>

                    <Link
                        href={`/admin/categories/${category._id}/edit`}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Edit Category
                    </Link>
                </div>
            </div>
        </div>
    );
}