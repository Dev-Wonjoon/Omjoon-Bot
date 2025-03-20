const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useQueue } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('나가기')
    .setDescription('큐를 비우고 음성 채널에서 나갑니다.');

async function execute(interaction) {
    const queue = useQueue(interaction.guild);
    const connection = interaction.member.voice.channel;

    if(!connection) {
        return interaction.reply({ content: "현재 음성 채널에 접속되어 있지 않습니다.", flags: MessageFlags.Ephemeral});
    }

    connection.destroy();
    queue.delete();

    return interaction.reply({ content: "음성 채널에서 나갔습니다.", flags: MessageFlags.Ephemeral});
    
}

module.exports = { data, execute }