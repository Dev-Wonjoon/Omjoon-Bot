import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { useMainPlayer } from "discord-player";
import { playlistService } from "../service/playlistService.js";
import { selectMenuPrompt } from "../interactions/selectMenuPrompt.js";
import { createPlaylistModal } from "./playlistModal.js";
import { setDiscordId } from "../auth/discordId.js";

export class PlaylistCommandHandler {
    async handle(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case '생성':
                return this.create(interaction);
            case '보기':
                return this.viewList(interaction);
            case '삭제':
                return this.delete(interaction);
            case '노래추가':
                return this.addToMusic(interaction);
            case '재생':
                return this.play(interaction);
        }
    }

    private async create(interaction: ChatInputCommandInteraction) {
        const modal = createPlaylistModal();
        await interaction.showModal(modal);
    }

    private async viewList(interaction: ChatInputCommandInteraction) {
        const playlists = await playlistService.getAll();
        if(playlists.length === 0) {
            return interaction.reply({
                content: '생성된 플레이리스트가 없습니다.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const selected = await selectMenuPrompt(
            interaction,
            '플레이리스트를 선택해주세요',
            playlists.map(p => ({
                label: p.playlistName,
                description: p.description,
                value: p.id.toString(),
                raw: p,
            })),
            '플레이리스트 선택',
            'playlist_select'
        );

        if(!selected) return;

        const playlist = await playlistService.getOne(selected.id);

        const musicList = playlist.music ?? [];

        const embed = new EmbedBuilder()
            .setTitle(`${selected.playlistName}`)
            .setDescription(selected.description || '설명이 없습니다.')
            .setColor(0x5865F2)
            .addFields(
                musicList.length > 0
                    ? musicList.map((music, index) => ({
                        name: `${index + 1}. ${music.title}`,
                        value: '\u200B', // 빈 줄
                    }))
                    : [{
                        name: '노래 없음',
                        value: '이 플레이리스트에 등록된 노래가 없습니다.',
                    }]
                )
            .setFooter({ text: `총 ${musicList.length}곡` })
            .setTimestamp()


        await interaction.followUp({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }

    private async delete(interaction: ChatInputCommandInteraction) {
        const playlists = await playlistService.getAll();
        if(playlists.length === 0) {
            return interaction.reply({
                content: '❌ 삭제할 플레이리스트가 없습니다.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const selected = await selectMenuPrompt(
            interaction,
            '삭제할 플레이리스트를 선택해주세요.',
            playlists.map((p) => ({
                label: p.playlistName,
                description: p.description,
                value: p.id.toString(),
                raw: p,
            })),
            '삭제할 플레이리스트',
            'delete_playlist',
        );

        if(!selected) return;

        await playlistService.delete(selected.id);
        await interaction.followUp({
            content: `❌ **${selected.playlistName}** 플레이리스트를 삭제했습니다.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    private async addToMusic(interaction: ChatInputCommandInteraction) {
        const playlistName = interaction.options.getString('플리이름', true);
        const query = interaction.options.getString('노래제목', true);
        const playlists = await playlistService.getAll();

        const selectedPlaylist = playlists.find(p => p.playlistName === playlistName);

        if(!selectedPlaylist) {
            return interaction.reply({
                content: `이름이 **${playlistName}**인 플레이리스트를 찾을 수 없습니다.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const player = useMainPlayer();
        const result = await player.search(query, {
            requestedBy: interaction.user,
        });

        if(!result || result.tracks.length === 0) {
            return interaction.followUp({
                content: '검색 결과가 없습니다.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const selectedTrack = await selectMenuPrompt(
            interaction,
            '추가할 노래를 선택해주세요.',
            result.tracks.slice(0, 5).map((track, index) => ({
                label: track.title,
                description: track.author,
                value: index.toString(),
                raw: track,
            })),
            '노래 선택',
            'track_select_add'
        );

        if(!selectedTrack) return;

        await playlistService.addMusic({
            playlistId: selectedPlaylist.id,
            title: selectedTrack.title,
            url: selectedTrack.url
        });

        await interaction.followUp({
            content: `✅ **${selectedTrack.title}** 노래가 **${selectedPlaylist.playlistName}**에 추가되었습니다.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    private async play(interaction: ChatInputCommandInteraction) {
        setDiscordId(interaction.id);
        const playlists = await playlistService.getAll();
        if(playlists.length === 0) {
            return interaction.reply({
                content: '재생할 플레이리스트가 없습니다.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const selected = await selectMenuPrompt(
            interaction,
            '재생할 플레이리스트를 선택해주세요.',
            playlists.map((p) => ({
                label: p.playlistName,
                description: p.description,
                value: p.id.toString(),
                raw: p,
            })),
            '플레이리스트 재생 선택',
            'playlist_play_select',
        );
        console.log('선택된 플레이리스트:',selected);
        console.log('id:', selected?.id);

        if(!selected) return;

        const playlist = await playlistService.getOne(selected?.id);

        const member = interaction.member;
        if(!member || !('voice' in member) || !member.voice.channel) {
            return interaction.followUp({
                content: '먼저 음성 채널에 접속해주세요.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const player = useMainPlayer();
        const queue = player.nodes.create(interaction.guild!, {
            metadata: {
                channel: interaction.channel,
            },
            leaveOnEmpty: true,
            leaveOnEnd: true,
            leaveOnEmptyCooldown: 60000,
            leaveOnEndCooldown: 60000,
            selfDeaf: true,
        });

        if(!queue.connection) await queue.connect(member.voice.channel);

        const musicList = playlist.music ?? [];

        const tracksAdd = [];

        for(const music of musicList) {
            if(!music.url) continue;

            const result = await player.search(music.url, {
                requestedBy: interaction.user,
            });

            if(result.tracks.length > 0) {
                tracksAdd.push(result.tracks[0]);
            }
        }

        if(tracksAdd.length === 0) {
            return interaction.followUp({
                content: '플레이리스트에서 재생할 수 있는 곡이 없습니다.',
                flags: MessageFlags.Ephemeral,
            });
        }

        queue.addTrack(tracksAdd);

        if(!queue.isPlaying()) {
            await queue.node.play();
        }

        await interaction.followUp({
            content: `**${selected.playlistName}** 플레이리스트 재생을 시작합니다.`,
            flags: MessageFlags.Ephemeral,
        });
    }
}