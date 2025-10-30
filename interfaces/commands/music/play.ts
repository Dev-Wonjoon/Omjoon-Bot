import { ChatInputCommandInteraction, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, ComponentType } from "discord.js";
import { MusicManager } from "@core/musicManager";
import logger from "@core/logger";

export const data = new SlashCommandBuilder()
    .setName('재생')
    .setDescription("음악을 검색하고 재생할 곡을 선택합니다.")
    .addStringOption((option) =>
        option.setName("query").setDescription("노래 제목 또는 URL").setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction, manager: MusicManager) {
    const query = interaction.options.getString("query", true);
    const member = interaction.member;
    const voiceChannel = (interaction.member as any)?.voice?.channel;

    if(!voiceChannel) {
        await interaction.reply("먼저 음성 채널에 들어가야 합니다.");
        return;
    }

    await interaction.deferReply();

    const player = await manager.joinChannel(member as any, voiceChannel);

    const node = player.node;
    const result = await node.rest.resolve(query);
    if(!result || result.loadType === "error" || result.loadType === "empty") {
        await interaction.editReply("검색 결과가 없습니다.");
        return;
    }

    const tracks =
        result.loadType == "search"
        ? result.data.slice(0, 5)
        : result.loadType === "playlist"
        ? result.data.tracks.slice(0, 5)
        : [result.data];
    
    const options = tracks.map((track, index) => ({
        label: track.info.title.length > 90 ? track.info.title.slice(0, 37) + "..." : track.info.title,
        description: track.info.author || "Unknown artist",
        value: track.encoded,
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("music_select")
        .setPlaceholder("재생할 곡을 선택하세요.")
        .addOptions(options);
    
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.editReply({
        content: "검색된 노래 목록입니다. 재생할 곡을 선택하세요.",
        components: [row],
    });

    const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 30000,
    });

    collector?.on("collect", async (selectMenuInteraction: StringSelectMenuInteraction) => {
        if(selectMenuInteraction.customId !== "music_select") return;
        if(selectMenuInteraction.user.id !== interaction.user.id) {
            await selectMenuInteraction.reply({ content: "이 메뉴는 당신의 명령이 아닙니다.", ephemeral: true });
            return
        }

        const selected = selectMenuInteraction.values[0];
        const selectedTrack = tracks.find((t) => t.encoded === selected);
        if(!selectedTrack) {
            await selectMenuInteraction.reply({ content: "선택된 곡을 찾을 수 없습니다.", ephemeral: true });
            return;
        }

        if(player.track) {
            const queue = manager.getQueue(interaction.guildId!);
            queue.push({
                encoded: selectedTrack.encoded,
                info: {
                    title: selectedTrack.info.title,
                    uri: selectedTrack.info.uri,
                    author: selectedTrack.info.author,
                    length: selectedTrack.info.length
                }
            });

            logger.info(`[Queue] Added to queue: ${selectedTrack.info.title}`);
            await selectMenuInteraction.update({
                content: `대기열에 추가되었습니다: ${selectedTrack.info.title}`,
                components: [],
            });
        } else {
            await player.playTrack({ track: { encoded: selectedTrack.encoded } });
            await selectMenuInteraction.update({
                content: `재생 중: ${selectedTrack.info.title}`,
                components: [],
            });
        }
        collector.stop("track_selected");
    });

    collector?.on("end", (_, reason) => {
        if(reason !== "track_selected") {
            interaction.editReply({
                content: "시간이 초과되었습니다. 다시 명령어를 입력해주세요.",
                components: [],
            });
        }
    });
}