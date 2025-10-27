import apiClient from "@infrastructure/api/apiClient";
import type { Playlist } from '@types/playlist';
import type { Music } from "@types/music";

type CreatePlaylistDto = {
    playlistName: string;
    discordId: string;
    playlistDescription?: string;
}

type AddMusicDto = {
    playlistId: number;
    url: string;
    title?: string;
}

function handleApiError(error: any): never {
    if (error?.response) {
        const status = error.response.status;
        const messages: Record<number, string> = {
            400: "잘못된 요청입니다. 입력값을 다시 확인해주세요.",
            401: "인증이 필요합니다. 다시 로그인해주세요.",
            403: "접근 권한이 없습니다.",
            404: "요청한 리소스를 찾을 수 없습니다.",
            409: "이미 존재하는 항목입니다.",
            500: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        };
        throw new Error(messages[status] ?? `알 수 없는 오류가 발생했습니다. (HTTP ${status})`);
    }
    if (error?.request) {
        throw new Error("서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.");
    }
    throw new Error(`요청 처리 중 오류가 발생했습니다: ${error?.message ?? "알 수 없는 오류"}`);
}

async function request<T>(fn: () => Promise<T>): Promise<T> {
    try{
        return await fn();
    } catch (error) {
        handleApiError(error);
    }
}

export const playlistRepository = {
    async getOne(playlistId: number): Promise<Playlist> {
        return request(async () => {
            const { data } = await apiClient.get(`/playlist/get/${playlistId}`)
            return data;
        });
    },

    async getPlaylistDiscordId(discordId: string): Promise<Playlist[]> {
        return request(async () => {
            const { data } = await apiClient.get(`/playlist/${discordId}`);
            return data;
        });
    },

    async createPlaylist(params: CreatePlaylistDto): Promise<Playlist> {
        return request(async () => {
            const { data } = await apiClient.post("/playlist/create", params);
            return data;
        });
    },

    async addMusic(params: AddMusicDto): Promise<Music> {
        return request(async () => {
            const { data } = await apiClient.post(`/playlist/${params.playlistId}/music/add`, params)
            return data as Music;
        });
    },

    async deletePlaylist(playlistId: number): Promise<void> {
        return request(async () => {
            await apiClient.delete(`/playlist/delete/${playlistId}`);
        });
    },
};