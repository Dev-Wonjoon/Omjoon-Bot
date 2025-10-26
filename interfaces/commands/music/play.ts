import { useMainPlayer } from "discord-player";
import { 
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
    GuildMember
} from "discord.js"
import { selectMenuPrompt } from "../../interactions/selectMenuPrompt.js";

export const data = new SlashCommandBuilder()
    .setName('재생')
    .setDescription('노래를 검색하고 재생합니다.')
    .addStringOption(option => 
        option
            .setName('검색어')
            .setDescription('검색할 노래 또는 URL을 입력해주세요')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('검색어', true);
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if(!voiceChannel) {
        return interaction.reply({
            content: '먼저 음성 채널에 참가해주세요.',
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.deferReply();

    const player = useMainPlayer();
    try {
        const result = await player.search(query, {
            requestedBy: interaction.user,
        });

        if(!result || !result.tracks.length) {
            return interaction.followUp('검색 결과가 없습니다.');
        }

        const tracks = result.tracks.slice(0, 5);
        const selectedTrack = await selectMenuPrompt(
            interaction,
            '노래를 선택해주세요.',
            tracks.map((track, index) => ({
                label: track.title,
                description: track.author,
                value: index.toString(),
                raw: track,
            })),
            '노래 목록에서 선택',
            'track_select'
        );

        if(!selectedTrack) {
            return;
        }

        const queue = player.nodes.create(interaction.guild!, {
            metadata: {
                channel: interaction.channel,
            },
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 60000,
            leaveOnStop: true,
            leaveOnStopCooldown: 60000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 60000,
            selfDeaf: true,
        });

        if(!queue.connection) {
            await queue.connect(voiceChannel);
        }

        queue.addTrack(selectedTrack);
        if(!queue.isPlaying()) {
            await queue.node.play();
        }

        await interaction.followUp(`**${selectedTrack.title}**을 선택하셨습니다.`);
    } catch(error) {
        console.error(error);
        await interaction.followUp('노래 재생 중 오류가 발생했습니다.');
    }
}