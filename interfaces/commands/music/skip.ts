import { musicManager } from "@core/musicManager";
import { CommandInteraction } from "discord.js";

export const data = {
    name: "스킵",
    description: "현재 재생 중인 곡을 건너뜁니다.",
};

export async function execute(interaction: CommandInteraction) {
    const player = musicManager.players.get(interaction.guildId!);

    if(!player || !player.queue.current) {
        return interaction.reply("현재 재생 중인 곡이 없습니다.");
    }

    if(player.queue.size > 0) {
        player.stop();
        return interaction.reply("다음 곡으로 넘어갑니다.");
    }
}