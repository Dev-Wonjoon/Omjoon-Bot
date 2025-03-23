const { addMusicToPlaylist } = require('../../api/playlist/addMusicToPlaylist');
const { getPlaylist } = require('../../api/playlist/getPlaylist');
const { sendSelectionMenu } = require('../../helpers/playlist/selectTrack');

module.exports = async function(interaction) {
    const discordId = parseInt(interaction.user.id);
    const playlistName = interaction.options.getString('플레이리스트');
    const musicTitle = interaction.options.getString('노래제목');
    
    let playlist;
    try {
        playlist = await getPlaylist(discordId, playlistName);
        if (!playlist) {
            return interaction.reply({content: `플레이리스트 **${playlistName}** 이(가) 없습니다.`});
        }
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        return interaction.reply({content: '플레이리스트 조회 중 오류가 발생했습니다.'});
    }

    await interaction.deferReply();

    const player = interaction.client.player;
    let searchResult;
    try {
        searchResult = await player.search(musicTitle, { requestedBy: interaction.user });
        if(searchResult.loadType === 'NO_MATCHES') {
            return interaction.followUp({content: '검색 결과가 없습니다.'});
        }
    } catch(error) {
        console.error('노래 검색 중 오류가 발생했습니다.', error);
        return interaction.followUp({content: '노래 검색 중 오류가 발생했습니다.'});
    }

    const tracks = searchResult.tracks.slice(0, 5);
    let selectedTrack;
    try {
        selectedTrack = await sendSelectionMenu(interaction, tracks);
        if(!selectedTrack) {
            return interaction.followUp({content: '시간이 초과 되었거나 선택한 노래가 없습니다.'});
        }
    } catch(error) {
        console.error('노래 선택 중 오류가 발생했습니다.', error);
        return interaction.followUp({content: '노래 선택 중 오류가 발생했습니다.'});
    }

    try {
        await addMusicToPlaylist(playlist.id, selectedTrack.title, selectedTrack.url);
        
        return interaction.followUp({content: `플레이리스트 **${playlistName}** 에 노래 **${selectedTrack.title}** 을(를) 추가했습니다.`});
    } catch(error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        return interaction.followUp({content: '노래 추가 중 오류가 발생했습니다.'});
    }
};