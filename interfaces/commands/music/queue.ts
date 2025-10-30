import logger from "@core/logger";
import { MusicManager } from "@core/musicManager";
import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";


export const data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("현재 재생 대기 중인 노래 목록을 보여줍니다.");

export async function execute(interaction: ChatInputCommandInteraction, manager: MusicManager) {
    const guildId = interaction.guildId!;
    const queue = manager.getQueue(guildId);

    if(!queue || queue.length === 0) {
        await interaction.reply("현재 대기 중인 곡이 없습니다.");
        logger.info(`[Queue] No tracks in queue for guild ${guildId}`);
        return;
    }

    const list = queue
        .slice(0, 10)
        .map((track, index) => {
            const title = track.info.title ?? "제목 없음";
            const author = track.info.author ?? "알 수 없음";
            const uri = track.info.uri;

            const titleDisplay = uri ? `[${title}(${uri})]` : title;
            return `${index + 1}. ${titleDisplay} • ${author}`;
        }).join("\n");
    
    const embed = new EmbedBuilder()
        .setTitle("현재 대기열")
        .setDescription(list)
        .setFooter({ text: `총 ${queue.length}곡이 대기 중입니다.` });
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`[Queue] Displayed ${queue.length} tracks for guild ${guildId}`);
}