import logger from "@core/logger";
import { MusicManager } from "@core/music/musicManager";
import { ActionRowBuilder } from "@discordjs/builders";
import { ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";


function formatDuration(ms: number | undefined) {
    if(!ms || ms < 0) return "0:00";
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildEmbed(player: any, page: number, perPage: number) {
    const now = player.current ?? player.queue?.current ?? null;
    const upcoming = player.queue?.tracks ?? [];
    const total = upcoming.length;

    const maxPage = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(Math.max(1, page), maxPage);
    const start = (safePage - 1) * perPage;
    const slice = upcoming.slice(start, start + perPage);

    const lines = slice.map((t: any, idx: number) => {
        const num = start + idx + 1;
        const title = t?.info?.title ?? "제목 없음";
        const author = t?.info.author ?? "알 수 없음";
        const dur = formatDuration(t?.info?.length);
        return `**${num}.** ${title} • ${author} \`${dur}\``;
    });

    const nowTitle = now?.info?.title ?? "없음";
    const nowAuthor = now?.info?.author ?? "";
    const nowDur = now?.info?.length ? formatDuration(now.info.length) : null;

    const embed = new EmbedBuilder()
        .setTitle("현재 대기열")
        .addFields(
            {
                name: "재생 중",
                value: now
                    ? `**${nowTitle}**${nowAuthor ? ` • ${nowAuthor}`: ""}${nowDur ? ` \`${nowDur}\``: ""}`
                    : "재생 중인 곡이 없습니다.",
            },
            {
                name: `다음 곡 (${total}곡 대기 중)`,
                value: total > 0 ? (lines.join('\n') || "표시할 곡이 없습니다.") : "대기열이 비어 있습니다.",
            },
        ).setFooter({ text: `페이지 ${safePage}/${maxPage}` });
    
    return { embed, safePage, maxPage, total };
}

function buildRow(customBase: string, page: number, maxPage: number) {
    const prev = new ButtonBuilder()
        .setCustomId(`${customBase}:prev`)
        .setLabel("이전")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1);
    
    const next = new ButtonBuilder()
        .setCustomId(`${customBase}:next`)
        .setLabel("다음")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= maxPage);
    
    const close = new ButtonBuilder()
        .setCustomId(`${customBase}:close`)
        .setLabel("닫기")
        .setStyle(ButtonStyle.Danger);
    
    return new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next, close);
}

export const data = new SlashCommandBuilder()
    .setName("대기열")
    .setDescription("현재 재생 중인 곡과 대기열을 보여줍니다.")

export async function execute(
    interaction: ChatInputCommandInteraction,
    musicManager: MusicManager
) {
    const guild = interaction.guild;
    if(!guild) {
        await interaction.reply("이 명령어는 서버에서만 사용할 수 있습니다.");
        return;
    }

    const player = musicManager.getPlayer(guild.id);
    if(!player) {
        await interaction.reply("현재 활성화된 플레이어가 없습니다.");
        return;
    }

    const perPage = 10;
    let page = 1;

    try {
        const customBase = `queue:${guild.id}:${interaction.user.id}:${Date.now()}`;

        const { embed, safePage, maxPage } = buildEmbed(player, page, perPage);
        const row = buildRow(customBase, safePage, maxPage);

        const msg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000,
            filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith(customBase),
        });

        collector.on("collect", async (btn: ButtonInteraction) => {
            try {
                if(btn.customId.endsWith(":close")) {
                    collector.stop("closed");
                    return;
                }
                const freshPlayer = musicManager.getPlayer(guild.id);
                if(freshPlayer) {
                    await btn.update({ content: "플레이어가 종료되었습니다.", embeds: [], components: [] });
                    collector.stop("no-player");
                    return;
                }

                if(btn.customId.endsWith(":prev")) page = Math.max(1, page - 1);
                if(btn.customId.endsWith(":next")) page = page + 1;

                const { embed: newEmbed, safePage: sp, maxPage: mp } = buildEmbed(freshPlayer, page, perPage);
                page = sp;

                await btn.update({
                    embeds: [newEmbed],
                    components: [buildRow(customBase, sp, mp)]
                });
            } catch(error: any) {
                logger.warn(`[QueueButton] update failed: ${error?.message || error}`);
                try {
                    await btn.deferUpdate().catch(() => {});
                } catch{}
            }
        });
        collector.on("end", async(_collected, reason) => {
            try {
                const { embed: finalEmbed, safePage: sp, maxPage: mp } = buildEmbed(player, page, perPage);
                const disabledRow = buildRow(customBase, sp, mp);

                disabledRow.components.forEach((c) => c.setDisabled(true));
                await msg.edit({ embeds: [finalEmbed], components: [disabledRow] }).catch(() => {});
                logger.info(`[QueueButtons] collector end: ${reason}`);
            } catch{}
        });
    } catch(error: any) {
        logger.warn(`[Queue] failed: ${error?.message || error}`);
        await interaction.reply("대기열을 불러오는 중 오류가 발생했습니다.");
    }
}

