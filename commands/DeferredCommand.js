const AbstractCommand = require('./AbstractCommand');
const { MessageFlags } = require('discord.js');

class DeferredCommand extends AbstractCommand {
    async execute(interaction) {
        try {
            await interaction.deferReply({
                flags: this.ephemeral ? MessageFlags.Ephemeral : 0,
            });

            const resultMessage = await this.run(interaction);
            await interaction.followUp({
                content: resultMessage,
                flags: this.ephemeral ? MessageFlags.Ephemeral : 0,
            });
        } catch(error) {
            console.error('명령 실행 중 오류 발생: ', error);
            if(interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    content: this.getErrorMessage(),
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: this.getErrorMessage(),
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }

    async run(interaction) {
        throw new Error('run() 메서드를 반드시 구현해야 합니다.');
    }
}

module.exports = DeferredCommand;