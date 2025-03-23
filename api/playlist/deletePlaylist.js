const axios = require('axios');
const { serverHost } = require('../../config.json');

API_BASE_URL = serverHost;

async function deletePlaylist(discordId, playlistId) {

    try {
        const response = await axios.delete(`${API_BASE_URL}/omjoon/api/playlist/delete/${playlistId}`, { params: { discordId } });
        return response.data;
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        throw error;
    }
}

module.exports = { deletePlaylist };