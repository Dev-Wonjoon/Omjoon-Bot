const { Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

function registerHandlers(client) {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandDirs = fs.readdirSync(commandsPath);

    for(const dir of commandDirs) {
        const dirPath = path.join(commandsPath, dir);
        if(!fs.lstatSync(dirPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

        for(const file of commandFiles) {
            const filepath = path.join(dirPath, file);
            const command = require(filepath);
            if('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARMING] The command at ${filepath} is missing a required "data" or "execute" property.`);
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
}

module.exports = { registerHandlers };