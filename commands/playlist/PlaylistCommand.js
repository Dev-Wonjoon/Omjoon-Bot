const { buildPlaylistSelectMenu } = require('../../helpers/buildPlaylistSelectMenu');
const ImmediateCommand = require('../../core/ImmediateCommand');



class PlaylistCommand extends ImmediateCommand {
    constructor({ playlistService, player }) {
        super();
        this.playlistService = playlistService;
        this.player = player;
        this.ephemeral = true
    }

    async run(interaction) {
        const discordId = parseInt(interaction.user.id);
        const sub = interaction.options.getSubcommand();

        switch(sub) {
            case '생성': {
                const playlistName = interaction.options.getString('이름');
                await this.playlistService.createPlaylist(discordId, playlistName);
                return `플레이리스트 **${playlistName}** 생성 완료`;
            }

            case '목록': {
                const list = await this.playlistService.listPlaylists(discordId);
                if (!list.length) return '생성된 플레이리스트가 없습니다.';
                return buildPlaylistSelectMenu(list);
            }
        }
    }
}

module.exports = PlaylistCommand;