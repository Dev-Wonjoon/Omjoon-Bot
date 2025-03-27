import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { useMainPlayer } from "discord-player";

export const data = new SlashCommandBuilder()
    .setName('스킵')
    .setDescription('현재 재생 중인 곡을 스킵합니다.')

export async function execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if(!queue || !queue.isPlaying()) {
        return interaction.reply({
            content: '현재 재생 중인 곡이 없습니다.',
            flags: MessageFlags.Ephemeral,
        });
    }

    await queue.node.skip();
    await interaction.reply('현재 재생 중인 노래를 스킵했습니다.');
}