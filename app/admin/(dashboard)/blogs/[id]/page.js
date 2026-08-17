

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ViewBlogPage() {
    const params = useParams();

    const blogId = params.id;

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/admin/blogs/${blogId}`,
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch blog",
                    );
                }

                setBlog(result.data);
            } catch (error) {
                console.error("Fetch blog error:", error);

                setError(
                    error.message || "Failed to load blog",
                );
            } finally {
                setLoading(false);
            }
        };

        if (blogId) {
            fetchBlog();
        }
    }, [blogId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading blog...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>

                <div className="mt-4">
                    <Link
                        href="/admin/blogs"
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        ← Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">
                        Blog not found.
                    </p>
                </div>
            </div>
        );
    }

    const featuredImage =
        typeof blog.featuredImage === "object"
            ? blog.featuredImage
            : null;

    const category =
        typeof blog.category === "object"
            ? blog.category
            : null;

    const tags = Array.isArray(blog.tags)
        ? blog.tags
        : [];

    const author =
        typeof blog.author === "object"
            ? blog.author
            : null;

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {blog.title}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Preview blog details.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/blogs"
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Back
                    </Link>

                    <Link
                        href={`/admin/blogs/${blog._id}/edit`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Edit Blog
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {featuredImage?.url ? (
                            <div className="aspect-video bg-gray-100">
                                <img
                                    src={featuredImage.url}
                                    alt={
                                        featuredImage.alt ||
                                        blog.title
                                    }
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex aspect-video items-center justify-center bg-gray-100">
                                <p className="text-sm text-gray-500">
                                    No featured image
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-2xl font-bold leading-tight text-gray-900">
                                {blog.title}
                            </h2>

                            {blog.excerpt && (
                                <p className="mt-3 text-base leading-7 text-gray-600">
                                    {blog.excerpt}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-5 text-sm text-gray-500">
                            {author && (
                                <span>
                                    By{" "}
                                    <span className="font-medium text-gray-900">
                                        {author.name}
                                    </span>
                                </span>
                            )}

                            {blog.publishedAt && (
                                <>
                                    <span>•</span>

                                    <span>
                                        {new Date(
                                            blog.publishedAt,
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            },
                                        )}
                                    </span>
                                </>
                            )}

                            {category && (
                                <>
                                    <span>•</span>

                                    <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                                        {category.name}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="mt-6">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Content
                            </h2>

                            {blog.content ? (
                                <div className="whitespace-pre-line text-sm leading-7 text-gray-600">
                                    {blog.content}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No content available.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Tags
                        </h2>

                        {tags.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No tags assigned.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag._id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Blog Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Status
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        blog.status === "published"
                                            ? "bg-green-100 text-green-700"
                                            : blog.status === "archived"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                    {blog.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Featured
                                </p>

                                <p className="mt-1 text-sm text-gray-700">
                                    {blog.featured ? "Yes" : "No"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Slug
                                </p>

                                <p className="mt-1 break-all text-sm text-gray-700">
                                    {blog.slug}
                                </p>
                            </div>

                            {blog.publishedAt && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Published At
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {new Date(
                                            blog.publishedAt,
                                        ).toLocaleString(
                                            "en-IN",
                                        )}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Created At
                                </p>

                                <p className="mt-1 text-sm text-gray-700">
                                    {blog.createdAt
                                        ? new Date(
                                              blog.createdAt,
                                          ).toLocaleString(
                                              "en-IN",
                                          )
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Updated At
                                </p>

                                <p className="mt-1 text-sm text-gray-700">
                                    {blog.updatedAt
                                        ? new Date(
                                              blog.updatedAt,
                                          ).toLocaleString(
                                              "en-IN",
                                          )
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Category
                        </h2>

                        {category ? (
                            <span className="inline-flex rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                                {category.name}
                            </span>
                        ) : (
                            <p className="text-sm text-gray-400">
                                No category assigned.
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Author
                        </h2>

                        {author ? (
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {author.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {author.email}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">
                                Author information unavailable.
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            SEO
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Meta Title
                                </p>

                                <p className="mt-1 text-sm text-gray-700">
                                    {blog.seo?.metaTitle || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Meta Description
                                </p>

                                <p className="mt-1 text-sm leading-6 text-gray-700">
                                    {blog.seo?.metaDescription || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Keywords
                                </p>

                                {blog.seo?.keywords?.length ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {blog.seo.keywords.map(
                                            (keyword) => (
                                                <span
                                                    key={keyword}
                                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                                                >
                                                    {keyword}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-gray-400">
                                        No keywords available.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

