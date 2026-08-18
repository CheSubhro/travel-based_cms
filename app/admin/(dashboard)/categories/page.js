
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Toast from "@/components/admin/Toast";

export default function CategoriesPage() {
    
    const [categories, setCategories] = useState([]);
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const limit = 10;

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState("");
    const [deleting, setDeleting] = useState(false);

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
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                params.set("page", page);
                params.set("limit", limit);

                const response = await fetch(
                    `/api/admin/categories?${params.toString()}`,
                    {
                        cache: "no-store",
                    },
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch categories",
                    );
                }

                setCategories(result.data || []);
                setTotal(result.pagination?.total || 0);
                setTotalPages(result.pagination?.totalPages || 1);
                setRole(result.role || "");
            } catch (error) {
                console.error("Fetch categories error:", error);

                setError(
                    error.message || "Failed to fetch categories",
                );
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, [page]);

    const openDeleteModal = (category) => {
        setDeleteId(category._id);
        setDeleteName(category.name);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setDeleteId(null);
        setDeleteName("");
    };

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/admin/categories/${deleteId}`,
                {
                    method: "DELETE",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete category",
                );
            }

            setDeleteId(null);
            setDeleteName("");

            showToast(
                "success",
                "Category deleted successfully.",
            );

            // If the last item on the current page was deleted,
            // move back to the previous page.
            if (categories.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                // Reload current page.
                const params = new URLSearchParams();

                params.set("page", page);
                params.set("limit", limit);

                const refreshResponse = await fetch(
                    `/api/admin/categories?${params.toString()}`,
                    {
                        cache: "no-store",
                    },
                );

                const refreshResult = await refreshResponse.json();

                if (refreshResponse.ok) {
                    setCategories(refreshResult.data || []);
                    setTotal(refreshResult.pagination?.total || 0);
                    setTotalPages(
                        refreshResult.pagination?.totalPages || 1,
                    );
                }
            }
        } catch (error) {
            console.error("Delete category error:", error);

            showToast(
                "error",
                error.message || "Failed to delete category",
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Toast
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
            />

            <div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Categories
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage your travel categories
                        </p>
                    </div>

                    <Link
                        href="/admin/categories/new"
                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Add Category
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-4 text-sm text-gray-500">
                    {total} categor{total !== 1 ? "ies" : "y"} found
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="p-10 text-center text-sm text-gray-500">
                            Loading categories...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-sm text-gray-500">
                                No categories found.
                            </p>

                            <Link
                                href="/admin/categories/new"
                                className="mt-3 inline-block text-sm font-medium text-gray-900 underline"
                            >
                                Add your first category
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Category
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Description
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Created
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr
                                            key={category._id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {category.image?.url ? (
                                                        <img
                                                            src={
                                                                category.image
                                                                    .url
                                                            }
                                                            alt={category.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-400">
                                                            No
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900">
                                                            {category.name}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {category.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="max-w-sm px-5 py-4">
                                                <p className="truncate text-sm text-gray-600">
                                                    {category.description ||
                                                        "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                                        category.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {category.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(
                                                        category.createdAt,
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/admin/categories/${category._id}`}
                                                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                                    >
                                                        View
                                                    </Link>

                                                    <Link
                                                        href={`/admin/categories/${category._id}/edit`}
                                                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                                    >
                                                        Edit
                                                    </Link>

                                                    {role === "admin" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    category,
                                                                )
                                                            }
                                                            className="text-sm font-medium text-red-600 hover:text-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
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
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Delete Category
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-gray-900">
                                &quot;{deleteName}&quot;
                            </span>
                            ?
                        </p>

                        <p className="mt-2 text-sm text-red-600">
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}