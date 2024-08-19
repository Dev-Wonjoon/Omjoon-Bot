const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('크아악')
        .setDescription('크아아아아아아아아아아악'),
    async execute(interaction) {
        await interaction.reply('크아아아아아아아아아아아아아악');
    },
};