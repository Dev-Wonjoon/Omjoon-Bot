import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MusicManager } from "@core/musicManager";
import logger from "@core/logger";

export const data = new SlashCommandBuilder()
    .setName("자동재생")
    .setDescription("자동 재생 모드를 키거나 끕니다.")
    .addStringOption((option) =>
        option
            .setName("상태")
            .setDescription("켜기 또는 끄기")
            .setRequired(true)
            .addChoices(
                { name: "켜기", value: "on" },
                { name: "끄기", value: "off" }
            ));

export async function execute(
    interaction: ChatInputCommandInteraction,
    musicManager: MusicManager
) {
    const guild = interaction.guild;
    if (!guild) {
        await interaction.reply("서버 내부에서만 사용할 수 있는 명령어입니다.");
        return;
    }

    const choice = interaction.options.getString("상태", true);
    const player = musicManager.getPlayer(guild.id);

    if(!player) {
        await interaction.reply("현재 재생 중인 플레이어가 없습니다.")
        return;
    }

    const enable = choice === "on";
    musicManager.setAutoPlay(guild.id, enable);

    await interaction.reply(
        enable
        ? "**자동 재생**모드를 켰습니다."
        : "**자동 재생**모드를 껐습니다."
    );
    logger.info(`[${guild.id}] AutoPlay set to ${enable}`);
}
