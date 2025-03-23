const { getPlaylist } = require('../../api/playlist/getPlaylist');

module.exports = async function(interaction) {
    const discordId = parseInt(interaction.user.id);
    try {
        const playlistName = interaction.options.getString('이름');
        const playlist = await getPlaylist(discordId, playlistName);
        if(!playlist) {
            return interaction.reply('해당 플레이리스트가 없습니다.');
        }
        const musicList = playlist.musicList;
        if(!musicList || musicList.length === 0) {
            return interaction.reply({ content: `해당 플레이리스트 **${playlistName}**에 노래가 없습니다.`});
        }
        const tracksFormatted = musicList.map((track, index) => `${index + 1}. ${track.title}`).join('\n');
        return interaction.reply({ content: `해당 플레이리스트 **${playlistName}** 에는 다음 곡들이 있습니다.\n${tracksFormatted}`});
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        return interaction.reply('플레이리스트 조회 중 오류가 발생했습니다.');
    }
};