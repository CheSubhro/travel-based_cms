
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        publicId: {
            type: String,
            required: [true, "Cloudinary public ID is required"],
            unique: true,
            trim: true,
        },

        url: {
            type: String,
            required: [true, "Media URL is required"],
            trim: true,
        },

        resourceType: {
            type: String,
            enum: {
                values: ["image", "video", "raw"],
                message: "Invalid media resource type",
            },
            default: "image",
        },

        format: {
            type: String,
            trim: true,
        },

        width: {
            type: Number,
            min: [1, "Width must be greater than 0"],
        },

        height: {
            type: Number,
            min: [1, "Height must be greater than 0"],
        },

        bytes: {
            type: Number,
            min: [1, "File size must be greater than 0"],
        },

        originalName: {
            type: String,
            trim: true,
        },

        alt: {
            type: String,
            trim: true,
            maxlength: 200,
            required: [true, "Alt text is required"],
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        folder: {
            type: String,
            trim: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader is required"],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

// Indexes
mediaSchema.index({ uploadedBy: 1 });

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);

export default Media;
