const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('검색')
        .setDescription('노래를 검색합니다.')
        .addStringOption(option =>
            option.setName('검색어')
                .setDescription('검색할 노래 제목을 입력해주세요')
                .setRequired(true)
        ),
    async execute(interaction) {
        const query = interaction.options.getString('검색어');
        const player = interaction.client.player;
        const voiceChannel = interaction.member.voice.channel;

        if(!voiceChannel) {
            return interaction.reply({content: '음성 채널에 참가해주세요.', ephemeral: true});
        }

        await interaction.deferReply();

        try {
            const result = await player.search(query, {
                requestedBy: interaction.user
            });

            if(!result || !result.tracks.length) {
                return interaction.followUp('검색 결과가 없습니다.');
            }
            const track = result.tracks[0];
            const queue = player.nodes.create(interaction.guild, {
                metadata: {
                    channel: interaction.channel
                }
            });

            if(!queue.connection) {
                await queue.connect(voiceChannel);
            }
            queue.play(track);

            return interaction.followUp(`재생 중: **${track.title}**`);
        } catch(error) {
            console.error(error);
            return interaction.followUp('노래를 검색하는 도중 오류가 발생했습니다.');
        }
    },
};