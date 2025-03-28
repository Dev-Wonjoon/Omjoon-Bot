import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('으아아')
    .setDescription('으아아아아아아아아아아아아!!!!')

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: "으아아아아아아아아아아아아아아아아아!!!!!!!!!" });
}