const apiClient = require('../apiCall');
const { serverHost } = require('../../config.json');

const API_BASE_URL = serverHost;

async function createPlaylist(discordId, playlistName) {
    try {
        const payload = { discordId: parseInt(discordId), playlistName: playlistName };

        const response = await apiClient.post('/omjoon/api/playlist/create', payload);
        return response;
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        throw error;
    }
    
}

module.exports = { createPlaylist };