
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            minlength: [2, "Category name must be at least 2 characters"],
            maxlength: [100, "Category name cannot exceed 100 characters"],
        },

        slug: {
            type: String,
            required: [true, "Category slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug can only contain lowercase letters, numbers and hyphens",
            ],
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
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

const Category =
    mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;