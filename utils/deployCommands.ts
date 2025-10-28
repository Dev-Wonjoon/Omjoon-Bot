import { REST, Routes } from 'discord.js';
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import logger from '@core/logger';
config();

(async () => {
    try {
        const commands: any[] = [];
        const commandsPath = path.join(process.cwd(), "dist", "interfaces", "commands");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
        for (const file of commandFiles) {
            try {
                const command = await import(path.join(commandsPath, file));
                if("data" in command.default && "execute" in command.default) {
                    commands.push(command.default.data.toJSON());
                    logger.info(`Loaded command: /${command.default.data.name}`);
                } else {
                logger.warn(`Skipped invaild command file: ${file}`);
                }
            } catch(error) {
                logger.error(`Failed to import ${file}: ${(error as Error).message}`);
            }
        }
        const rest = new REST({ version: "10"}).setToken(process.env.DISCORD_TOKEN!);

        logger.info(`Deploying ${commands.length} command to Discord...`);

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_TOKEN!),
            { body: commands },
        );

        logger.info(`Successfully deployed ${commands.length} commands`);
    } catch (error) {
        logger.error(`Command deployment failed: ${(error as Error).message}`);
    }
})();