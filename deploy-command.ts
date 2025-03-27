import { REST, Routes } from "discord.js";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import { getAllCommandfiles } from "./src/utils/getAllCommands";

dotenv.config();
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = getAllCommandfiles(commandsPath)

for (const file of commandFiles) {
    const command = await import(`file://${file}`);
  
    const c = 'default' in command ? command.default : command;
  
    if (c && typeof c === 'object' && 'data' in c && 'execute' in c) {
      commands.push(c.data.toJSON());
    } else {
      console.warn(`${file} 은 유효한 명령어가 아닙니다.`);
    }
}

if (!TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined in the environment variables.');
}
if (!CLIENT_ID) {
    throw new Error('CLIENT_ID is not defined in the environment variables.');
}
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`슬래시 명령어를 Discord에 등록 중... ${commands.length}개`);

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log('등록 완료');
    } catch(error) {
        console.error('등록 실패: ', error);
    }
})();

