import { Client, Collection } from "discord.js";
import path from "path";
import fs from "fs";
import logger from "@core/logger";
import { getAllCommandfiles } from "@utils/getAllCommands";
import { config } from "@core/config/config";

export async function loadCommands(client: Client) {
    try {
        (client as any).commands = (client as any).commands || new Collection();
        const commandsPath = path.join(config.BASE_DIR, "dist", "interfaces", "commands");
        const commandFiles = getAllCommandfiles(commandsPath).filter(file => file.endsWith(".js"));

        logger.info(`Command directory path: ${commandsPath}`);
        logger.info(`Detected ${commandFiles.length} command files.`);

        for(const file of commandFiles) {
            const resolved = path.resolve(file);
            if (!fs.existsSync(resolved)) {
                logger.error(`Command file not found: ${resolved}`);
                continue;
            }

            try {
                const commandModule = require(resolved);
                const command = commandModule.default ?? commandModule;

                if(command?.data && command?.execute) {
                    (client as any).commands.set(command.data.name, command);
                    logger.info(`Registered command: /${command.data.name}`);
                } else {
                    logger.warn(`Invaild command structure in ${resolved}`);
                }
            } catch (error) {
                logger.error(`Failed to load command file ${resolved}: ${(error as Error).stack}`);
            }

            logger.info(`Successfully loaded ${(client as any).commands.size} commands.`);
        }
    } catch (error) {
        logger.error(`loadCommands failed: ${(error as Error).stack}`);
        throw error;
    }
}
