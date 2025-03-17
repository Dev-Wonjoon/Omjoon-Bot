const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('으하하')
        .setDescription('으하하하하하하하하하하하하하하하'),
    async execute(interaction) {
        await interaction.reply('으하하하하하하하하하하하하하하');
    },
};