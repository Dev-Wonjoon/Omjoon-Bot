import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllCommandfiles } from './getAllCommands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(client: Client) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandsFiles = getAllCommandfiles(commandsPath);

    for (const file of commandsFiles) {
        const commandModule = await import(`file://${file}`);
        const command = 'default' in commandModule ? commandModule.default : commandModule;

        if(command?.data && command?.data) {
            client.commands.set(command.data.name, command);
            console.log(`명령어 등록됨: /${command.data.name}`);
        } else {
            console.warn(`${file}는 유효한 명령어 구조가 아닙니다.`);
        }
    }
}