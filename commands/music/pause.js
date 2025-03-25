const { SlashCommandBuilder } = require('discord.js');
const { useQueue, useTimeline } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('일시정지')
    .setDescription('노래를 일시정지 합니다.');

async function execute(interaction) {
    const timeline = useTimeline({node: interaction.guild,});

    if(!timeline) {
        return interaction.reply('이 서버에는 활성 플레이어 세션이 없습니다.');
    }

    const wasPaused = timeline.paused;
    wasPaused ? timeline.resume() : timeline.pause();

    return interaction.reply(`현재 노래를 ${wasPaused ? '시작' : '일시정지'} 했습니다.`);
    
}

module.exports = { data, execute };