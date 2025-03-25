const PlaylistRepository = require('../repository/music/playlistRepository');

class PlaylistService {
    constructor() {
        this.playlistRepository = new PlaylistRepository();
    }

    async createPlaylist(discordId, playlistName) {
        return this.playlistRepository.save(discordId, playlistName);
    }

    async listPlaylists(discordId) {
        return this.playlistRepository.findAll(discordId);
    }

    async getByPlaylistName(discordId, playlistName) {
        const playlist = await this.playlistRepository.findByPlaylistName(discordId, playlistName);
        if (!playlist) {
            throw new Error('해당 플레이리스트를 찾을 수 없습니다.');
        }
        return playlist;
    }

    async getByPlaylistId(discordId, playlistId) {
        const playlist = await this.playlistRepository.findById(discordId, playlistId);
        if (!playlist) {
            throw new Error('해당 플레이리스트를 찾을 수 없습니다.');
        }
        return playlist;
    }

    async deletePlaylist(discordId, playlistId) {
        const deleted = await this.playlistRepository.delete(discordId, playlistId);
        if (!deleted) {
            throw new Error('해당 플레이리스트를 찾을 수 없습니다.')
        }
        return deleted;
    }

    async addMusicToPlaylist(playlistId, title, url) {
        return this.playlistRepository.saveByMusic(playlistId, title, url);
    }
}

module.exports = PlaylistService;