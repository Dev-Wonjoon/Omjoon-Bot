const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

function buildPlaylistSelectMenu(playlists) {

    const options = playlists.map(pl => ({
        label: pl.name,
        value: pl.name,
    }));

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('playlist_select')
                .setPlaceholder('플레이리스트 선택')
                .addOptions(options)
        );
    
    return {
        content: '원하는 플레이리스트를 선택하세요',
        components: [row]
    };
}

module.exports = { buildPlaylistSelectMenu };