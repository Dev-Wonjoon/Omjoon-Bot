import logger from "@core/logger";
import { MusicManager } from "@core/musicManager";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("정지")
    .setDescription("현재 재생 중인 노래와 대기열을 모두 정지합니다.");

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
        logger.info(`[Stop] No active player found for guild ${guildId}`);
        return;
    }

    const queue = manager.getQueue(guildId);
    const nothingToStop = !player.track && queue.length === 0;

    if (nothingToStop) {
        await interaction.reply("정지할 노래가 없습니다.");
        return;
    }

    try {
        if (player.track) {
            await player.stopTrack();
        }
        manager.clearQueue(guildId);

        await interaction.reply("모든 노래 재생을 정지하고 대기열을 비웠습니다.");
        logger.info(`[Stop] Stopped playback and cleared queue in guild ${guildId}`);
    } catch (error) {
        logger.error(`[Stop] Failed to stop playback in guild ${guildId}:`, error);
        await interaction.reply("노래 정지에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
}
