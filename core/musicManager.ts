import { Manager, NodeOptions, Player, Track } from "erela.js";
import { client } from '@core/client';
import { config } from '@core/config';
import logger from '@core/logger';
import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";

let manager: Manager | null = null;

export class MusicManager {
    private static _instance: MusicManager;
    private _manager: Manager;

    private constructor() {
        const nodes: NodeOptions[] = [
            {
                identifier: "main",
                host: config.LAVALINK_HOST,
                port: config.LAVALINK_PORT,
                password: config.LAVALINK_PASSWORD,
                retryAmount: 5,
                retryDelay: 3000,
                secure: false
            },
        ];

        this._manager = new Manager({
            nodes,
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if(guild) guild.shard.send(payload);
            },
        });
        this.registerEvents();
    }

    public static get instance(): MusicManager {
        if (!MusicManager._instance) {
            MusicManager._instance = new MusicManager();
        }
        return this._instance;
    }

    public get players() {
        return this._manager.players;
    }

    private registerEvents(): void {
        const manager = this._manager;

        manager.on("nodeConnect", (node) => {
            logger.info(`[Lavalink] Connected to node: ${node.options.identifier}`);
        })

        manager.on("nodeError", (node, error) => {
            logger.error(`[Lavalink] Node ${node.options.identifier} error: ${error.message}`);
        });

        manager.on("trackStart", (player, track: Track) => {
            const channel = client.channels.cache.get(player.textChannel!);
            if (channel && (channel instanceof TextChannel || channel instanceof NewsChannel || channel instanceof ThreadChannel)) {
                channel.send(`Now Playing: **${track.title}**`);
            }
            logger.info(`[Player] Started playing: ${track.title}`);
        });

        manager.on("queueEnd", (player) => {
            const channel = client.channels.cache.get(player.textChannel!);
            if (channel && (channel instanceof TextChannel || channel instanceof NewsChannel || channel instanceof ThreadChannel)) {
                channel.send(`Queue has ended`);
            }
            
            const timeout = setTimeout(() => {
                if(!player.queue.size && !player.playing) {
                    player.destroy();
                }
            }, 120 * 1000);

            const onTrackAdd = () => {
                clearTimeout(timeout);
                logger.debug(`[Player] New Track added.`);
                player.off("trackAdd", onTrackAdd);
            };

            player.on("trackAdd", onTrackAdd);

        });

        manager.on("trackEnd", async (player, track) => {
            if(!(player as any).autoplay) return;

            try{
                const related = await manager.search(`${track.title} related`, track.requester)

                if(!related.tracks.length) {
                    logger.warn(`[AutoPlay] No related tracks found for ${track.title}`);
                    return
                }

                const nextTrack = related.tracks[0];
                player.queue.add(nextTrack);

                const channel = client.channels.cache.get(player.textChannel!);
                if (channel && "send" in channel) {
                    channel.send(`**AutoPlay:** 다음 곡 재생 - ${nextTrack.title}`);
                }

                if(!player.playing) player.play();
            } catch (error) {
                logger.error(`[AutoPlay Error] ${(error as Error).message}`);
            }
        });

    }

    public init(clientId: string): void {
        this._manager.init(clientId);
        logger.info(`[Lavalink] Manager initialized for client: ${clientId}`);
    }

    public createPlayer(guildId: string, voiceChannel: string, textChannel: string) {
        return this._manager.create({
            guild: guildId,
            voiceChannel,
            textChannel
        });
    }

    public async searchTrack(query: string, user: any) {
        return this._manager.search(query, user);
    }
}

export const musicManager = MusicManager.instance;