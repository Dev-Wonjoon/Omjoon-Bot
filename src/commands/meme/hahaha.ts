import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('으하하')
    .setDescription('으하하하하하하하하하하하하하')

export async function execute(interaction: ChatInputCommandInteraction) {
    
    await interaction.reply({content: '으하하하하하하하하하하하하하하하'});
}