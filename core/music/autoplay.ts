import logger from "@core/logger";
import { Player, Track } from "lavalink-client";

export async function autoPlayFunction(player: Player, lastTrack: Track): Promise<void> {
    try {
        const uri = lastTrack?.info.uri;
        const id = (() => {
            try { const url = new URL(uri!); return url.searchParams.get('v') || lastTrack.info.identifier; }
            catch { return lastTrack.info.identifier; }
        })();

        if(!id) return;

        const mix = await player.search(`https://www.youtube.com/watch?v=${id}&list=RD${id}`, { requester: "Autoplay" });
        let next = mix.tracks.find(t => t.info.identifier !== id) ?? null;

        if(!next) {
            const query = `${lastTrack.info.author ?? ""} ${lastTrack.info.title ?? ""}`.trim();
            if(!query) return;
            const fallback = await player.search(`ytsearch${query}`, { requester: "Autoplay" });
            next = fallback.tracks.find(t => t.info.identifier !== id) ?? null;
        }
        if(!next) {
            logger.info(`[${player.guildId}] No related tracks for autoplay`);
            return;
        }

        player.queue.add(next);
        if(!player.playing) await player.play();
        logger.info(`[${player.guildId}] Autoplay: ${next.info.title}`);
    } catch(error) {
        logger.error(`[${player.guildId}] Autoplay error:`, error);
    }

}