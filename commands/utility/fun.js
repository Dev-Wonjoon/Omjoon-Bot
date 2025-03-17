const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('재밌지않습니까')
        .setDescription('재밌지않습니까!!!!!!!!!!!'),
    async execute(interaction) {
        await interaction.reply('재밌지 않습니까!!!!!!!!!!!!!!!!!');
    },
};