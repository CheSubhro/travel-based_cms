
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
        type: String,
        required: [true, "Blog title is required"],
        trim: true,
        maxlength: 200,
        },

        slug: {
        type: String,
        required: [true, "Blog slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
        },

        excerpt: {
        type: String,
        trim: true,
        maxlength: 500,
        },

        content: {
        type: String,
        required: [true, "Blog content is required"],
        },

        featuredImage: {
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

            width: {
                type: Number,
            },

            height: {
                type: Number,
            },
        },

        category: {
            type: String,
            trim: true,
        },

        tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
        ],

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
        },

        featured: {
        type: Boolean,
        default: false,
        },

        publishedAt: {
        type: Date,
        },

        seo: {
        metaTitle: {
            type: String,
            trim: true,
            maxlength: 160,
        },

        metaDescription: {
            type: String,
            trim: true,
            maxlength: 320,
        },

        keywords: [
            {
            type: String,
            trim: true,
            },
        ],
        },
    },
    {
        timestamps: true,
    },
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;