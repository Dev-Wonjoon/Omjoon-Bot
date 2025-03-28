import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    MessageFlags
} from 'discord.js';
import { usePlayer, QueueRepeatMode, useMainPlayer } from 'discord-player';

export const data = new SlashCommandBuilder()
    .setName('재생모드')
    .setDescription('노래 반복 모드를 설정합니다.')
    .addStringOption(option => 
        option
            .setName('모드')
            .setDescription('반복 모드')
            .setRequired(true)
            .addChoices(
                { name: '현재 노래 반복', value: 'track' },
                { name: '전체 노래 반복', value: 'queue' },
                { name: '자동선택', value: 'autoplay' },
                { name: '끄기', value: 'off' }
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if(!queue || !queue.node.isPlaying()) {
        return await interaction.reply({
            content: '현재 재생 중인 노래가 없습니다.',
            flags: MessageFlags.Ephemeral
        })
    }

    const mode = interaction.options.getString('모드', true);

    const repeatMap: Record<string, QueueRepeatMode> = {
        track: QueueRepeatMode.TRACK,
        queue: QueueRepeatMode.QUEUE,
        autoplay: QueueRepeatMode.AUTOPLAY,
        off: QueueRepeatMode.OFF,
    };

    queue.setRepeatMode(repeatMap[mode]);

    const labels: Record<QueueRepeatMode, string> = {
        [QueueRepeatMode.OFF]: '반복없음',
        [QueueRepeatMode.TRACK]: '현재 재생중인 노래 반복',
        [QueueRepeatMode.QUEUE]: '전체 노래 반복',
        [QueueRepeatMode.AUTOPLAY]: '자동 선택',
    };

    await interaction.reply(`
       반복 모드가 **${labels[repeatMap[mode]]}**(으)로 설정되었습니다. 
    `);
}