import { ActionRowBuilder, ChatInputCommandInteraction, MessageFlags, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { useMainPlayer } from "discord-player";
import { playlistService } from "../service/playlistService.js";
import { selectMenuPrompt } from "../interactions/selectMenuPrompt.js";
import { createPlaylistModal } from "./playlistModal.js";

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
            case '추가':
                return this.addToMusic(interaction);
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
            playlists.map((p) => ({
                label: p.playlistName,
                description: p.description,
                value: p.id.toString(),
                raw: p,
            })),
            '플레이리스트 선택',
            'playlist_select'
        );

        if(!selected) return;

        const musicText = selected.music.length > 0
            ? selected.music.map((music, index) => `${index+1}. ${music.title}`).join('\n')
            : '등록된 노래가 없습니다.';

        await interaction.followUp({
            content: `🎵 **${selected.playlistName}** 노래 목록\n\n${musicText}`,
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
        const playlists = await playlistService.getAll();
        if(playlists.length === 0) {
            return interaction.reply({
                content: '추가할 플레이리스트가 없습니다.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const selectedPlaylist = await selectMenuPrompt(
            interaction,
            '노래를 추가할 플레이리스트를 선택해주세요.',
            playlists.map(p => ({
                label: p.playlistName,
                description: p.description,
                value: p.id.toString(),
                raw: p
            })),
            '플레이리스트 선택',
            'playlist_select_add'
        );

        if(!selectedPlaylist) return;

        await interaction.followUp({ content: '추가할 노래 제목 또는 URL을 입력해주세요', flags: MessageFlags.Ephemeral });

        const filter = (m: any) => m.author.id === interaction.user.id;
        const colleted = await interaction.channel?.awaitMessageComponent({ filter, time: 30000 });

        if(!colleted) {
            await interaction.followUp({ content: '시간이 초과되었습니다.', flags: MessageFlags.Ephemeral });
            return;
        }

        const query = 'content' in colleted ? String(colleted.content) : '';
        const player = useMainPlayer();
        const result = await player.search(query, { requestedBy: interaction.user });

        if(!result || result.tracks.length === 0) {
            await interaction.followUp({ content: '검색결과가 없습니다.' });
            return;
        }

        const selectedTrack = await selectMenuPrompt(
            interaction,
            '추가할 노래를 선택해주세요.',
            result.tracks.slice(0, 5).map((track, index) => ({
                label: track.title,
                description: track.author,
                value: index.toString(),
                raw: track
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

        await interaction.followUp({ content: `**${selectedTrack.title}** 노래가 **${selectedPlaylist.playlistName}**에 추가되었습니다.`, flags: MessageFlags.Ephemeral});
    }
}