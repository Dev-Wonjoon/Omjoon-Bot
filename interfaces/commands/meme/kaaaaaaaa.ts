import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('크아악')
    .setDescription('크아아아아아아아아아아악')

export async function execute(interaction: ChatInputCommandInteraction) {
    
    await interaction.reply({content: "크아아아아아아아아아아아아아아악!!!!!!"});
}