
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewDestinationGalleryPage() {
    const params = useParams();
    const destinationId = params?.destinationId;

    const [destination, setDestination] = useState(null);
    const [media, setMedia] = useState([]);

    const [loading, setLoading] = useState(true);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);

    const [showMedia, setShowMedia] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const [previewImage, setPreviewImage] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!destinationId) {
            return;
        }

        fetchDestination();
    }, [destinationId]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setPreviewImage(null);
            }
        };

        if (previewImage) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [previewImage]);

    const fetchDestination = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/admin/destinations/${destinationId}`,
                {
                    cache: "no-store",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to fetch destination",
                );
            }

            setDestination(result.data);
        } catch (error) {
            console.error("Fetch destination gallery error:", error);

            setError(error.message || "Failed to load destination gallery");
        } finally {
            setLoading(false);
        }
    };

    const fetchMedia = async () => {
        try {
            setMediaLoading(true);
            setError("");

            const response = await fetch("/api/admin/media?limit=100", {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch media");
            }

            setMedia(result.data || []);
        } catch (error) {
            console.error("Fetch gallery media error:", error);

            setError(error.message || "Failed to load media");
        } finally {
            setMediaLoading(false);
        }
    };

    const handleOpenMedia = async () => {
        setShowMedia(true);

        if (media.length === 0) {
            await fetchMedia();
        }
    };

    const handleImageSelect = (imageId) => {
        setSelectedImages((previous) => {
            if (previous.includes(imageId)) {
                return previous.filter((id) => id !== imageId);
            }

            return [...previous, imageId];
        });
    };

    const handleAddImages = async () => {
        if (selectedImages.length === 0) {
            setError("Please select at least one image");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const existingImageIds = (destination.images || []).map((image) =>
                typeof image === "string" ? image : image._id,
            );

            const newImageIds = selectedImages.filter(
                (imageId) => !existingImageIds.includes(imageId),
            );

            if (newImageIds.length === 0) {
                setError("Selected images are already in this gallery");
                return;
            }

            const updatedImages = [...existingImageIds, ...newImageIds];

            const response = await fetch(
                `/api/admin/destinations/${destinationId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        images: updatedImages,
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to add images");
            }

            setDestination(result.data);
            setSelectedImages([]);
            setShowMedia(false);

            setSuccess("Images added to gallery successfully.");

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error("Add gallery images error:", error);

            setError(error.message || "Failed to add images");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseMedia = () => {
        setShowMedia(false);
        setSelectedImages([]);
    };

    const handleClosePreview = () => {
        setPreviewImage(null);
    };

    // Move gallery image up/down
    const handleMoveImage = async (index, direction) => {
        if (!destination?.images?.length || reordering) {
            return;
        }

        const newIndex = direction === "up" ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= destination.images.length) {
            return;
        }

        try {
            setReordering(true);
            setError("");
            setSuccess("");

            const reorderedImages = [...destination.images];

            const currentImage = reorderedImages[index];

            reorderedImages[index] = reorderedImages[newIndex];
            reorderedImages[newIndex] = currentImage;

            const imageIds = reorderedImages.map((image) =>
                typeof image === "string" ? image : image._id,
            );

            const response = await fetch("/api/admin/galleries", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    destinationId,
                    imageIds,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to reorder gallery",
                );
            }

            setDestination((previous) => ({
                ...previous,
                images: result.data.images,
            }));

            setSuccess("Gallery order updated successfully.");
        } catch (error) {
            console.error("Reorder gallery error:", error);

            setError(error.message || "Failed to reorder gallery");
        } finally {
            setReordering(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/galleries"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Galleries
                    </Link>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-gray-500">
                        Loading gallery...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !destination) {
        return (
            <div>
                <div className="mb-6">
                    <Link
                        href="/admin/galleries"
                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Galleries
                    </Link>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!destination) {
        return null;
    }

    const images = destination.images || [];
    const featuredImage = destination.featuredImage;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/galleries"
                    className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    ← Back to Galleries
                </Link>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {destination.title || "Untitled"}
                        </h1>

                        {destination.slug && (
                            <p className="mt-1 text-sm text-gray-500">
                                {destination.slug}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenMedia}
                        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Add Images
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && destination && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Summary */}
            <div className="mb-6 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Destination
                    </p>

                    <p className="mt-2 text-lg font-semibold text-gray-900">
                        {destination.title || "Untitled"}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total Images
                    </p>

                    <p className="mt-2 text-lg font-semibold text-gray-900">
                        {images.length}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                    </p>

                    <div className="mt-2">
                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                destination.status === "published"
                                    ? "bg-green-100 text-green-700"
                                    : destination.status === "draft"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {destination.status || "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {featuredImage?.url && (
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            Cover Image
                        </h2>
                    </div>

                    <div className="p-5">
                        <button
                            type="button"
                            onClick={() =>
                                setPreviewImage({
                                    url: featuredImage.url,
                                    alt:
                                        featuredImage.alt ||
                                        destination.title ||
                                        "Cover image",
                                })
                            }
                            className="block w-full cursor-zoom-in"
                        >
                            <img
                                src={featuredImage.url}
                                alt={
                                    featuredImage.alt ||
                                    destination.title ||
                                    "Cover image"
                                }
                                className="h-64 w-full rounded-xl object-cover transition duration-200 hover:opacity-90"
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* Gallery */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Gallery Images
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {images.length}{" "}
                            {images.length === 1 ? "image" : "images"}
                        </p>
                    </div>

                    {images.length > 1 && (
                        <p className="text-xs text-gray-500">
                            Use ↑ ↓ to change image order
                        </p>
                    )}
                </div>

                {images.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            No gallery images found for this destination.
                        </p>

                        <button
                            type="button"
                            onClick={handleOpenMedia}
                            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            + Add Images
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4">
                        {images.map((image, index) => {
                            const imageUrl = image?.url;

                            const imageAlt =
                                image?.alt ||
                                `${destination.title || "Gallery"} image ${
                                    index + 1
                                }`;

                            return (
                                <div
                                    key={image?._id || index}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                >
                                    {/* Image */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            imageUrl &&
                                            setPreviewImage({
                                                url: imageUrl,
                                                alt: imageAlt,
                                            })
                                        }
                                        className="group block w-full text-left"
                                    >
                                        <div className="relative overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={imageAlt}
                                                    className="aspect-square w-full cursor-zoom-in object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex aspect-square items-center justify-center bg-gray-100 text-xs text-gray-400">
                                                    Image unavailable
                                                </div>
                                            )}

                                            {/* Image number */}
                                            <div className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-black/70 px-2 text-xs font-semibold text-white">
                                                {index + 1}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between border-t border-gray-200 px-3 py-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMoveImage(index, "up")
                                            }
                                            disabled={
                                                index === 0 || reordering
                                            }
                                            aria-label="Move image up"
                                            title="Move image up"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            ↑
                                        </button>

                                        <span className="text-xs font-medium text-gray-500">
                                            Image {index + 1}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMoveImage(index, "down")
                                            }
                                            disabled={
                                                index === images.length - 1 ||
                                                reordering
                                            }
                                            aria-label="Move image down"
                                            title="Move image down"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Media Selection Modal */}
            {showMedia && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
                    <div className="mx-auto mt-10 max-w-6xl rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Add Images to Gallery
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Select one or more images from Media
                                    Library.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseMedia}
                                className="text-2xl leading-none text-gray-400 transition hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[65vh] overflow-y-auto p-5">
                            {mediaLoading ? (
                                <div className="p-10 text-center">
                                    <p className="text-sm text-gray-500">
                                        Loading media...
                                    </p>
                                </div>
                            ) : media.length === 0 ? (
                                <div className="p-10 text-center">
                                    <p className="text-sm text-gray-500">
                                        No active media found.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {media.map((item) => {
                                        const isSelected =
                                            selectedImages.includes(item._id);

                                        const alreadyAdded = images.some(
                                            (image) => image?._id === item._id,
                                        );

                                        return (
                                            <button
                                                type="button"
                                                key={item._id}
                                                disabled={alreadyAdded}
                                                onClick={() =>
                                                    handleImageSelect(item._id)
                                                }
                                                className={`relative overflow-hidden rounded-xl border-2 text-left transition ${
                                                    alreadyAdded
                                                        ? "cursor-not-allowed border-gray-200 opacity-50"
                                                        : isSelected
                                                          ? "border-gray-900"
                                                          : "border-gray-200 hover:border-gray-400"
                                                }`}
                                            >
                                                {item.url ? (
                                                    <img
                                                        src={item.url}
                                                        alt={
                                                            item.alt ||
                                                            item.originalName ||
                                                            "Media"
                                                        }
                                                        className="aspect-square w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-square items-center justify-center bg-gray-100 text-xs text-gray-400">
                                                        No image
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                                                        ✓
                                                    </div>
                                                )}

                                                {alreadyAdded && (
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5 text-center text-xs font-medium text-white">
                                                        Already added
                                                    </div>
                                                )}

                                                {!alreadyAdded &&
                                                    item.originalName && (
                                                        <div className="truncate px-2 py-2 text-xs text-gray-600">
                                                            {item.originalName}
                                                        </div>
                                                    )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                {selectedImages.length}{" "}
                                {selectedImages.length === 1
                                    ? "image"
                                    : "images"}{" "}
                                selected
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseMedia}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddImages}
                                    disabled={
                                        saving || selectedImages.length === 0
                                    }
                                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Adding..."
                                        : "Add Images to Gallery"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
                    onClick={handleClosePreview}
                >
                    <div
                        className="relative max-h-[95vh] max-w-6xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={handleClosePreview}
                            aria-label="Close image preview"
                            className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-2xl text-white transition hover:bg-black"
                        >
                            ×
                        </button>

                        <img
                            src={previewImage.url}
                            alt={previewImage.alt}
                            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                        />

                        {previewImage.alt && (
                            <p className="mt-3 text-center text-sm text-white">
                                {previewImage.alt}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}