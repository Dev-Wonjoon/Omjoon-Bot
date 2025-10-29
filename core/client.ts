import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'erela.js';

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
        player?: Player;
    }
}

client.commands = new Collection();