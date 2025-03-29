import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { setDiscordId } from "../../auth/discordId.js";
import { PlaylistCommandHandler } from "../../feature/playlistHandler.js";


export const data = new SlashCommandBuilder()
    .setName('플리')
    .setDescription('플레이리스트 관련 명령어입니다.')
    .addSubcommand(subcommand => 
        subcommand
            .setName('생성')
            .setDescription('새로운 플레이리스트를 생성합니다.')
            .addStringOption(option =>
                option
                    .setName('이름')
                    .setDescription('생성할 플레이리스트 이름을 입력해주세요.')
            ))
    .addSubcommand(subcommand => 
        subcommand
            .setName('보기')
            .setDescription('플레이리스트 목록을 확인합니다.')
    )
    .addSubcommand(subcommand => 
        subcommand
            .setName('삭제')
            .setDescription('선택한 플레이리스트를 삭제합니다.')
    )
    .addSubcommand(subcommand => 
        subcommand
            .setName('추가')
            .setDescription('해당 플레이리스트에 노래를 추가합니다.')
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    setDiscordId(interaction.user.id);

    const handler = new PlaylistCommandHandler();
    await handler.handle(interaction);
}