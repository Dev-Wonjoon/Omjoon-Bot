import dotenv from "dotenv";
import { z, ZodError } from "zod";

dotenv.config();

const envSchema = z.object({
    DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is not set."),
    API_ROOT_URL: z.url("API_ROOT_URL is not a valid URL."),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Environment variable validation failed!");

    for (const issue of parsed.error.issues) {
        console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
}

export const ENV = parsed.data;