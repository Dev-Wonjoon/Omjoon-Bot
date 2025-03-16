const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

async function sendSelectionMenu(interaction, tracks) {
    const options = tracks.map((track, index) => ({
        label: track.title.length > 100 ? track.title.substring(0, 97) + '...' : track.title,
        descrpition: track.author ? (track.author.length > 100 ? track.author.substring(0, 97) + '...' : track.author) : '',
        value: index.toString()
    }));
    
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('selectTrack')
        .setPlaceholder('노래를 선택해주세요')
        .addOptions(options)
    );

    const selectionMessage = await interaction.followUp({
        content: '검색 결과에서 재생할 노래를 선택하세요: ',
        components: [row],
        ephemral: false
    });

    try {
        const filter = i => i.user.id === interaction.user.id;
        const menuInteraction = await selectionMessage.awaitMessageComponent({ 
            filter,
            components: ComponentType.StringSelect,
            time: 30000
        });
        
        const selectedIndex = parseInt(menuInteraction.values[0]);

        await menuInteraction.update({ content: `선택됨: **${tracks[selectedIndex].title}**`, components: [] });
        return tracks[selectedIndex];
    } catch (error) {
        console.error("Selection menu error: ", error);
        return null;
    }


}

module.exports = { sendSelectionMenu };