const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.172:8080';

async function getAllPlaylist(discordId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/omjoon/api/playlist/${discordId}`, {
            params: {
                discordId,
            },
        });
        return response.data;
    } catch (error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        throw error;
    }
};

module.exports = { getAllPlaylist };