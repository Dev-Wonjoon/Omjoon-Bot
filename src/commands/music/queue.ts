import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { useMainPlayer } from "discord-player";

export const data = new SlashCommandBuilder()
    .setName('대기열')
    .setDescription('현재 재생 중인 노래와 대기 중인 노래를 보여줍니다.');


export async function execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if(!queue || !queue.isPlaying()) {
        return interaction.reply({ content: '현재 재생 중인 곡이 없습니다.' });
    }

    const current = queue.currentTrack;
    const tracks = queue.tracks.toArray();
    const maxLength = 10;
    
    const embed = new EmbedBuilder()
        .setTitle("현재 대기열")
        .addFields(
            {
                name: "지금 재생 중",
                value: `[${current?.title}] • ${current?.duration}`
            },
        ).setColor("Blurple");
    if(tracks.length > 0) {
        const upcommingTracks = tracks.length
        ? tracks
            .slice(0, maxLength)
            .map((track, index) => `${index+1} - [${track.title}] • ${current?.duration}`)
            .join('\n')
        : '대기중인 곡이 없습니다.';

        embed.addFields({
            name: `다음 곡 리스트 (${Math.min(tracks.length, maxLength)}개)`,
            value: upcommingTracks
        });
    }
    await interaction.reply({ embeds: [embed]});
}
