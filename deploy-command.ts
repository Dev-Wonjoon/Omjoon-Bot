import { REST, Routes, SlashCommandBuilder } from "discord.js";
import config from "./config.json";
import fs from 'fs';
import path from 'path';

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    if('data' in command && 'execute' in command) {
        commands.push(command.data.toJson());
    }
}

const rest = new REST({ version: '10'}).setToken(config.token);

(async () => {
    try {
        console.log('슬래시 명령어를 Discord에 등록 중...');

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log('등록 완료');
    } catch(error) {
        console.error('등록 실패: ', error);
    }
})();

