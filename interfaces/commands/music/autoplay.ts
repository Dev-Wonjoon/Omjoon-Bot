import { ChatInputCommandInteraction } from "discord.js";
import { musicManager } from "@core/musicManager";

export const data = {
  name: "자동재생",
  description: "자동 재생 모드를 켜거나 끕니다.",
};

export async function execute(interaction: ChatInputCommandInteraction) {
  const player = musicManager.players.get(interaction.guildId!);

  if (!player) {
    return interaction.reply("현재 재생 중인 플레이어가 없습니다.");
  }

  (player as any).autoplay = !(player as any).autoplay;

  const mode = (player as any).autoplay ? "자동 재생 모드 켜짐" : "자동 재생 모드 꺼짐";
  return interaction.reply(mode);
}
