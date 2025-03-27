import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    CacheType
} from 'discord.js';

import { playlistService } from '../../service/playlistService';
import { playlistRepository } from '../../repository/playlistRepository';

export const data = new SlashCommandBuilder()
    .setName('플리')
    .setDescription('플레이리스트 관련 명령어입니다.')
    .addSubcommand(sub => 
        sub.setName('생성')
            .setDescription('플레이리스트를 생성합니다.')
            .addStringOption(opt =>
                opt.setName('이름')
                    .setDescription('생성할 플레이리스트 이름을 넣어주세요.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('목록')
            .setDescription('내 플레이리스트 목록을 확인합니다.')
    );

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {

}