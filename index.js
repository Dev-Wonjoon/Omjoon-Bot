const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Player, useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { registerHandlers } = require('./registerHandler');

const container = require('./container');
const apiClient = require('./api/apiCall');
const InteractionCreate = require('./events/interactionCreate');


const asciiArt =
  "  ____            _                     ____        _   \n" +
  " / __ \\          (_)                   |  _ \\      | |  \n" +
  "| |  | |_ __ ___  _  ___   ___  _ __   | |_) | ___ | |_ \n" +
  "| |  | | '_ ` _ \\| |/ _ \\ / _ \\| '_ \\  |  _ < / _ \\| __|\n" +
  "| |__| | | | | | | | (_) | (_) | | | | | |_) | (_) | |_ \n" +
  " \\____/|_| |_| |_| |\\___/ \\___/|_| |_| |____/ \\___/ \\__|\n" +
  "               _/ |                                    \n" +
  "              |__/                                     ";


container.register('token', () => token);
container.register('apiClient', () => apiClient);

container.register('client', () =>
    new Client({ intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        ]
    })
);

container.register('player', c => {
    const client = c.resolve('client');
    const player = new Player(client);
    useMainPlayer(player);
    player.extractors.register(YoutubeiExtractor);
    return player
})

container.registerClass(InteractionCreate);

(async () => {
    const client = container.resolve('client');
    client.player = container.resolve('player');

    client.once('ready', () => {
        console.log(asciiArt);
        console.log(`${client.user.tag} is Online`)
    });

    client.on('interactionCreate', interaction =>
        container.resolve('InteractionCreate').execute(interaction)
    );

    await client.login(container.resolve('token'));
})();