const apiClient = require('discord.js');

class PlaylistRepository {
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }

    async findById(discordId, playlistId) {
        const payload = {param: {discordId}};
        return this.apiClient.get(`/omjoon/api/playlist/get/${playlistId}`, payload);
    }

    async findByPlaylistName(discordId, playlistName) {
        const payload = { param: {discordId, playlistName} };
        return this.apiClient.get('/omjoon/api/playlist/get', payload);

    }

    async save(discordId, playlistName) {
        const payload = { discordId: parseInt(discordId), playlistName: playlistName };
        return this.apiClient.post('/omjoon/api/playlist/create', payload);
    }

    async delete(discordId, playlistId) {
        const payload = { param: { discordId } }
        return this.apiClient.delete(`/omjoon/api/playlist/delete/${playlistId}`, payload);
    }
}

module.exports = PlaylistRepository;