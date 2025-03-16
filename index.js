const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs')
const path = require('node:path')
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');


const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildMessages,
] });


client.commands = new Collection();
client.player = new Player(client, {
	leaveOnEmpty: false,
	leaveOnEnd: false,
	leaveOnStop: false,
	connectionTimeout: 300000,
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
client.player.extractors.register(YoutubeiExtractor, {});

client.login(token);