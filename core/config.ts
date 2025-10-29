import z from 'zod';
import dotenv from 'dotenv';
import path from 'path';

const baseDir = path.resolve();

dotenv.config({ path: path.resolve(process.cwd(), '.env')});

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
    CLIENT_ID: z.string().min(1, 'CLIENT_ID is required'),
    API_HOST: z.string().default('http://localhost:3000'),
    API_ROOT_URL: z.string().default('/api'),
    LAVALINK_HOST: z.string().default('localhost'),
    LAVALINK_PORT: z.coerce.number().default(2333),
    LAVALINK_PASSWORD: z.string().default('password'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    AUTO_DISCONNECT_TIMEOUT: z.coerce.number().default(120000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invaild environment variables: ');
    const tree = z.treeifyError(parsedEnv.error);
    console.error(tree);
    process.exit(1);
}


export const config = {
    ...parsedEnv.data,
    BASE_DIR: baseDir
}