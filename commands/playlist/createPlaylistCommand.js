const { SlashCommandBuilder, MessageFlags } = require('discord.js');

    module.exports = {
        data: new SlashCommandBuilder()
            .setName('플레이리스트')
            .setDescription('새로운 플레이리스트를 생성합니다.')
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
                .setName('삭제')
                .setDescription('플레이리스트를 삭제합니다.')
                .addStringOption(option =>
                    option
                    .setName('이름')
                    .setDescription('삭제할 플레이리스트 이름을 입력해주세요.')
                    .setRequired(true)
                )
            ),
        async execute(interaction) {
            const subcommand = interaction.options.getSubcommand();
            if(subcommand === '생성') {
                const name = interaction.options.getString('이름');
                const user = interaction.user;
            }

            return interaction.reply({content: `플레이리스트 **${playlist.name}** 을(를) 생성했습니다.`}, {flags: MessageFlags.EPHEMERAL});
        },
    };