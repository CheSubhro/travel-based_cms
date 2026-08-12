
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
            enum: ["image", "video", "raw"],
            default: "image",
        },

        format: {
            type: String,
            trim: true,
        },

        width: {
            type: Number,
        },

        height: {
            type: Number,
        },

        bytes: {
            type: Number,
        },

        originalName: {
            type: String,
            trim: true,
        },

        alt: {
            type: String,
            trim: true,
            maxlength: 200,
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
            required: true,
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

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);

export default Media;