import { ModalSubmitInteraction, MessageFlags } from "discord.js";
import { playlistService } from "../../service/playlistService.js";
import { ModalHandler } from "../../types/ModalHandler.js";

const createPlaylistModal: ModalHandler = {
    customId: 'create_playlist_modal',

    async handler(interaction) {
        const name = interaction.fields.getTextInputValue('playlist_name');
        const description = interaction.fields.getTextInputValue('playlist_description');

        try {
            await playlistService.create(name, description);
            await interaction.reply({
                content: `✅ **${name}** 플레이리스트가 생성되었습니다.`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error: any) {
            console.error('플레이리스트 생성 중 오류 발생: ', error);
            await interaction.reply({
                content: '❌ 플레이리스트 생성에 실패했습니다. ❌',
                flags: MessageFlags.Ephemeral
            });
        }
    },
}

export default createPlaylistModal;