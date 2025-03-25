const apiClient = require('../../api/apiCall');

API_ROOT_URL = 'omjoon/api/'

class PlaylistRepository {
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }

    async findById(discordId, playlistId) {
        const payload = {param: {discordId}};
        return this.apiClient.get(`/playlist/get/${playlistId}`, payload);
    }

    async findByPlaylistName(discordId, playlistName) {
        const payload = { param: {discordId, playlistName} };
        return this.apiClient.get('/playlist/get', payload);

    }

    async findAll(discordId) {
        return this.apiClient.get(`/playlist/${discordId}`);
    }

    async save(discordId, playlistName) {
        const payload = { discordId: parseInt(discordId), playlistName: playlistName };
        return this.apiClient.post('/playlist/create', payload);
    }

    async delete(discordId, playlistId) {
        const payload = { param: { discordId } }
        return this.apiClient.delete(`/playlist/delete/${playlistId}`, payload);
    }

    async saveByMusic(playlistId, title, url) {
        const payload = { title: title, url: url }
        return this.apiClient.post(`/playlist/${playlistId}/music/add`, payload);
    }
}

module.exports = PlaylistRepository;