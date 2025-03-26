import apiClient from '../api/apiClient';

export interface Playlist {
    id: number;
    discordId: string;
    playlistName: string;
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

class PlaylistRepository {
    async save(playlistName: string): Promise<Playlist> {
        const response = await apiClient.post('/playlist/create', playlistName);
        return response.data;
    }

    async findAll(): Promise<Playlist[]> {
        const response = await apiClient.get('/playlist/me');
        return response.data;
    }

    async findByPlaylistId(playlistId: number): Promise<Playlist> {
        try {
            const response = await apiClient.get(`/playlist/get/${playlistId}`)
            return response.data;
        } catch(error: any) {
            if(error.response?.status === 403) {
                throw new Error('해당 플레이리스트에 접근할 권한이 없습니다.');
            } else if (error.response?.status === 404) {
                throw new Error('해당 플레이리스트를 찾을 수 없습니다.');
            } else {
                throw new Error('알 수 없는 오류가 발생 했습니다.');
            }
        }
    }

    async delete(playlistId: number): Promise<void> {
        await apiClient.delete(`/playlist/delete/${playlistId}`);
    }

    async addMusic({ playlistId, title, url }: AddMusicParams): Promise<Music> {
        const response = await apiClient.post(`/playlist/${playlistId}/music/add`, {
            title,
            url
        });
        return response.data;
    }
}

export const playlistRepository = new PlaylistRepository();