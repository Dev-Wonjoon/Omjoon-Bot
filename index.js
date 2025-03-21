const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Player, useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { registerHandlers } = require('./registerHandler');

const client = new Client({ intents: [
	GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
] });

const player = new Player(client, {});

client.player = player;

useMainPlayer(player);

registerHandlers(client);

client.player.extractors.register(YoutubeiExtractor, {});

player.on('error', error => {
    console.error(`플레이어 에러 발생: ${error.message}`);
});

client.login(token);