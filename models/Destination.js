
import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Destination title is required"],
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: [true, "Destination slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
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
        url: {
          type: String,
          required: true,
        },

        alt: {
          type: String,
          trim: true,
        },
      },
    ],

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
  },
  {
    timestamps: true,
  },
);

const Destination =
  mongoose.models.Destination ||
  mongoose.model("Destination", destinationSchema);

export default Destination;