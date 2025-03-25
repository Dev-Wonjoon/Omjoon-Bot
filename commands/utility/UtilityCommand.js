const { SlashCommandBuilder } = require('discord.js');

class UtiliyCommand {
    constructor({ name, description, replyMessage}) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
        this.replyMessage = replyMessage;
    }

    async execute(interaction) {
        await interaction.reply(this.replyMessage);
    }
}

module.exports = UtiliyCommand;