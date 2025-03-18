const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useQueue } = require('discord-player');
const { getVoiceConnection } = require('@discordjs/voice');

const data = new SlashCommandBuilder()
    .setName('나가기')
    .setDescription('큐를 비우고 음성 채널에서 나갑니다.');

async function execute(interaction) {
    const queue = useQueue(interaction.guild);
    const connection = getVoiceConnection(interaction.guild);

    if(!connection) {
        return interaction.reply({ content: "현재 음성 채널에 접속되어 있지 않습니다.", flags: MessageFlags.Ephemeral});
    }

    connection.destroy();
    queue.delete();
    
}

module.exports = { data, execute }