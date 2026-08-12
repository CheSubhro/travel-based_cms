
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;