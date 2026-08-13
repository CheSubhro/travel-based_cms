
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
	{
		title: {
		type: String,
		required: [true, "Blog title is required"],
		trim: true,
		minlength: [5, "Title must be at least 5 characters"],
		maxlength: [200, "Title cannot exceed 200 characters"],
		},

		slug: {
		type: String,
		required: [true, "Blog slug is required"],
		unique: true,
		lowercase: true,
		trim: true,
		match: [
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug can only contain lowercase letters, numbers and hyphens",
		],
		},

		excerpt: {
		type: String,
		trim: true,
		maxlength: [500, "Excerpt cannot exceed 500 characters"],
		},

		content: {
		type: String,
		required: [true, "Blog content is required"],
		minlength: [20, "Content must be at least 20 characters"],
		},

		featuredImage: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Media",
		},

		category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
		},

		tags: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Tag",
		},
		],

		author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		},

		status: {
		type: String,
		enum: {
			values: ["draft", "published", "archived"],
			message: "Invalid blog status",
		},
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

// Indexes
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ featured: 1 });

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;

