import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('못참겠다')
    .setDescription('나 못참겠다!!!!!!!!')

export async function execute(interaction: ChatInputCommandInteraction) {

    await interaction.reply({ content: "못 참겠다!!!!!!!!!!!!!!!!!!!!!!!!!!" });
}