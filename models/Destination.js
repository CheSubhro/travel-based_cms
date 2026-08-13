
import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Destination title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"],
        },

        slug: {
            type: String,
            required: [true, "Destination slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug can only contain lowercase letters, numbers and hyphens",
            ],
        },

        shortDescription: {
            type: String,
            required: [true, "Short description is required"],
            trim: true,
            minlength: [10, "Short description must be at least 10 characters"],
            maxlength: [300, "Short description cannot exceed 300 characters"],
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            minlength: [20, "Description must be at least 20 characters"],
        },

        location: {
            country: {
                type: String,
                trim: true,
            },

            state: {
                type: String,
                trim: true,
            },

            city: {
                type: String,
                trim: true,
            },

            address: {
                type: String,
                trim: true,
            },
        },
        images: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Media",
            },
        ],

        featuredImage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
        },

        featured: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
    },
    {
        timestamps: true,
    },
);

// Indexes
destinationSchema.index({ status: 1 });
destinationSchema.index({ featured: 1 });

const Destination =
  mongoose.models.Destination ||
  mongoose.model("Destination", destinationSchema);

export default Destination;

