const ImmediateCommand = require('../ImmediateCommand');
const { createPlaylist } = require('../../api/playlist/createPlaylist');

class CreatePlaylistCommand extends ImmediateCommand {
    async run(interaction) {
        const discordId = interaction.user.id;
        const playlistName = interaction.options.getString('이름');
        await createPlaylist(discordId, playlistName);
        return `플레이리스트 **${playlistName}**(이)가 생성되었습니다.`;
    }

    getMessage() {
        return '플레이리스트 생성에 실패했습니다.';
    }
}

module.exports = new CreatePlaylistCommand;