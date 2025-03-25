const { serverHost } = require('../../config.json');
const apiClient = require('../apiCall');

const API_BASE_URL = serverHost;

async function addMusicToPlaylist(playlistId, title, url) {
    try {
        const payload = { title: title, url: url }
        const response = await apiClient.post(`/omjoon/api/playlist/${playlistId}/music/add`, payload);
        return response;
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error.message);
        throw error;
    }
}

module.exports = { addMusicToPlaylist };