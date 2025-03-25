const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Player, useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { registerHandlers } = require('./registerHandler');

const container = require('./container');
const apiClient = require('./api/apiCall');

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

container.register()

(async () => {
    const client = container.resolve('client');
    client.player = container.resolve('player');

    client.once('ready', () =>
      console.log(`${client.user.tag} is Online`)  
    );

    client.on('interactionCreate', interaction =>
        container.resolve('InteractionCreate').execute(interaction)
    );

    await client.login(container.resolve('token'));
})();