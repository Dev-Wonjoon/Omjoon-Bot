const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('스킵')
    .setDescription('현재 재생 중인 노래를 스킵합니다.');

async function execute(interaction) {
    const player = interaction.client.player;
    const queue = player.nodes.get(interaction.guild);

    if(!queue || !queue.currentTrack) {
        return interaction.reply({ content: '현재 재생 중인 노래가 없습니다.', flags: MessageFlags.Ephemeral });
    }

    if (queue.tracks.length === 0) {
        return interaction.reply({ content: '대기열에 다음 노래가 없어 스킵할 수 없습니다.', flags: MessageFlags.Ephemeral });
    }
    
    const currentTrack = queue.currentTrack;
    queue.node.skip();
    
    return interaction.reply({ content: `**${currentTrack.title}** 을(를) 스킵했습니다.` });
}
    
module.exports = { data, execute };
