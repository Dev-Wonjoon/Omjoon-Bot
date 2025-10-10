import axios from 'axios';
import { getDiscordId } from '../auth/discordId.js';

const API_HOST = process.env.SPRING_HOST;
const API_ROOT_URL = process.env.API_ROOT_URL;

const apiClient = axios.create({
    baseURL: `${API_HOST}${API_ROOT_URL}`,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    },
});

apiClient.interceptors.request.use((config) => {
    const id = getDiscordId();
    if(id) {
        config.headers['X-Discord-Id'] = id;
    }
    return config
})

export default apiClient;