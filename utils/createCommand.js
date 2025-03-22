const { createPlaylist } = require('../api/playlist/createPlaylist');

module.exports = async function(interaction) {
    const discordId = interaction.user.id;
    const playlistName = interaction.options.getString('이름');
    await createPlaylist(discordId, playlistName);
    return interaction.reply(`플레이리스트 **${playlistName}** (이)가 생성되었습니다.`);
};