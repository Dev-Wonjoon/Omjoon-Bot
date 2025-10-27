import { Client, Events, MessageFlags } from 'discord.js';

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
            } else if(interaction.isAutocomplete()) {
                const command = client.commands.get(interaction.commandName);
                if(command && typeof command.autocomplete === 'function') {
                    await command.autocomplete(interaction);
                } else {
                    console.warn(`[Autocomplete Error] 자동완성 핸들러 없음: ${interaction.commandName}`);
                }
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
                await interaction.followUp({
                    content: '❌ 처리 중 오류가 발생했습니다. ❌',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    });
}