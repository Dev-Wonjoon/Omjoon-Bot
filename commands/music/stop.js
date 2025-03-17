const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('정지')
  .setDescription('현재 재생 중인 노래를 정지합니다.');

async function execute(interaction) {
  const player = interaction.client.player;
  const queue = player.nodes.get(interaction.guild);
  
  if (!queue || !queue.currentTrack) {
    return interaction.reply({ content: '현재 재생 중인 노래가 없습니다.', flags: MessageFlags.Ephemeral });
  }
  
  // 현재 재생 중인 곡을 중지합니다.
  queue.node.stop();
  
  return interaction.reply({ content: '현재 노래를 정지했습니다.' });
}

module.exports = { data, execute };