const { getAllPlaylist } = require('../../api/playlist/getAllPlaylist');
const { EmbedBuilder } = require('discord.js');

module.exports = async function(interaction) {
    const discordId = parseInt(interaction.user.id);
    try {
        const playlists = await getAllPlaylist(discordId);
        if(!playlists || playlists.length === 0) {
            return interaction.reply('생성된 플레이리스트가 없습니다.');
        }
        
        const playlistsDescription = playlists.map((playlist, index) => `**${index + 1}.** ${playlist.playlistName}`);

        const embed = new EmbedBuilder()
            .setTitle('플레이리스트 목록')
            .setDescription(playlistsDescription.join('\n'))
            .setColor('#0099ff')
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        return interaction.reply('플레이리스트 목록을 불러오는 중 오류가 발생했습니다.');
    }
};