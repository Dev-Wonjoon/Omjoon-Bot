import dotenv from "dotenv";
import logger from "@core/logger";

import { client } from "@core/client";
import { config } from "@core/config";
import { musicManager } from "@core/musicManager";
import { registerInteractionCreate } from '@interfaces/interactions/interactionCreate.js';
import { loadCommands } from '@utils/loadCommands.js';

dotenv.config();

export async function createApp() {
    const TOKEN = config.DISCORD_TOKEN;

    registerInteractionCreate(client);

    client.on('error', (error) => {
        logger.error(`[Client Error]`, error);
    });

    client.once('clientReady', () => {
        logger.info("application starting...")
        const asciiArt =
        "  ____            _                     ____        _   \n" +
        " / __ \\          (_)                   |  _ \\      | |  \n" +
        "| |  | |_ __ ___  _  ___   ___  _ __   | |_) | ___ | |_ \n" +
        "| |  | | '_ ` _ \\| |/ _ \\ / _ \\| '_ \\  |  _ < / _ \\| __|\n" +
        "| |__| | | | | | | | (_) | (_) | | | | | |_) | (_) | |_ \n" +
        " \\____/|_| |_| |_| |\\___/ \\___/|_| |_| |____/ \\___/ \\__|\n" +
        "               _/ |                                    \n" +
        "              |__/                                     ";
        logger.info(asciiArt);
        musicManager.init(client.user!.id);
        logger.info(`${client.user?.tag} is Online.`);
    });

    try {
        await loadCommands(client);
        await client.login(TOKEN);
    } catch(err) {
        logger.error(`클라이언트 실행 실패: ${(err as Error).message}`);
    }

    return client;
}