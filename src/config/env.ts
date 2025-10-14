import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
});

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

export const config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DISCORD_TOKEN: requireEnv("DISCORD_TOKEN"),
    PORT: process.env.PORT || "3000",
    DATABASE_URL: process.env.DATABASE_URL || "",
};