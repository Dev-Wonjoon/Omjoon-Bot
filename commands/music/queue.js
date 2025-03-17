const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('대기열')
    .setDescription('현재 재생 중인 노래 목록을 보여줍니다.');

async function execute(interaction) {
    const player = interaction.client.player;
    const queue = useQueue(interaction.guild);

    if(!queue || !queue.currentTrack) {
        return interaction.reply(
            '현재 재생중인 노래가 없습니다.'
        )
    }

    const currentTrack = queue.currentTrack;
    const upcomingTracks = queue.tracks.toArray();

    const message = [
        `**현재 재생중인 곡:** ${currentTrack.title}`,
        '',
        upcomingTracks.length > 0 ? '대기중인 곡:' : '대기중인 곡이 없습니다.',
        ...upcomingTracks.map((track, index) => `${index + 1}. ${track.title} - ${track.author}`)
    ].join('\n');

    return interaction.reply(message);

}

module.exports = { data, execute };


