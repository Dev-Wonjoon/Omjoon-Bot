import { ChatInputCommandInteraction } from "discord.js";
import { musicManager } from "@core/musicManager";

export const data = {
  name: "일시정지",
  description: "현재 재생 중인 곡을 일시 정지합니다.",
};

export async function execute(interaction: ChatInputCommandInteraction) {
  const player = musicManager.players.get(interaction.guildId!);

  if (!player || !player.queue.current) {
    return interaction.reply("현재 재생 중인 곡이 없습니다.");
  }

  if (player.paused) {
    return interaction.reply("이미 일시 정지된 상태입니다.");
  }

  player.pause(true);
  return interaction.reply("재생을 일시 정지했습니다.");
}
