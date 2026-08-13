
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
    if (!password) {
        throw new Error("Password is required");
    }

    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        return false;
    }

    return bcrypt.compare(password, hashedPassword);
};