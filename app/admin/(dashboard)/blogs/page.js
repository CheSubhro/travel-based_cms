
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Toast from "@/components/admin/Toast";

export default function BlogsPage() {
    
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [featured, setFeatured] = useState("");
    const [category, setCategory] = useState("");

    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [deleteId, setDeleteId] = useState(null);
    const [deleteTitle, setDeleteTitle] = useState("");
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

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.set("page", page);
            params.set("limit", limit);

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (status) {
                params.set("status", status);
            }

            if (featured) {
                params.set("featured", featured);
            }

            if (category) {
                params.set("category", category);
            }

            params.set("sortBy", sortBy);
            params.set("sortOrder", sortOrder);

            const response = await fetch(
                `/api/admin/blogs?${params.toString()}`,
                {
                    cache: "no-store",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch blogs");
            }

            setBlogs(result.data || []);
            setTotal(result.pagination?.total || 0);
            setTotalPages(result.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Fetch blogs error:", error);

            setError(error.message || "Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (blogId, newStatus) => {
        try {
            setError("");

            const response = await fetch(`/api/admin/blogs/${blogId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update blog status",
                );
            }

            setBlogs((previous) =>
                previous.map((blog) =>
                    blog._id === blogId
                        ? {
                              ...blog,
                              status: result.data.status,
                          }
                        : blog,
                ),
            );

            showToast("success", "Blog status updated successfully.");
        } catch (error) {
            console.error("Update blog status error:", error);

            showToast("error", error.message || "Failed to update blog status");
        }
    };

    const handleFeaturedChange = async (blogId, featured) => {
        try {
            setError("");

            const response = await fetch(`/api/admin/blogs/${blogId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    featured,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update featured status",
                );
            }

            setBlogs((previous) =>
                previous.map((blog) =>
                    blog._id === blogId
                        ? {
                              ...blog,
                              featured: result.data.featured,
                          }
                        : blog,
                ),
            );

            showToast("success", "Featured status updated successfully.");
        } catch (error) {
            console.error("Update blog featured status error:", error);

            showToast(
                "error",
                error.message || "Failed to update featured status",
            );
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/categories?limit=100", {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch categories");
            }

            setCategories(result.data || []);
        } catch (error) {
            console.error("Fetch categories error:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [page, status, featured, category, sortBy, sortOrder]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);

        fetchBlogs();
    };

    const handleReset = () => {
        setSearch("");
        setStatus("");
        setFeatured("");
        setCategory("");
        setSortBy("createdAt");
        setSortOrder("desc");
        setPage(1);
    };

    const getStatusClass = (blogStatus) => {
        if (blogStatus === "published") {
            return "border-green-200 bg-green-100 text-green-700";
        }

        if (blogStatus === "draft") {
            return "border-yellow-200 bg-yellow-100 text-yellow-700";
        }

        return "border-gray-200 bg-gray-100 text-gray-700";
    };

    const openDeleteModal = (destination) => {
        setDeleteId(destination._id);
        setDeleteTitle(destination.title);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setDeleteId(null);
        setDeleteTitle("");
    };

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/admin/blogs/${deleteId}`,
                {
                    method: "DELETE",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete blog",
                );
            }

            setDeleteId(null);
            setDeleteTitle("");

            showToast("success", "Blog deleted successfully.");

            await fetchBlogs();
        } catch (error) {
            console.error("Delete blog error:", error);

            showToast(
                "error",
                error.message || "Failed to delete blog",
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
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Blogs
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage your blog posts
                        </p>
                    </div>

                    <Link
                        href="/admin/blogs/new"
                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Add Blog
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <form
                        onSubmit={handleSearch}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
                    >
                        {/* Search */}
                        <div className="xl:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search blogs..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                            >
                                <option value="">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Featured */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Featured
                            </label>

                            <select
                                value={featured}
                                onChange={(event) => {
                                    setFeatured(event.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                            >
                                <option value="">All</option>
                                <option value="true">Featured</option>
                                <option value="false">Not Featured</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(event) => {
                                    setCategory(event.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                            >
                                <option value="">All Categories</option>

                                {categories.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Sort
                            </label>

                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(event) => {
                                    const [field, order] =
                                        event.target.value.split("-");

                                    setSortBy(field);
                                    setSortOrder(order);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                            >
                                <option value="createdAt-desc">Newest</option>

                                <option value="createdAt-asc">Oldest</option>

                                <option value="updatedAt-desc">
                                    Recently Updated
                                </option>

                                <option value="updatedAt-asc">
                                    Least Recently Updated
                                </option>

                                <option value="title-asc">Title A-Z</option>

                                <option value="title-desc">Title Z-A</option>

                                <option value="publishedAt-desc">
                                    Recently Published
                                </option>

                                <option value="publishedAt-asc">
                                    Oldest Published
                                </option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Search
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Total */}
                <div className="mb-4 text-sm text-gray-500">
                    {total} blog{total !== 1 ? "s" : ""} found
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="p-10 text-center text-sm text-gray-500">
                            Loading blogs...
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-sm text-gray-500">
                                No blogs found.
                            </p>

                            <Link
                                href="/admin/blogs/new"
                                className="mt-3 inline-block text-sm font-medium text-gray-900 underline"
                            >
                                Add your first blog
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Blog
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Category
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Author
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Featured
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {blogs.map((blog) => (
                                        <tr
                                            key={blog._id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            {/* Blog */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {blog.featuredImage?.url ? (
                                                        <img
                                                            src={
                                                                blog
                                                                    .featuredImage
                                                                    .url
                                                            }
                                                            alt={
                                                                blog
                                                                    .featuredImage
                                                                    .alt ||
                                                                blog.title
                                                            }
                                                            className="h-12 w-16 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900">
                                                            {blog.title}
                                                        </p>

                                                        <p className="mt-1 max-w-md truncate text-xs text-gray-500">
                                                            {blog.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-5 py-4">
                                                {blog.category?.name ? (
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                                                        {blog.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Author */}
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {blog.author?.name ||
                                                            "Unknown"}
                                                    </p>

                                                    {blog.author?.email && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {blog.author.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <select
                                                    value={blog.status}
                                                    onChange={(event) =>
                                                        handleStatusChange(
                                                            blog._id,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition ${
                                                        blog.status ===
                                                        "published"
                                                            ? "border-green-200 bg-green-100 text-green-700"
                                                            : blog.status ===
                                                                "draft"
                                                              ? "border-yellow-200 bg-yellow-100 text-yellow-700"
                                                              : "border-gray-200 bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    <option value="draft">
                                                        Draft
                                                    </option>

                                                    <option value="published">
                                                        Published
                                                    </option>

                                                    <option value="archived">
                                                        Archived
                                                    </option>
                                                </select>
                                            </td>

                                            {/* Featured */}
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleFeaturedChange(
                                                            blog._id,
                                                            !blog.featured,
                                                        )
                                                    }
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                                        blog.featured
                                                            ? "border-green-200 bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {blog.featured
                                                        ? "Featured"
                                                        : "Not Featured"}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/admin/blogs/${blog._id}`}
                                                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                                    >
                                                        View
                                                    </Link>

                                                    <Link
                                                        href={`/admin/blogs/${blog._id}/edit`}
                                                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                blog,
                                                            )
                                                        }
                                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                                    >
                                                        {" "}
                                                        Delete{" "}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
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
                            Delete Destination
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-gray-900">
                                "{deleteTitle}"
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