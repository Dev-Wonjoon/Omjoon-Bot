import { ModalSubmitInteraction } from "discord.js";
import createPlaylistModal from "./playlistModalHandler.js";
import { ModalHandler } from "../../types/ModalHandler.js";

export const modalHandler: Map<string, (i: ModalSubmitInteraction) => Promise<void>> = new Map();

const allHandlers: ModalHandler[] = [
    createPlaylistModal,
];

for (const h of allHandlers) {
    modalHandler.set(h.customId, h.handler);
}