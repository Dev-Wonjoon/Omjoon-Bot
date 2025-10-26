import apiClient from '@infrastructure/api/apiClient';

export interface Playlist {
    id: number;
    discordId: string;
    playlistName: string;
    description: string;
    music: Music[]
}

export interface Music {
    playlistId: number;
    title: string;
    url: string;
    isActive: boolean;
}

export interface AddMusicParams {
    playlistId: number
    title: string;
    url: string;
}

export interface CreatePlaylistParams {
    discordId: number;
    playlistName: string;
    description?: string;
}

export interface DeletePlaylistParams {
    discordId: number;
    playlistId: number;
}

function handleApiError(error: any): never {
    if(error?.response) {
        const status = error.response.status;

        switch (status) {
            case 400:
                throw new Error('잘못된 요청입니다. 입력값을 확인해주세요.');
            case 401:
                throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
            case 403:
                throw new Error('접근 권한이 없습니다.');
            case 404:
                throw new Error('요청한 리소스를 찾을 수 없습니다.');
            case 409:
                throw new Error('이미 존재하는 항목입니다.');
            case 500:
                throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            default:
                throw new Error(`알 수 없는 오류가 발생했습니다. (HTTP ${status})`);
        }
    } else if (error?.request) {
        throw new Error('서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.');
    } else {
        throw new Error(`요청 처리 중 오류가 발생했습니다: ${error.message}`);
    }
}

export const playlistApi = {
    async getMyPlaylists(discordId: string): Promise<Playlist[]> {
        try {
            const response = await apiClient.get(`/playlist/${discordId}`);
            return response.data;
        } catch(error) {
            handleApiError(error);
        }
    },

    async createPlaylist(params: CreatePlaylistParams): Promise<Playlist> {
        try{
            const response = await apiClient.post('/playlist/create', params);
            return response.data;
        } catch(error) {
            handleApiError(error);
        }
    },

    async addMusic(params: AddMusicParams): Promise<Music> {
        try{
            const response = await apiClient.post('/playlist/')
        }
    }

};