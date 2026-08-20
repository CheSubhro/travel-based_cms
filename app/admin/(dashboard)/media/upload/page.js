"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Toast from "@/components/admin/Toast";

export default function UploadMediaPage() {
    const router = useRouter();

    const [file, setFile] = useState(null);
    const [alt, setAlt] = useState("");
    const [caption, setCaption] = useState("");

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

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

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        setError("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        const maxFileSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(selectedFile.type)) {
            setFile(null);
            setError("Invalid image type. Only JPG, PNG and WebP are allowed.");
            return;
        }

        if (selectedFile.size > maxFileSize) {
            setFile(null);
            setError("Image size cannot exceed 5MB.");
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!file) {
            setError("Please select an image.");
            return;
        }

        if (!alt.trim()) {
            setError("Alt text is required.");
            return;
        }

        if (alt.trim().length > 200) {
            setError("Alt text cannot exceed 200 characters.");
            return;
        }

        if (caption.trim().length > 500) {
            setError("Caption cannot exceed 500 characters.");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append("file", file);
            formData.append("alt", alt.trim());
            formData.append("caption", caption.trim());

            const response = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to upload image");
            }

            showToast("success", "Image uploaded successfully.");

            setFile(null);
            setAlt("");
            setCaption("");

            const fileInput = document.getElementById("media-file");

            if (fileInput) {
                fileInput.value = "";
            }

            setTimeout(() => {
                router.push("/admin/media");
            }, 1000);
        } catch (error) {
            console.error("Upload media error:", error);

            showToast("error", error.message || "Failed to upload image");

            setError(error.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Toast
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
            />

            <div className="w-full space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/media"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Media
                    </Link>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Upload Media
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Upload a new image to your media library.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Image Upload
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="media-file"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Image
                                </label>

                                <input
                                    id="media-file"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                    className="block w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    JPG, JPEG, PNG or WebP. Maximum file size:
                                    5MB.
                                </p>
                            </div>

                            {file && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Selected preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {file.name}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {(
                                                    file.size /
                                                    (1024 * 1024)
                                                ).toFixed(2)}{" "}
                                                MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media Information */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Media Information
                        </h2>

                        <div className="grid gap-5">
                            <div>
                                <label
                                    htmlFor="alt"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Alt Text
                                </label>

                                <input
                                    id="alt"
                                    type="text"
                                    value={alt}
                                    onChange={(event) =>
                                        setAlt(event.target.value)
                                    }
                                    maxLength={200}
                                    disabled={uploading}
                                    required
                                    placeholder="Describe the image"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    Required. Maximum 200 characters.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="caption"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Caption
                                </label>

                                <textarea
                                    id="caption"
                                    value={caption}
                                    onChange={(event) =>
                                        setCaption(event.target.value)
                                    }
                                    maxLength={500}
                                    rows={5}
                                    disabled={uploading}
                                    placeholder="Optional image caption"
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    Optional. Maximum 500 characters.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Information */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Upload Information
                        </h2>

                        <div className="grid gap-5 md:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Allowed Types
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    JPG, JPEG, PNG, WebP
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Maximum Size
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    5 MB
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Storage
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    Cloudinary
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/media"
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {uploading ? "Uploading..." : "Upload Media"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}