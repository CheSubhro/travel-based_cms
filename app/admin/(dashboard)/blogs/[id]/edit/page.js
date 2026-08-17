

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Toast from "@/components/admin/Toast";

export default function EditBlogPage() {
    const params = useParams();
    const router = useRouter();

    const blogId = params.id;

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [media, setMedia] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [toast, setToast] = useState({
        type: "success",
        message: "",
    });

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        category: "",
        tags: [],
        status: "draft",
        featured: false,
        publishedAt: "",
        seo: {
            metaTitle: "",
            metaDescription: "",
            keywords: [],
        },
    });

    const [keywordInput, setKeywordInput] = useState("");

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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSeoChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            seo: {
                ...previous.seo,
                [name]: value,
            },
        }));
    };

    const handleFeaturedChange = (event) => {
        setFormData((previous) => ({
            ...previous,
            featured: event.target.checked,
        }));
    };

    const handleTagChange = (event) => {
        const selectedOptions = Array.from(
            event.target.selectedOptions,
            (option) => option.value,
        );

        setFormData((previous) => ({
            ...previous,
            tags: selectedOptions,
        }));
    };

    const addKeyword = () => {
        const keyword = keywordInput.trim();

        if (!keyword) {
            return;
        }

        if (formData.seo.keywords.includes(keyword)) {
            setKeywordInput("");
            return;
        }

        setFormData((previous) => ({
            ...previous,
            seo: {
                ...previous.seo,
                keywords: [...previous.seo.keywords, keyword],
            },
        }));

        setKeywordInput("");
    };

    const removeKeyword = (keywordToRemove) => {
        setFormData((previous) => ({
            ...previous,
            seo: {
                ...previous.seo,
                keywords: previous.seo.keywords.filter(
                    (keyword) => keyword !== keywordToRemove,
                ),
            },
        }));
    };

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        setFormData((previous) => ({
            ...previous,
            slug,
        }));
    };

    const formatPublishedAt = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        const offset = parsedDate.getTimezoneOffset();
        const localDate = new Date(parsedDate.getTime() - offset * 60000);

        return localDate.toISOString().slice(0, 16);
    };

    useEffect(() => {
        if (!blogId) {
            return;
        }

        let cancelled = false;

        const loadData = async () => {
            try {
                setLoadingData(true);

                const [
                    blogResponse,
                    categoryResponse,
                    tagResponse,
                    mediaResponse,
                ] = await Promise.all([
                    fetch(`/api/admin/blogs/${blogId}`, {
                        cache: "no-store",
                    }),

                    fetch("/api/admin/categories?limit=100", {
                        cache: "no-store",
                    }),

                    fetch("/api/admin/tags?limit=100", {
                        cache: "no-store",
                    }),

                    fetch("/api/admin/media?limit=100", {
                        cache: "no-store",
                    }),
                ]);

                const blogResult = await blogResponse.json();
                const categoryResult = await categoryResponse.json();
                const tagResult = await tagResponse.json();
                const mediaResult = await mediaResponse.json();

                if (!blogResponse.ok) {
                    throw new Error(
                        blogResult.message || "Failed to fetch blog",
                    );
                }

                if (!categoryResponse.ok) {
                    throw new Error(
                        categoryResult.message || "Failed to fetch categories",
                    );
                }

                if (!tagResponse.ok) {
                    throw new Error(
                        tagResult.message || "Failed to fetch tags",
                    );
                }

                if (!mediaResponse.ok) {
                    throw new Error(
                        mediaResult.message || "Failed to fetch media",
                    );
                }

                if (cancelled) {
                    return;
                }

                const blog = blogResult.data;

                setCategories(categoryResult.data || []);
                setTags(tagResult.data || []);
                setMedia(mediaResult.data || []);

                setFormData({
                    title: blog.title || "",
                    slug: blog.slug || "",
                    excerpt: blog.excerpt || "",
                    content: blog.content || "",

                    featuredImage:
                        blog.featuredImage?._id || blog.featuredImage || "",

                    category: blog.category?._id || blog.category || "",

                    tags: Array.isArray(blog.tags)
                        ? blog.tags.map((item) => item?._id || item)
                        : [],

                    status: blog.status || "draft",

                    featured: Boolean(blog.featured),

                    publishedAt: formatPublishedAt(blog.publishedAt),

                    seo: {
                        metaTitle: blog.seo?.metaTitle || "",
                        metaDescription: blog.seo?.metaDescription || "",
                        keywords: Array.isArray(blog.seo?.keywords)
                            ? blog.seo.keywords
                            : [],
                    },
                });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error("Fetch edit blog data error:", error);

                showToast("error", error.message || "Failed to load blog");
            } finally {
                if (!cancelled) {
                    setLoadingData(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [blogId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.title.trim().length < 5) {
            showToast(
                "error",
                "Blog title must be at least 5 characters.",
            );
            return;
        }

        if (!formData.slug.trim()) {
            showToast("error", "Blog slug is required.");
            return;
        }

        if (formData.content.trim().length < 20) {
            showToast(
                "error",
                "Blog content must be at least 20 characters.",
            );
            return;
        }

        try {
            setLoading(true);

            const payload = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: formData.excerpt.trim(),
                content: formData.content,

                featuredImage:
                    formData.featuredImage || null,

                category:
                    formData.category || null,

                tags: formData.tags,

                status: formData.status,

                featured: formData.featured,

                publishedAt:
                    formData.status === "published" &&
                    formData.publishedAt
                        ? new Date(
                              formData.publishedAt,
                          ).toISOString()
                        : undefined,

                seo: {
                    metaTitle:
                        formData.seo.metaTitle.trim(),

                    metaDescription:
                        formData.seo.metaDescription.trim(),

                    keywords: formData.seo.keywords,
                },
            };

            const response = await fetch(
                `/api/admin/blogs/${blogId}`,
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
                throw new Error(
                    result.message ||
                        "Failed to update blog",
                );
            }

            showToast(
                "success",
                "Blog updated successfully.",
            );

            setTimeout(() => {
                router.push("/admin/blogs");
            }, 800);
        } catch (error) {
            console.error("Update blog error:", error);

            showToast(
                "error",
                error.message ||
                    "Failed to update blog",
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <>
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={closeToast}
                />

                <div className="mx-auto max-w-5xl">
                    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                        <p className="text-sm text-gray-500">
                            Loading blog...
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Toast
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
            />

            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <Link
                        href="/admin/blogs"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                        ← Back to Blogs
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-gray-900">
                        Edit Blog
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Update your blog post
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Basic Information
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Title *
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter blog title"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Slug *
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="blog-slug"
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={generateSlug}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Excerpt
                                </label>

                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows={4}
                                    maxLength={500}
                                    placeholder="Short description of the blog..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    {formData.excerpt.length}/500
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Content *
                                </label>

                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows={14}
                                    placeholder="Write your blog content..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                    required
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    Minimum 20 characters
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Blog Settings
                        </h2>

                        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Featured Image
                                </label>

                                <select
                                    name="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={handleChange}
                                    disabled={loadingData}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                >
                                    <option value="">No featured image</option>

                                    {media.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.filename ||
                                                item.name ||
                                                item._id}
                                        </option>
                                    ))}
                                </select>

                                {media.length === 0 && !loadingData && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        No media available.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={loadingData}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                >
                                    <option value="">Select category</option>

                                    {categories.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Tags
                                </label>

                                <select
                                    multiple
                                    value={formData.tags}
                                    onChange={handleTagChange}
                                    disabled={loadingData}
                                    className="min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
                                >
                                    {tags.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-1 text-xs text-gray-400">
                                    Hold Ctrl and select multiple tags.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
                                >
                                    <option value="draft">Draft</option>

                                    <option value="published">Published</option>

                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            {formData.status === "published" && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Published At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="publishedAt"
                                        value={formData.publishedAt}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
                                    />
                                </div>
                            )}

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
                                        Featured Blog
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            SEO
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Meta Title
                                </label>

                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.seo.metaTitle}
                                    onChange={handleSeoChange}
                                    maxLength={160}
                                    placeholder="SEO title"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    {formData.seo.metaTitle.length}
                                    /160
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Meta Description
                                </label>

                                <textarea
                                    name="metaDescription"
                                    value={formData.seo.metaDescription}
                                    onChange={handleSeoChange}
                                    maxLength={320}
                                    rows={4}
                                    placeholder="SEO description"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    {formData.seo.metaDescription.length}
                                    /320
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Keywords
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(event) =>
                                            setKeywordInput(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addKeyword();
                                            }
                                        }}
                                        placeholder="Enter keyword"
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={addKeyword}
                                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.seo.keywords.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.seo.keywords.map(
                                            (keyword) => (
                                                <button
                                                    key={keyword}
                                                    type="button"
                                                    onClick={() =>
                                                        removeKeyword(keyword)
                                                    }
                                                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
                                                >
                                                    {keyword} ×
                                                </button>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/blogs"
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Blog"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

