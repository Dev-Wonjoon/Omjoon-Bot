const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('대기열')
    .setDescription('현재 재생 중인 노래 목록을 보여줍니다.');

async function execute(interaction) {
    const player = interaction.client.player;
    // 최신 discord-player v7 기준 큐 가져오기
    const queue = player.nodes.get(interaction.guild);

    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
        return interaction.reply('재생 중인 노래가 없습니다.');
    }

    // description 변수를 미리 선언합니다.
    let description = '';

    // 현재 재생 중인 노래가 있으면 추가
    if (queue.currentTrack) {
        description += `**현재 재생 중:** [${queue.currentTrack.title}](${queue.currentTrack.url})\n\n`;
    }

    // 대기열(트랙 목록) 표시
    if (queue.tracks.length > 0) {
        description += '**대기열:**\n';
        queue.tracks.forEach((track, index) => {
            description += `**${index + 1}.** [${track.title}](${track.url})\n`;
        });
    } else {
        description += '대기열이 비어있습니다.';
    }

    const embed = new EmbedBuilder()
        .setTitle('현재 재생 중인 노래 목록')
        .setDescription(description)
        .setColor('Random');

    return interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
