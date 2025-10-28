import { Client } from "discord.js";
import path from "path";
import fs from "fs";
import logger from "@core/logger";
import { getAllCommandfiles } from "@utils/getAllCommands";
import { BASE_DIR } from "@core/constants";

export async function loadCommands(client: Client) {
    try {
        const commandsPath = path.join(BASE_DIR, "dist", "interfaces", "commands");
        const commandFiles = getAllCommandfiles(commandsPath).filter(file => file.endsWith(".js"));

        logger.info(`Command directory path: ${commandsPath}`);
        logger.info(`Detected ${commandFiles.length} command files.`);

        for (const file of commandFiles) {
            const resolved = path.resolve(file);
            if (!fs.existsSync(resolved)) {
                logger.error(`Command file not found: ${resolved}`);
                continue;
            }

            try {
                const commandModule = require(resolved); // ✅ CJS require
                const command = commandModule.default ?? commandModule;

                if (command?.data && command?.execute) {
                    client.commands.set(command.data.name, command);
                    logger.info(`Registered command: /${command.data.name}`);
                } else {
                    logger.warn(`Invalid command structure in ${resolved}`);
                }
            } catch (err) {
                logger.error(`Failed to load command file ${resolved}: ${(err as Error).stack}`);
            }
        }

        logger.info(`Successfully loaded ${client.commands.size} commands.`);
    } catch (err) {
        logger.error(`loadCommands failed: ${(err as Error).stack}`);
        throw err;
    }
}
