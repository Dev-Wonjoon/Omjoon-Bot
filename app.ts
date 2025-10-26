import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import dotenv from "dotenv";
import logger from "@core/logger";
import { registerInteractionCreate } from '@interfaces/interactions/interactionCreate';
import { loadCommands } from '@utils/loadCommands';

dotenv.config();

export async function createApp() {
    const TOKEN = process.env.DISCORD_TOKEN;
    if (!TOKEN) {
        logger.error("DISCORD TOKEN IS NULL.");
        process.exit(1);
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
        ],
    });

    client.commands = new Collection();

    const player = new Player(client);
    client.player = player;

    player.extractors.register(YoutubeiExtractor, {});

    registerInteractionCreate(client);

    player.events.on('error', (error) => {
        logger.error(`[Player Error] ${error}`);
    });

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