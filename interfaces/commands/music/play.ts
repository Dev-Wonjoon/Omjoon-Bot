import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, EmbedBuilder, GuildMember, StringSelectMenuBuilder } from "discord.js";
import { musicManager } from "@core/musicManager";
import logger from "@core/logger";

export const data = {
    name: "재생",
    description: "노래를 재생합니다.",
    options: [{
        name: "검색어",
        description: "검색어 또는 URL",
        type: 3,
        require: true,
    }],
};

export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.get("query")?.value as string;
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply("음성 채널에 먼저 들어가주세요");
    }

    await interaction.deferReply();

    const player = musicManager.createPlayer(
        interaction.guildId!,
        voiceChannel.id,
        interaction.channelId,
    );

    player.connect();

    const search = await musicManager.searchTrack(query, interaction.user);

    if (!search.tracks.length) {
        return interaction.editReply("검색 결과가 없습니다.");
    }

    const trackResult = search.tracks.slice(0, 5);
    const options = trackResult.map((track, index) => ({
        label: `${index + 1}. ${track.title}`.substring(0, 100),
        description: track.author.substring(0, 100),
        value: track.uri,
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("music-select")
        .setPlaceholder("재생할 노래를 선택하세요")
        .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const embed = new EmbedBuilder()
        .setTitle("검색 결과")
        .setDescription(trackResult.map(
            (t, i) => `**${i + 1}.** [${t.title}](${t.uri}) • ${t.author} • ${t.duration}`
        ).join('\n')).setColor('Blue');

    await interaction.editReply({
        embeds: [embed],
        components: [row],
    });

    try {
        const response = await interaction.channel?.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: 60_000,
            filter: (i) => i.user.id === interaction.user.id,
        });

        if (!response) return;

        const selectedUrl = response.values[0];
        const selectedTrack = trackResult.find((t) => t.uri === selectedUrl)!;

        const player = musicManager.createPlayer(
            interaction.guildId!,
            voiceChannel.id,
            interaction.channelId
        );

        player.connect();
        player.queue.add(selectedTrack);
        player.play();

        await response.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("선택한 곡 재생 중")
                    .setDescription(`[${selectedTrack.title}](${selectedTrack.uri})`)
                    .setColor("DarkBlue"),
            ],
            components: [],
        });

        logger.info(`[Player] ${selectedTrack.title} is now playing.`);
    } catch (error) {
        logger.warn("User did not select a song within the time limit.");
        await interaction.editReply({
            content: "60초 동안 선택하지 않아 재생이 취소되었습니다.",
            components: [],
            embeds: [],
        });
    }
}