import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { musicManager } from "@core/musicManager";

export const data = {
    name: "대기열",
    description: "현재 재생 대기열을 보여줍니다.",
};


export async function execute(interaction: ChatInputCommandInteraction) {
    const player = musicManager.players.get(interaction.guildId!);

    if (!player || !player.queue.size) {
        return interaction.reply("현재 대기 중인 곡이 없습니다.");
    }

    const current = player.queue.current;
    if(!current) {
        return interaction.reply("현재 재생 중인 곡이 없습니다.");
    }

    const tracks = player.queue.slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle("재생 목록")
        .setDescription(
            `**지금 재생 중:** [${current.title}](${current.uri})\n\n${tracks
                .map((t, i) => `${i + 1}. [${t.title}](${t.uri}) • ${t.author}`)
                .join("\n")}`
        )
        .setColor('Blue');
    
    return interaction.reply({ embeds: [embed]});
}