const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MessageFlags,  } = require('discord.js');
const { getAllPlaylist } = require('../api/playlist/getAllPlaylist');

module.exports = async function(interaction) {
    const discordId = parseInt(interaction.user.id);
    let playlists;

    try{
        playlists = await getAllPlaylist(discordId);
        if(!playlists || playlists.length === 0) {
            return interaction.reply({content: '생성된 플레이리스트가 없습니다.', flag: MessageFlags.EPHEMERAL});
        }
    } catch(error) {
        console.error('백엔드 API 호출 중 오류가 발생했습니다.', error);
        return interaction.reply({content: '플레이리스트 목록을 불러오는 중 오류가 발생했습니다.', flag: MessageFlags.EPHEMERAL});
    }

    const options = playlists.map((playlist, index) => ({
        label: playlist.playlistName,
        description: `플레이리스트 ${index + 1}`,
        value: playlist.playlistName.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_playlist')
        .setPlaceholder('플레이리스트를 선택하세요.')
        .addOptions(options);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({content: '플레이리스트를 선택하세요.', components: [actionRow], flag: MessageFlags.EPHEMERAL});

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.SELECT_MENU, time: 60000 });

    collector.on('collect', async selectInteraction => {
        if(selectInteraction.user.id !== interaction.user.id) {
            return selectInteraction.reply({content: '이 명령을 실행한 사용자가 아닙니다.', ephemeral: true});
        }
        const selectedPlaylist = selectInteraction.values[0];
        await selectInteraction.update({content: `플레이리스트 **${selectedPlaylist}** 를 선택했습니다.`, components: []});
        collector.stop();
    });

    collector.on('end', collected => {
        if(collected.size === 0) {
            interaction.editReply({content: '시간이 초과되었습니다.', components: []});
        }
    });
};