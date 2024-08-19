const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('퐁!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};