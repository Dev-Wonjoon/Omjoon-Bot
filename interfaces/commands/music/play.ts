import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  ComponentType,
} from "discord.js";
import logger from "@core/logger";
import { MusicManager } from "@core/musicManager";

export const data = new SlashCommandBuilder()
  .setName("재생")
  .setDescription("음악을 검색하고 재생할 곡을 선택합니다.")
  .addStringOption((option) =>
    option.setName("검색어").setDescription("노래 제목 또는 URL").setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  musicManager: MusicManager
) {
  const query = interaction.options.getString("검색어", true);
  const guild = interaction.guild;
  const member = interaction.member;

  if (!guild || !member || !("voice" in member)) {
    await interaction.reply("음성 채널에 접속해주세요.");
    return;
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply("먼저 음성 채널에 들어가 주세요.");
    return;
  }

  await interaction.deferReply();

  // 🎧 join
  const player = await musicManager.join(guild, voiceChannel);

  try {
    logger.info(`[PlayCommand] 검색 요청: "${query}" (guild: ${guild.id})`);
    const result = await player.search(query, { requester: interaction.user });

    // ✅ 상세 로깅
    logger.info(
      `[PlayCommand] 검색 결과 loadType=${result.loadType}, tracks=${result.tracks.length}`
    );

    if (result.exception) {
      logger.error(
        `[PlayCommand] 검색 중 예외 발생: ${result.exception.message || result.exception}`
      );
    }

    // 🔎 결과 없음
    if (!result.tracks.length) {
      await interaction.editReply("검색 결과가 없습니다.");
      logger.warn(`[PlayCommand] 검색 결과가 없습니다: "${query}"`);
      return;
    }

    // 🎶 검색된 트랙 중 상위 7개
    const tracks = result.tracks.slice(0, 7);
    logger.debug(`[PlayCommand] 첫 번째 결과: ${tracks[0].info.title}`);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("track_select")
      .setPlaceholder("재생할 곡을 선택하세요")
      .addOptions(
        tracks.map((t, i) => ({
          label: `${i + 1}. ${t.info.title}`.slice(0, 50),
          description: t.info.author?.slice(0, 30) || "Unknown artist",
          value: i.toString(),
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.editReply({
      content: "재생할 곡을 선택해주세요:",
      components: [row],
    });

    // 🎚 선택 처리
    const selectInteraction = await interaction.channel?.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 30_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    const selectedIndex = parseInt(
      (selectInteraction as StringSelectMenuInteraction).values[0],
      10
    );
    const track = tracks[selectedIndex];

    player.queue.add(track);

    if (!player.playing) {
      await player.play();
    }

    await (selectInteraction as StringSelectMenuInteraction).update({
      content: `**${track.info.title}** 재생을 시작합니다.`,
      components: [],
    });

    logger.info(`[PlayCommand] ${interaction.user.tag} - ${track.info.title} 재생 시작`);
  } catch (error: any) {
    logger.error(`[PlayCommand] 오류 발생: ${error.message || error}`);
    await interaction.editReply({
      content: "검색 중 오류가 발생했습니다.",
      components: [],
    });
  }
}
