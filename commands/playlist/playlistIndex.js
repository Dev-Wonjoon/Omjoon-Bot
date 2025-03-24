const { SlashCommandBuilder } = require('discord.js');
const createCommand = require('../../helpers/playlist/createCommand');
const listCommand = require('../../helpers/playlist/getListCommand');
const getCommand = require('../../helpers/playlist/getCommand');
const selectCommand = require('../../helpers/playlist/selectPlaylistCommand');
const deleteCommand = require('../../helpers/playlist/deleteCommand');
const addMusicToPlaylist = require('../../helpers/playlist/musicAddCommand');

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
    )
    .addSubcommand(subcommend =>
        subcommend
        .setName('노래추가')
        .setDescription('해당 플레이리스트에 노래를 추가합니다.')
        .addStringOption(option =>
            option
            .setName('플레이리스트')
            .setDescription('노래를 추가할 플레이리스트 이름을 입력해주세요.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName('노래제목')
            .setDescription('추가할 노래 제목을 입력해주세요.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommend =>
        subcommend
       .setName('재생')
       .setDescription('플레이리스트를 선택합니다.')
    ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case '생성':
                await createCommand(interaction);
                break;
            case '목록':
                await listCommand(interaction);
                break;
            case '삭제':
                await deleteCommand(interaction);
                break;
            case '조회':
                await getCommand(interaction);
                break;
            case '노래추가':
                await addMusicToPlaylist(interaction);
                break;
            case '재생':
                await selectCommand(interaction);
                break;
            default:
                return interaction.reply('알 수 없는 명령어입니다.');
        }
    }
}