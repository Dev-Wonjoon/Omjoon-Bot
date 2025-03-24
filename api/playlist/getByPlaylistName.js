const axios = require('axios');
const { serverHost } = require('../../config.json');

const API_BASE_URL = serverHost;

module.exports = {
    async getByPlaylistName(discordId, playlistId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/omjoon/api/playlist/get`, {
                params: {
                    playlistId,
                    discordId,
                },
            });
            return response.data;
        } catch (error) {
            console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
            throw error;
        }
    },
};