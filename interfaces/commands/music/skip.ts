import { ChatInputCommandInteraction } from "discord.js";
import logger from "@core/logger";
import { MusicManager } from "@core/musicManager";

export const data = {
    name: "스킵",
    description: "현재 재생 중인 곡을 건너뜁니다.",
};

export async function execute(interaction: ChatInputCommandInteraction, manager: MusicManager) {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply("이 명령어는 서버에서만 사용할 수 있습니다.");
        return;
    }

    const player = manager.getPlayer(guildId);
    const queue = manager.getQueue(guildId);

    if (!player) {
        await interaction.reply("현재 재생 중인 곡이 없습니다.");
        logger.info(`[Skip] No active player for guild ${guildId}`);
        return;
    }

    if (!player.track && queue.length === 0) {
        await interaction.reply("건너뛸 곡이 없습니다.");
        logger.info(`[Skip] Nothing to skip for guild ${guildId}`);
        return;
    }

    const next = queue.shift();
    manager.setQueue(guildId, queue);

    if (next) {
        await player.playTrack({ track: { encoded: next.encoded } });
        await interaction.reply(`다음 곡으로 넘어갑니다: ${next.info.title}`);
        logger.info(`[Skip] Skipped track, now playing ${next.info.title} in guild ${guildId}`);
    } else {
        await player.stopTrack();
        await interaction.reply("재생 중인 곡을 정지했습니다. 더 이상 대기 중인 곡이 없습니다.");
        logger.info(`[Skip] Stopped playback, queue empty in guild ${guildId}`);
    }
}
