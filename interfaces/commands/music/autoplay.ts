import { ChatInputCommandInteraction } from "discord.js";
import { MusicManager } from "@core/musicManager";

export const data = {
  name: "자동재생",
  description: "자동 재생 모드를 켜거나 끕니다.",
};

export async function execute(interaction: ChatInputCommandInteraction, manager: MusicManager) {
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply("이 명령어는 서버에서만 사용할 수 있습니다.");
    return;
  }

  const player = manager.getPlayer(guildId);

  if (!player) {
    await interaction.reply("현재 재생 중인 플레이어가 없습니다.");
    return;
  }

  (player as any).autoplay = !(player as any).autoplay;

  const mode = (player as any).autoplay ? "자동 재생 모드 켜짐" : "자동 재생 모드 꺼짐";
  await interaction.reply(mode);
}
