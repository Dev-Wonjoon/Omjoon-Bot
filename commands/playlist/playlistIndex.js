const { SlashCommandBuilder } = require('discord.js');
const { createPlaylist } = require('../../api/playlist/createPlaylist');
const { getAllPlaylist } = require('../../api/playlist/getAllPlaylist');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('플리')
    .setDescription('플레이리스트 관련 명령어입니다.')
    .addSubcommand(subcommend =>
        subcommend
        .setName('생성')
        .setDescription('새로운 플레이리스트를 생성합니다.')
        .addStringOption(option =>
            option
            .setName('이름')
            .setDescription('생성할 플레이리스트 이름을 입력해주세요.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommend =>
        subcommend
        .setName('목록')
        .setDescription('생성된 플레이리스트 목록을 확인합니다.')
    )
    .addSubcommand(subcommend =>
        subcommend
        .setName('삭제')
        .setDescription('플레이리스트를 삭제합니다.')
        .addStringOption(option =>
            option
            .setName('이름')
            .setDescription('삭제할 플레이리스트 이름을 입력해주세요.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommend =>
        subcommend
        .setName('조회')
        .setDescription('해당 플레이리스트를 확인합니다.')
        .addStringOption(option =>
            option
            .setName('이름')
            .setDescription('조회할 플레이리스트 이름을 입력해주세요.')
            .setRequired(true)
        )
    ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const discordId = parseInt(interaction.user.id);

        switch (subcommand) {
            case '생성':
                const playlistName = interaction.options.getString('이름');
                await createPlaylist(discordId, playlistName);
                return interaction.reply({content: `플레이리스트 **${playlistName}** 을(를) 생성했습니다.`});
            case '목록':
                try {
                    const playlists = await getAllPlaylist(discordId);
                    if (!playlists || playlists.length === 0) {
                        return interaction.reply({content: '생성된 플레이리스트가 없습니다.'});
                    }

                    const playlistNames = playlists.map(playlist =>`${playlist.playlistName}`).join('\n');
                    return interaction.reply({content: `생성된 플레이리스트 목록입니다.\n${playlistNames}`});
                } catch (error) {
                    console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
                    return interaction.reply({content: '플레이리스트 목록을 불러오는 중 오류가 발생했습니다.'});
                }
        }
    }
}