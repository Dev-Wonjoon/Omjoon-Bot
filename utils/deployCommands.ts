import path from "path";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import logger from "@core/logger";
import { config } from "@core/config/config";
import { getAllCommandfiles } from "@utils/getAllCommands";

interface LoadedCommand {
    data: SlashCommandBuilder;
    execute: (...args: unknown[]) => unknown;
}

function collectCommandFiles(): string[] {
    const commandsDir = path.join(config.BASE_DIR, "dist", "interfaces", "commands");
    logger.info(`Scanning compiled commands under: ${commandsDir}`);
    return getAllCommandfiles(commandsDir).filter((file) => file.endsWith(".js"));
}

async function loadCommand(filePath: string): Promise<LoadedCommand | null> {
    try {
        const imported = await import(filePath);
        const command = (imported.default ?? imported) as Partial<LoadedCommand>;

        if (command && typeof command === "object" && command.data && command.execute) {
            return command as LoadedCommand;
        }

        logger.warn(`Skipped invalid command module: ${filePath}`);
        return null;
    } catch (error) {
        logger.error(`Failed to import command ${filePath}: ${(error as Error).message}`);
        return null;
    }
}

async function gatherCommandPayloads() {
    const files = collectCommandFiles();
    const payloads: any[] = [];

    for (const file of files) {
        const command = await loadCommand(file);
        if (command) {
            payloads.push(command.data.toJSON());
            logger.info(`Prepared command for deploy: /${command.data.name}`);
        }
    }

    return payloads;
}

export async function deployCommands() {
    try {
        const commands = await gatherCommandPayloads();
        const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

        await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: [] });
        logger.info(`Deploying ${commands.length} commands to Discord...`);
        await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
        logger.info(`Successfully deployed ${commands.length} commands.`);
    } catch (error) {
        logger.error(`Command deployment failed: ${(error as Error).message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    deployCommands();
}
