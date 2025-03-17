const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('노래섞기')
    .setDescription('현재 큐에 있는 노래 순서를 무작위로 바꿉니다.');

async function execute(interaction) {
    const queue = useQueue(interaction.guild);

    if(!queue) {
        return interaction.reply({ content: '현재 재생 중인 노래가 없습니다.', flags: MessageFlags.Ephemeral });
    }

    if (queue.tracks.size < 2) {
        return interaction.reply({ content: '섞기엔 대기열의 크기가 충분하지 않습니다.', flags: MessageFlags.Ephemeral });
    }

    queue.tracks.shuffle();

    return interaction.reply(`${queue.tracks.size}개의 노래 순서를 바꿨습니다.`);
}

module.exports = { data, execute };