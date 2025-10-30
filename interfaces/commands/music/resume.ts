import logger from "@core/logger";
import { MusicManager } from "@core/musicManager";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("다시시작")
    .setDescription("일시 정지된 노래를 다시 재생합니다.");

export async function execute(interaction: ChatInputCommandInteraction, manager: MusicManager) {
    const guildId = interaction.guildId;
    const voiceChannel = (interaction.member as any)?.voice?.channel;

    if (!guildId) {
        await interaction.reply("이 명령어는 서버에서만 사용할 수 있습니다.");
        return;
    }

    if (!voiceChannel) {
        await interaction.reply("먼저 음성 채널에 들어가야 합니다.");
        return;
    }

    const player = manager.getPlayer(guildId);
    if (!player) {
        await interaction.reply("현재 재생 중인 음악이 없습니다.");
        logger.info(`[Resume] No active player found for guild ${guildId}`);
        return;
    }

    if (!player.paused) {
        await interaction.reply("이미 노래가 재생 중입니다.");
        return;
    }

    try {
        await manager.resume(guildId);

        let trackTitle: string | null = null;
        if (player.track) {
            try {
                const decoded = await player.node.rest.decode(player.track);
                trackTitle = decoded?.info?.title ?? null;
            } catch (error) {
                logger.warn(`[Resume] Failed to decode track for guild ${guildId}: ${(error as Error).message}`);
            }
        }

        const message = trackTitle
            ? `다시 재생합니다: **${trackTitle}**`
            : "일시 정지된 노래를 다시 재생합니다.";

        await interaction.reply(message);
        logger.info(`[Resume] Resumed playback in guild ${guildId}`);
    } catch (error) {
        logger.error(`[Resume] Failed to resume playback in guild ${guildId}:`, error);
        await interaction.reply("노래를 다시 재생하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
}
