const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Player, useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { registerHandlers } = require('./registerHandler')

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildMessages,
] });

const player = new Player(client, {
	nodeOptions: {
		bufferingTimeout: 15000,
		leaveOnStop: true,
		leaveOnStopCooldown: 180000,
		leaveOnEnd: true,
		leaveOnEndCooldown: 180000,
		leaveOnEmpty: true,
		leaveOnEmptyCooldown: 5000,
	}
});

client.player = player;
useMainPlayer(player);

registerHandlers(client);

client.player.extractors.register(YoutubeiExtractor, {});

client.login(token);