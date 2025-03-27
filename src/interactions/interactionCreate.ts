import { Client, Events } from 'discord.js';

export function registerInteractionCreate(client: Client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if(!interaction.isChatInputCommand()) return;
        
        const command = client.commands.get(interaction.commandName);
        if(!command) {
            console.warn(`명령어 ${interaction.commandName}를 찾을 수 없습니다.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ 명령어 실행 중 오류:`, error);
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({
                content: '❌ 명령어 실행 중 오류가 발생했습니다.',
                ephemeral: true,
                });
            }
        }
    });
}