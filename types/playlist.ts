import type { Music } from './music';

export interface Playlist {
    id: number;
    discordId: string;
    playlistName: string;
    description?: string;
    music: Music[];
}