import { Client, Guild, VoiceBasedChannel } from 'discord.js';
import { config } from './config';
import { LavalinkManager, LavalinkNodeOptions, Track, Player } from 'lavalink-client'
import logger from './logger';

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
                    retryDelay: 10e3,
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
                    autoPlayFunction: MusicManager.autoPlayFunction,
                },
                onDisconnect: {
                    autoReconnect: true,
                    destroyPlayer: true,
                }
            },
        });

        this.registerEvents();
    }

    public static getInstance(client: Client): MusicManager {
        if (!this.instance) {
            this.instance = new MusicManager(client);
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

    private registerEvents(): void {
        this.manager.on("trackStart", (player: Player, track: Track | null) => {
            if (!track) {
                logger.warn(`[${player.guildId}] Received null track on start`);
                return
            }
            logger.info(`[${player.guildId}] Playing: ${track?.info.title}`);
        });

        this.manager.on("queueEnd", (player: Player) => {
            logger.info(`[${player.guildId}] Queue ended.`);
        });

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

    static async autoPlayFunction(
        player: Player,
        lastTrack: Track,
    ): Promise<void> {
        try {
            if (!MusicManager.instance?.getAutoPlay(player.guildId)) return;

            const uri = lastTrack?.info.uri;
            if (!uri) return;
            const url = new URL(uri);
            const videoId = url.searchParams.get("v") || lastTrack.info.identifier;
            if (!videoId) return;

            const mixUrl = `https://www.youtube.com/watch?v=${videoId}&list=RD{videoId}`;
            const response = await player.search(mixUrl, { requester: "Autoplay" });
            logger.debug(
                `[${player.guildId}] Autoplay search: loadType=${response.loadType}, tracks=${response.tracks.length}`
            );

            let next = response.tracks.find(t => t.info.identifier !== videoId) ??
                null;

            if (!next) {
                const q = `${lastTrack.info.author ?? ""} ${lastTrack.info.title ?? ""}`.trim();
                if (!q) return;

                const fallback = await player.search(`ytsearch:${q}`, { requester: "Autoplay" });
                logger.debug(
                    `[${player.guildId}] Fallback search: loadType=${fallback.loadType}, tracks=${fallback.tracks.length}`
                );
                next = fallback.tracks.find(t => t.info.identifier !== videoId) ?? null;
            }

            if (!next) {
                logger.info(`[${player.guildId}] No related tracks found for autoplay`);
                return;
            }

            player.queue.add(next);
            if (!player.playing) await player.play();
            logger.info(`[${player.guildId}] Autoplay: ${next.info.title}`);
        } catch(error) {
            logger.error(`[${player.guildId}] Autoplay error: `, error);
        }
    }

    public getPlayer(guildId: string): Player | undefined {
        return this.manager.players.get(guildId);
    }

    public sendRaw(data: any) {
        this.manager.sendRawData(data);
    }
}