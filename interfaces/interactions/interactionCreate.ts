import { Client, Events, MessageFlags } from 'discord.js';
import { ClientWithCommands } from '@type/discord';
import { MusicManager } from '@core/musicManager';

export function registerInteractionCreate(client: ClientWithCommands, musicManager: MusicManager) {
    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            const commands = (client as any).commands;
            musicManager.init();
            if(interaction.isChatInputCommand()) {
                const command = commands?.get(interaction.commandName);
                if(!command) {
                    console.warn(`[Command Error] 명령어를 찾을 수 없습니다: ${interaction.commandName}`);
                    return;
                }

                await command.execute(interaction, musicManager);
            } else if(interaction.isAutocomplete()) {
                const command = commands?.get(interaction.commandName);
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
