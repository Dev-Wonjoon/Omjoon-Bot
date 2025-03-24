const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MessageFlags,  } = require('discord.js');
const { getAllPlaylist } = require('../../api/playlist/getAllPlaylist');
const { getByPlaylistId } = require('../../api/playlist/getByPlaylistId');
const { QueryType } = require('discord-player');

module.exports = async function(interaction) {
    const discordId = parseInt(interaction.user.id);
    const player = interaction.client.player;
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
        value: playlist.id.toString(),
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
        const selectedOption = options.find(opt => opt.value === selectedPlaylist);
        const selectedPlaylistName = selectedOption ? selectedOption.label : selectedPlaylist;
        await selectInteraction.update({content: `플레이리스트 **${selectedPlaylistName}** 를 선택했습니다.`, components: []});
        collector.stop();
        

        try {
            const playlist = await getByPlaylistId(discordId, selectedPlaylist);
            if(!playlist) {
                return interaction.followUp({ content: '해당 플레이리스트를 찾을 수 없습니다.', flags: MessageFlags.Ephemeral});
            }
            const musicList = playlist.musicList;
            if(!musicList || musicList.length == 0) {
                return interaction.followUp({ content: `**${selectedPlaylist}**에 노래가 없습니다.`, flags: MessageFlags.Ephemeral});
            }

            const queue = player.nodes.create(interaction.guild, {
                metadata: { channel: interaction.channel }});

            if(!interaction.member.voice.channel) {
                return interaction.followUp({ content: '음성 채널에 먼저 접속해주세요.', flags: MessageFlags.Ephemeral});
            }

            try {
                if (!queue.connection)  await queue.connect(interaction.member.voice.channel);
            } catch(error) {
                console.error(error);
                return interaction.followUp({ content: '음성 채널에 연결할 수 없습니다.', flags: MessageFlags.Ephemeral});
            }

            for(const music of musicList) {
                console.log("music 객체:", music);
                console.log("music의 키:", Object.keys(music));
                console.log("music.url:", music.url);  // 이 값이 undefined라면, 다른 프로퍼티명을 사용해야 함
                await queue.play(music.url, {
                    requestedBy: interaction.user,
                });
            }

            

            // if(!queue.playing) queue.play();
            
            interaction.followUp({ content: `플레이리스트 **${selectedPlaylistName}**의 노래들을 재생합니다` });
        } catch(error) {
            console.error("큐에 노래 추가 중 오류 발생: ", error);
            return interaction.followUp({ content: '큐에 노래를 추가하는 중 오류가 발생했습니다.', flags: MessageFlags.Ephemeral });
        }
    });

    collector.on('end', collected => {
        if(collected.size === 0) {
            interaction.editReply({content: '시간이 초과되었습니다.', components: []});
        }
    });
};