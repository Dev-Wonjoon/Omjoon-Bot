import { Client, Collection } from "discord.js";

export {};
export interface Command {
    data: {
        name: string;
    };
    execute: Function;
    autocomplete?: (...args: any[]) => Promise<void>;
}

export interface ClientWithCommands extends Client {
    commands?: Collection<string, Command>;
}