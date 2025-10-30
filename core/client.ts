import { Client, GatewayIntentBits, Collection } from 'discord.js';

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

declare module 'discord.js' {
    interface Client {
        commands?: Collection<string, any>;
    }
}

client.commands = new Collection();
