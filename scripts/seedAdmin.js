
import mongoose from "mongoose";
import { hashPassword } from "../lib/auth/password.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined");
        }

        const adminName = process.env.ADMIN_NAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminName || !adminEmail || !adminPassword) {
            throw new Error(
                "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required",
            );
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB connected");

        const existingAdmin = await User.findOne({
            email: adminEmail.toLowerCase(),
        });

        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        const hashedPassword = await hashPassword(adminPassword);

        await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: ROLES.ADMIN,
            isActive: true,
        });

        console.log("Admin user created successfully");
    } catch (error) {
        console.error("Admin seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();