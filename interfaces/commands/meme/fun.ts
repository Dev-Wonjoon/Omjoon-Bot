import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('재밌지않습니까')
    .setDescription('재밌지 않습니까!!!')

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: '재밌지 않습니까!!!!!!!!!!!!!!!!!!' });
}