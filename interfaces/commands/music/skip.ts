import logger from "@core/logger";
import { MusicManager } from "@core/music/musicManager";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";


export const data = new SlashCommandBuilder()
    .setName("스킵")
    .setDescription("현재 재생 중인 곡을 건너뜁니다.");

export async function execute(
    interaction: ChatInputCommandInteraction,
    musicManager: MusicManager
) {
    const guild = interaction.guild;
    if(!guild) {
        await interaction.reply("이 명령어는 서버에서만 사용할 수 있습니다.");
        return;
    }

    const player = musicManager.getPlayer(guild.id);
    if(!player) {
        await interaction.reply("현재 활성화된 플레이어가 없습니다.");
        return;
    }

    try {
        await player.skip();
        if(player.playing) {
            await player.stopPlaying();
            await interaction.reply("노래를 건너뜁니다.");
            return;
        }

        const queueSize = player.queue?.tracks.length ?? 0;

        if(queueSize > 0) {
            await player.skip();
            await interaction.reply("노래를 건너뜁니다.");
            return;
        }

        await interaction.reply("재생 중인 노래가 없습니다.");
        
    } catch(error: any) {
        logger.warn(`[Skip] failed: ${error?.message || error}`);
        await interaction.reply("처리 중 오류가 발생했습니다.");
    }
}