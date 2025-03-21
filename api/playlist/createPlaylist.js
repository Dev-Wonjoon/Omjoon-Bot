const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.172:8080';

async function createPlaylist(discordId, playlistName) {
    try {
        const response = await axios.post(`${API_BASE_URL}/omjoon/api/playlist/create`, {
            discordId,
            playlistName: playlistName,
        });
        return response.data;
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        throw error;
    }
}

module.exports = { createPlaylist };