import { ChatInputCommandInteraction } from "discord.js";
import { musicManager } from "@core/musicManager";

export const data = {
  name: "다시시작",
  description: "일시 정지된 곡을 다시 재생합니다.",
};

export async function execute(interaction: ChatInputCommandInteraction) {
  const player = musicManager.players.get(interaction.guildId!);

  if (!player || !player.queue.current) {
    return interaction.reply("❌ 현재 재생 중인 곡이 없습니다.");
  }

  if (!player.paused) {
    return interaction.reply("▶ 이미 재생 중입니다.");
  }

  player.pause(false);
  return interaction.reply("▶ 재생을 다시 시작했습니다.");
}
