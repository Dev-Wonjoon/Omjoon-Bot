import { GatewayIntentBits, Client, Collection } from 'discord.js';
import { Player, useMainPlayer } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import dotenv from 'dotenv';
import { registerInteractionCreate } from './interactions/interactionCreate.js';
import { loadCommands } from './utils/loadCommands.js';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

client.commands = new Collection();
registerInteractionCreate(client);
const asciiArt =
  "  ____            _                     ____        _   \n" +
  " / __ \\          (_)                   |  _ \\      | |  \n" +
  "| |  | |_ __ ___  _  ___   ___  _ __   | |_) | ___ | |_ \n" +
  "| |  | | '_ ` _ \\| |/ _ \\ / _ \\| '_ \\  |  _ < / _ \\| __|\n" +
  "| |__| | | | | | | | (_) | (_) | | | | | |_) | (_) | |_ \n" +
  " \\____/|_| |_| |_| |\\___/ \\___/|_| |_| |____/ \\___/ \\__|\n" +
  "               _/ |                                    \n" +
  "              |__/                                     ";

const player = new Player(client);
client.player = player;

player.extractors.register(YoutubeiExtractor, {});


player.events.on('error', (error) => {
    console.error(`[Player Error] ${error}`)
});

client.on('error', (error) => {
    console.error('[Client Error]', error);
});

client.once('ready', () => {
    console.log(asciiArt);
    if (client.user) {
        console.log(`${client.user.tag} is Online.`);
    } else {
        console.error('Client user is null.');
    }
});

(async () => {
    await loadCommands(client);
    await client.login(TOKEN);
})();