
import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tag name is required"],
            trim: true,
            maxlength: 50,
        },

        slug: {
            type: String,
            required: [true, "Tag slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
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

const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);

export default Tag;