import 'discord.js'
import { Player } from 'discord-player';
import { Collection } from 'discord.js';

declare module 'discord.js' {
    interface Client {
        player: Player;
        commands: Collection<string, any>;
    }
}