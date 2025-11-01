import { Client, Guild, VoiceBasedChannel } from 'discord.js';
import { config } from '../config/config';
import { LavalinkManager, LavalinkNodeOptions, Track, Player } from 'lavalink-client'
import logger from '../logger';
import { registerEvents } from './events';
import { autoPlayFunction } from './autoplay';

export class MusicManager {
    private static instance: MusicManager | null = null;
    private manager: LavalinkManager;
    private autoPlayStates = new Map<string, boolean>();

    private constructor(private client: Client) {
        this.manager = new LavalinkManager({
            nodes: [
                {
                    id: "MainNode",
                    host: config.LAVALINK_HOST,
                    port: config.LAVALINK_PORT,
                    authorization: config.LAVALINK_PASSWORD,
                    secure: false,
                    retryDelay: 10_000,
                    retryAmount: 5,
                    closeOnError: true,
                } as LavalinkNodeOptions
            ],
            sendToShard: (guildId, payload) => {
                const guild = this.client.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            },
            client: {
                id: config.CLIENT_ID!,
                username: this.client.user?.username ?? "OmjoonBot"
            },
            autoSkip: true,
            autoMove: false,
            playerOptions: {
                
                volumeDecrementer: 0.75,
                defaultSearchPlatform: "ytsearch",
                onEmptyQueue: {
                    destroyAfterMs: config.AUTO_DISCONNECT_TIMEOUT,
                    autoPlayFunction: autoPlayFunction,
                },
                onDisconnect: {
                    autoReconnect: true,
                    destroyPlayer: true,
                }
            },
        });

        registerEvents(this.manager);
    }

    public static getInstance(client?: Client): MusicManager {
        if (!this.instance) {
            if (!client) throw new Error("MusicManager: first call must provide a Client");
            this.instance = new MusicManager(client)
            logger.info("MusicManager created.");
        }
        return this.instance;
    }

    public setAutoPlay(guildId: string, enabled: boolean) {
        this.autoPlayStates.set(guildId, enabled);
    }

    public getAutoPlay(guildId: string): boolean {
        return this.autoPlayStates.get(guildId) ?? false;
    }

    async init() {
        await this.manager.init({
            id: this.client.user?.id ?? "",
            username: this.client.user?.username ?? ""
        });
        logger.info("LavalinkManager Initialized");
    }

    async join(guild: Guild, channel: VoiceBasedChannel): Promise<Player> {
        const player = this.manager.createPlayer({
            guildId: guild.id,
            voiceChannelId: channel.id,
            selfDeaf: true
        });
        await player.connect();
        logger.info(`${guild.id} Joined voice channel.`);
        return player;
    }

    async play(guildId: string, query: string): Promise<void> {
        const player = this.manager.players.get(guildId);
        if (!player) throw new Error("Player not Found");

        const response = await player.search(query, { requester: guildId });
        if (!response.tracks.length) {
            logger.info(`[${guildId}] No tracks found`);
            return;
        }
        player.queue.add(response.tracks[0]);
        if (!player.playing) await player.play();
    }

    async leave(guildId: string): Promise<void> {
        const player = this.manager.players.get(guildId);
        if (player) {
            await player.destroy();
            logger.info(`[${guildId}] Left voice channel.`);
        }
    }

    public getPlayer(guildId: string): Player | undefined {
        return this.manager.players.get(guildId);
    }

    public sendRaw(data: any) {
        this.manager.sendRawData(data);
    }
}