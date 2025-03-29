import { ModalSubmitInteraction } from "discord.js";

export interface ModalHandler {
    customId: string,
    handler: (interaction: ModalSubmitInteraction) => Promise<void>;
}