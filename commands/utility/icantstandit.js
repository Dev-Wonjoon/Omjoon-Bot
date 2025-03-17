const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('못참겠다')
        .setDescription('나 못 참겠다!!!!!!!!!!!!!!!'),
    async execute(interaction) {
        await interaction.reply('못 참겠다!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    },
};