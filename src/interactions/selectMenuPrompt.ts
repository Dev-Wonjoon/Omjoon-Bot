import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ComponentType,
    ChatInputCommandInteraction,
    MessageFlags
} from 'discord.js';
import type { Track } from 'discord-player';

interface SelectOption<T> {
    label: String,
    description?: string;
    value: string;
    raw: T;
}

export async function selectMenuPrompt<T>(
    interaction: ChatInputCommandInteraction,
    prompt: string,
    options: SelectOption<T>[]
): Promise<T | null> {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_track')
        .setPlaceholder('선택해주세요')
        .addOptions(
            options.map(opt => ({
                label: opt.label.slice(0, 100),
                description: opt.description?.slice(0, 100),
                value: opt.value,
            }))
        );
    
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.followUp({
        content: prompt,
        components: [row],
        flags: MessageFlags.Ephemeral
    });

    try {
        const message = await interaction.fetchReply();

        const selectInteraction = await message.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: 30_000,
        }) as StringSelectMenuInteraction;

        const selected = options.find(opt => opt.value === selectInteraction.values[0]);
        await selectInteraction.update({
            content: `선택됨 **${selected?.label ?? '알 수 없음'}**`,
            components: [],
        });

        return selected?.raw ?? null;
    } catch {
        await interaction.followUp({
            content: '시간이 초과 되었습니다.',
            flags: MessageFlags.Ephemeral
        });

        return null;
    }
    
}