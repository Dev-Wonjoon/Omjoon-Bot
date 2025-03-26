import axios from 'axios';
import config from '../../config.json';
import { getDiscordId } from '../auth/discordId';

const apiClient = axios.create({
    baseURL: `${config.serverHost}${config.apiRootUrl}`,
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