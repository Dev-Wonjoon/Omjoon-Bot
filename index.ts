import { GatewayIntentBits, Client, Collection } from 'discord.js';
import { Player, useMainPlayer } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import config from './config.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

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

useMainPlayer(player);

player.extractors.register(YoutubeiExtractor, {});


player.events.on('error', (error) => {
    console.error(`discord player 에러 발생: ${error}`)
});

client.once('ready', () => {
    console.log(asciiArt);
    console.log(`${client.user.tag} is Online.`);
});

client.login(config.token);