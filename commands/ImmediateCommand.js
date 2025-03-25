const AbstractCommand = require('./AbstractCommand');
const { MessageFlags } = require('discord.js');

class ImmediateCommand extends AbstractCommand {
    async execute(interaction) {
        try {
            const resultMessage = await this.run(interaction);
            await interaction.reply({
                content: resultMessage,
                flags: this.ephemeral ? MessageFlags.Ephemeral : 0,
            });
        } catch(error) {
            console.error('명령 실행 중 오류 발생: ', error);
            await interaction.reply({
                content: this.getErrorMessage(),
                flags: MessageFlags.Ephemeral,
            });
        }
    }

    async run(interaction) {
        
    }
}