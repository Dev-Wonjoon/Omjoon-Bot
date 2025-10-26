import { playlistRepository } from "@infrastructure/repository/playlistRepository";
import type { Playlist, AddMusicParams } from "@infrastructure/repository/playlistRepository.js";

class PlaylistService {
    async create(playlistName: string, playlistDesc: string): Promise<Playlist> {
        try {
            return await playlistRepository.save(playlistName, playlistDesc);
        } catch(error: any) {
            throw new Error(`플레이리스트 생성 중 오류: ${error.message}`);
        }
    }

    async getAll(): Promise<Playlist[]> {
        try {
            return await playlistRepository.findAll();
        } catch(error: any) {
            throw error;
        }
    }

    async getOne(playlistId: number): Promise<Playlist> {
        try {
            return await playlistRepository.findByPlaylistId(playlistId);
        } catch(error: any) {
            throw error;
        }
    }

    async delete(playlistId: number): Promise<void> {
        try {
            await playlistRepository.delete(playlistId);
        } catch(error: any) {
            throw new Error(`플레이리스트 삭제 중 오류: ${error.message}`);
        }
    }

    async addMusic(params: AddMusicParams) {
        try {
            return await playlistRepository.addMusic(params);
        } catch(error: any) {
            throw new Error(`노래 추가 실패: ${error.message}`);
        }
    }
}

export const playlistService = new PlaylistService();