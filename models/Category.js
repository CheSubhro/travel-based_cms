
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: [true, "Category slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        image: {
            url: {
                type: String,
            },

            publicId: {
                type: String,
            },

            alt: {
                type: String,
                trim: true,
            },
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