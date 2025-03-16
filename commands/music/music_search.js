const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('대기열')
    .setDescription('현재 재생 중인 노래 목록을 보여줍니다.');

async function execute(interaction) {
    const player = interaction.client.player;
    // 최신 discord-player(v7)에서는 player.nodes.get를 사용합니다.
    const queue = player.nodes.get(interaction.guild);

    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
        return interaction.reply('재생 중인 노래가 없습니다.');
    }

    const embed = new EmbedBuilder()
        .setTitle('현재 재생 중인 노래 목록')
        .setColor('Random');

    let description = '';

    if (queue.currentTrack) {
        description += `**현재 재생 중:** [${queue.currentTrack.title}](${queue.currentTrack.url})\n\n`;
    }

    if (queue.tracks.length > 0) {
        description += '**대기열:**\n';
        queue.tracks.forEach((track, index) => {
            description += `**${index + 1}.** [${track.title}](${track.url})\n`;
        });
    } else {
        description += '대기열이 비어있습니다.';
    }

    embed.setDescription(description);

    return interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };