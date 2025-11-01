import { Player, Track } from 'lavalink-client';
import logger from '@core/logger';
import type { LavalinkManager, LavalinkNode } from 'lavalink-client';

export function registerEvents(manager: LavalinkManager) {
    manager.on("trackStart", (player: Player, track: Track | null) => {
        if(!track) return logger.warn(`[${player.guildId}] null track`);
        logger.info(`[${player.guildId}] Playing: ${track.info.title}`);
    });

    manager.on("queueEnd", (player: Player)=> {
        logger.info(`[${player.guildId}] Queue ended.`);
    });

    manager.nodeManager.on("disconnect", (node: LavalinkNode, reason) => {
        logger.warn(`[Node] Disconnected: ${node.id}, reason=${String(reason)}`);
    });

    manager.nodeManager.on("reconnecting", (node: LavalinkNode) => {
        logger.info(`[Node] Reconnecting: ${node.id}`);
    });

    manager.nodeManager.on("error", (node: LavalinkNode, error: unknown) => {
        logger.error(`[Node] Error: ${node.id}`, error);
    });;


}