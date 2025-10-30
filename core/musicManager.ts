import { Client, GuildMember, VoiceBasedChannel, ChannelType } from 'discord.js';
import { Shoukaku, Player, Connectors } from 'shoukaku';
import logger from '@core/logger';
import { client } from '@core/client';
import { config } from '@core/config';

interface LavalinkNodeOptions {
    name: string;
    url: string;
    auth: string;
}

interface QueueItem {
    encoded: string;
    info: {
        title: string;
        uri?: string;
        author: string;
        length: number;
    }
}

export class MusicManager {
    private readonly shoukaku: Shoukaku;
    private players: Map<string, Player>;
    private queues: Map<string, QueueItem[]>;

    constructor(client: Client, lavalinkNodes: LavalinkNodeOptions[]) {

        this.shoukaku = new Shoukaku(
            new Connectors.DiscordJS(client),
            lavalinkNodes.map(node => ({
                name: node.name,
                url: node.url,
                auth: node.auth,
            })),
            {
                resume: true,
                reconnectTries: 3,
                resumeTimeout: 60,
            }
        );

        this.players = new Map();
        this.queues = new Map();

        this.registerEvents();
    }

    private registerEvents() {
        this.shoukaku.on('ready', (name: string) => {
            console.log(`[Shoukaku] Node "${name}" is ready`);
        });

        this.shoukaku.on('error', (name: string, error: Error) => {
            console.error(`[Shoukaku] Node "${name}" error:`, error);
        });

        this.shoukaku.on('close', (name: string, code: number, reason: string) => {
            console.warn(`[Shoukaku] Node "${name}" closed: [${code}] ${reason}`);
        });

        this.shoukaku.on('debug', (name: string, info: string) => {
            console.debug(`[Shoukaku:Debug] ${name}: ${info}`);
        });
    }

    public getQueue(guildId: string): QueueItem[] {
        return this.queues.get(guildId) || [];
    }

    public getPlayer(guildId: string): Player | undefined {
        return this.players.get(guildId);
    }

    public setQueue(guildId: string, queue: QueueItem[]): void {
        this.queues.set(guildId, queue);
    }

    public clearQueue(guildId: string): void {
        this.queues.set(guildId, []);
    }

    public async joinChannel(member: GuildMember, channel: VoiceBasedChannel) {
        const nodeList = Array.from(this.shoukaku.nodes.values());
        if (nodeList.length === 0) throw new Error('No Lavalink node available');
        const guildId = channel.guild.id;
        const existingPlayer = this.players.get(guildId);
        if (existingPlayer) {
            const existingConnection = this.shoukaku.connections.get(guildId);
            if (existingConnection?.channelId === channel.id) {
                return existingPlayer;
            }
        }

        const player = await this.shoukaku.joinVoiceChannel({
            guildId,
            channelId: channel.id,
            shardId: channel.guild.shardId,
            deaf: true,
        });

        this.players.set(guildId, player);
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, []);
        }

        if (channel.type === ChannelType.GuildStageVoice) {
            const me = channel.guild.members.me;
            const voice = me?.voice;
            if (voice) {
                try {
                    if (voice.suppress) {
                        await voice.setSuppressed(false);
                    }
                } catch (error) {
                    logger.warn(`Failed to unsuppress bot in stage channel ${channel.id}:`, error);
                }

                if (voice.suppress) {
                    try {
                        await voice.setRequestToSpeak(true);
                    } catch (error) {
                        logger.warn(`Failed to request to speak in stage channel ${channel.id}:`, error);
                    }
                }
            }
        }
        return player;
    }

    public async play(guildId: string, query: string) {
        const player = this.players.get(guildId);
        if (!player) throw new Error('No active player in this guild.');

        const node = player.node;
        const result = await node.rest.resolve(query);

        if (!result) throw new Error('No result returned from Lavalink');

        if (result.loadType === 'error' || result.loadType === 'empty') {
            throw new Error('No tracks found for this query.');
        }

        let track;
        if (result.loadType === 'track') {
            track = result.data;
        } else if (result.loadType === 'playlist') {
            track = result.data.tracks[0];
        } else if (result.loadType === 'search') {
            track = result.data[0];
        } else {
            throw new Error('Unsupported load type.');
        }

        await player.playTrack({ track: { encoded: track.encoded } });
        logger.info(`Now playing: ${track.info.title}`);

        return track.info;
    }

    public async skip(guildId: string) {
        const player = this.players.get(guildId);
        const queue = this.queues.get(guildId);
        if (!player || !queue) throw new Error('No active player or queue');
        await player.stopTrack();

        const next = queue.shift();
        if(next) {
            await player.playTrack({ track: { encoded: next.encoded }});
            logger.info(`Skipped to next: ${next.info.title}`);
            return `Skipped to **${next.info.title}**`;
        } else {
            logger.info(`Queue empty, stopping`);
            return `No more songs in queue.`;
        }
    }

    public async pause(guildId: string) {
        const player = this.players.get(guildId);
        if (!player) throw new Error('No active player.');
        await player.setPaused(true);
    }

    public async resume(guildId: string) {
        const player = this.players.get(guildId);
        if (!player) throw new Error('No active player.');
        await player.setPaused(false);
    }

    public async leave(guildId: string) {
        const player = this.players.get(guildId);
        if (!player) return;
        await this.shoukaku.leaveVoiceChannel(guildId);
        await player.destroy();
        
        this.players.delete(guildId);
        this.queues.delete(guildId);
        logger.info(`Left voice channel in guild ${guildId}`);
    }
}

const lavalinkNodes: LavalinkNodeOptions[] = [
    {
        name: 'default',
        url: `${config.LAVALINK_HOST}:${config.LAVALINK_PORT}`,
        auth: config.LAVALINK_PASSWORD,
    },
];

export const musicManager = new MusicManager(client, lavalinkNodes);
