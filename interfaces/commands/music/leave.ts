import logger from "@core/logger";
import { MusicManager } from "@core/music/musicManager";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";


export const data = new SlashCommandBuilder()
    .setName("나가기")
    .setDescription("봇이 음성 채널에서 나갑니다.")

export async function execute(
    interaction: ChatInputCommandInteraction,
    musicManager: MusicManager
) {
    const guild = interaction.guild;

    if(!guild) {
        await interaction.reply({ content: "이 명령어는 서버에서만 사용할 수 있습니다.", ephemeral: true });
        return;
    }

    const player = musicManager.getPlayer(guild.id);
    if(!player) {
        await interaction.reply({ content: "현재 음성 채널에 접속해 있지 않습니다.", ephemeral: true });
        return;
    }

    try {
        await player.destroy();
        logger.info(`[${guild.id}] Player destroyed by /leave`);
        await interaction.reply({ content: "음성 채널에서 나갔습니다." });
    } catch(error) {
        logger.error(`[${guild.id}] failed /leave`, error);
        const msg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
        await interaction.reply({ content: `나가기에 실패했습니다.: ${msg}`, ephemeral: true });
    }
}