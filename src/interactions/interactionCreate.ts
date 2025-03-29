import { Client, Events, MessageFlags } from 'discord.js';
import { modalHandler } from './modals/modalIndex';

export function registerInteractionCreate(client: Client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            if(interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if(!command) {
                    console.warn(`[Command Error] 명령어를 찾을 수 없습니다: ${interaction.commandName}`);
                    return;
                }

                await command.execute(interaction);
            } else if(interaction.isModalSubmit()) {
                const handler = modalHandler.get(interaction.customId);
                if(!handler) {
                    console.warn(`[Modal Error] 모달 핸들러를 찾을 수 없습니다: ${interaction.customId}`)
                    return;
                }
                await handler(interaction);
            }
        } catch(error) {
            console.error(`Interaction 처리 중 오류: `, error);

            if(
                interaction.isChatInputCommand() ||
                interaction.isModalSubmit() ||
                interaction.isMessageComponent() &&
                !interaction.replied &&
                !interaction.deferred
            ) {
                await interaction.reply({
                    content: '❌ 처리 중 오류가 발생했습니다. ❌',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    });
}