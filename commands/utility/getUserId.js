const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('내아이디')
    .setDescription('자신의 아이디 번호를 확인합니다.'),
    async execute(interaction) {
        return interaction.reply({content: `당신의 아이디는 **${interaction.user.id}** 입니다.`});
    },
};
