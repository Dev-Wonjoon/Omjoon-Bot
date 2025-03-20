const { SlashCommandBuilder, Message, MessageFlags } = require('discord.js');
const { sendSelectionMenu } = require('../../helpers/selectTrack');
const { playTrack } = require('../../helpers/playerTrack');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('재생')
    .setDescription('노래를 검색하고 재생합니다.')
    .addStringOption(option =>
      option.setName('검색어')
        .setDescription('검색할 노래 제목 또는 URL을 입력해주세요.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString('검색어');
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return interaction.reply({ content: "먼저 음성 채널에 참가해주세요.", flags: MessageFlags.EPHEMERAL });

    await interaction.deferReply();
    const player = interaction.client.player;

    try {
      const result = await player.search(query, { requestedBy: interaction.user });
      if (!result || !result.tracks.length)
        return interaction.followUp("검색 결과가 없습니다.");

      // 검색 결과 상위 5개 항목 추출
      const tracks = result.tracks.slice(0, 5);

      // 헬퍼 함수를 통해 드롭다운 선택 메뉴 전송 및 사용자의 선택 대기
      const selectedTrack = await sendSelectionMenu(interaction, tracks);
      if (!selectedTrack)
        return interaction.followUp("선택이 취소되었거나 시간이 초과되었습니다.");

      // 헬퍼 함수를 통해 선택된 트랙 재생 및 종료 후 자동 퇴장 처리
      await playTrack(interaction, voiceChannel, selectedTrack);
    } catch (error) {
      console.error(error);
      return interaction.followUp("노래 재생 중 오류가 발생했습니다.");
    }
  },
};
