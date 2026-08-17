import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

import Media from "@/models/Media";

import { getSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/authorization";
import { ROLES } from "@/constants/roles";

import { apiError } from "@/lib/api/error";

import { getPaginationParams, createPaginationMeta } from "@/lib/pagination";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export async function POST(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const formData = await request.formData();

        const file = formData.get("file");

        const alt = formData.get("alt")?.toString().trim() || "";

        const caption = formData.get("caption")?.toString().trim() || "";

        if (!file || typeof file === "string") {
            return apiError("Image file is required", 400);
        }

        if (!alt) {
            return apiError("Alt text is required", 400);
        }

        if (alt.length > 200) {
            return apiError("Alt text cannot exceed 200 characters", 400);
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return apiError(
                "Invalid image type. Only JPEG, PNG and WebP are allowed",
                400,
            );
        }

        if (file.size <= 0) {
            return apiError("Image file is empty", 400);
        }

        if (file.size > MAX_FILE_SIZE) {
            return apiError("Image size cannot exceed 5MB", 400);
        }

        const originalName = file.name.toLowerCase();

        const hasValidExtension = ALLOWED_EXTENSIONS.some((extension) =>
            originalName.endsWith(extension),
        );

        if (!hasValidExtension) {
            return apiError(
                "Invalid image extension. Only JPG, JPEG, PNG and WebP are allowed",
                400,
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "travel-cms",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                },
            );

            uploadStream.end(buffer);
        });

        const media = await Media.create({
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url,
            resourceType: uploadResult.resource_type,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
            originalName: file.name,
            alt,
            caption,
            folder: "travel-cms",
            uploadedBy: session.userId,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Image uploaded successfully",
                data: media,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST admin media error:", error);

        if (error.code === 11000) {
            return apiError("Media with this public ID already exists", 409);
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                (err) => err.message,
            );

            return apiError("Media validation failed", 400, errors);
        }

        return apiError("Failed to upload image", 500);
    }
}

export async function GET(request) {
    try {
        await connectDB();

        const session = await getSession();

        const authorization = requireRole(session, [ROLES.ADMIN, ROLES.EDITOR]);

        if (!authorization.authorized) {
            return apiError(authorization.message, authorization.status);
        }

        const { searchParams } = new URL(request.url);

        const { page, limit, skip } = getPaginationParams(searchParams);

        const search = searchParams.get("search");
        const isActive = searchParams.get("isActive");

        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const allowedSortFields = [
            "createdAt",
            "updatedAt",
            "originalName",
            "format",
            "bytes",
        ];

        const allowedSortOrders = ["asc", "desc"];

        if (!allowedSortFields.includes(sortBy)) {
            return apiError("Invalid sort field", 400);
        }

        if (!allowedSortOrders.includes(sortOrder)) {
            return apiError("Invalid sort order", 400);
        }

        const filter = {};

        if (isActive !== null) {
            if (isActive !== "true" && isActive !== "false") {
                return apiError("isActive must be true or false", 400);
            }

            filter.isActive = isActive === "true";
        }

        if (search?.trim()) {
            const searchTerm = search.trim();

            filter.$or = [
                {
                    originalName: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    alt: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    caption: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
            ];
        }

        const sort = {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        };

        const [media, total] = await Promise.all([
            Media.find(filter).sort(sort).skip(skip).limit(limit).lean(),

            Media.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            data: media,
            pagination: createPaginationMeta({
                page,
                limit,
                total,
            }),
            filters: {
                search: search?.trim() || null,
                isActive: isActive !== null ? isActive === "true" : null,
            },
            sorting: {
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("GET admin media error:", error);

        return apiError("Failed to fetch media", 500);
    }
}