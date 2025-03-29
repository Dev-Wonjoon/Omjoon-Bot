import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";

export function createPlaylistModal() {
    const nameInput = new TextInputBuilder()
        .setCustomId('playlist_name')
        .setLabel('플레이리스트 이름')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const description = new TextInputBuilder()
        .setCustomId('playlist_description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const modal = new ModalBuilder()
        .setCustomId('create_playlist_modal')
        .setTitle('플레이리스트를 새로 추가합니다.')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(description)
        );
    
    return modal;
}