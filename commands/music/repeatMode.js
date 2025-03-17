const { SlashCommandBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('재생모드')
    .setDescription('현재 큐를 반복 재생하거나 해제합니다.')
    .addNumberOption((option) =>
        option
            .setName('모드')
            .setDescription('모드를 설정해주세요')
            .setRequired(true)
            .addChoices(
            {
                name: 'off',
                value: QueueRepeatMode.OFF,                
            }, {
                name: '현재반복',
                value: QueueRepeatMode.TRACK,
            }, {
                name: '전체반복',
                value: QueueRepeatMode.QUEUE,
            }, {
                name: '자동선택',
                value: QueueRepeatMode.AUTOPLAY,
            },
        ),
    );

async function execute(interaction) {
    const queue = useQueue(interaction.guild);
    
    if(!queue) {
        return interaction.reply('현재 재생되고 있는 노래가 없습니다.');
    }
    const loopMode = interaction.options.getNumber('모드');

    const modeMapping = {
        [QueueRepeatMode.OFF]: 'OFF',
        [QueueRepeatMode.TRACK]: '현재반복',
        [QueueRepeatMode.QUEUE]: '전체반복',
        [QueueRepeatMode.AUTOPLAY]: '자동선택',
    };

    queue.setRepeatMode(loopMode);

    return interaction.reply(`현재 큐가 ${modeMapping[loopMode]}로 설정 되었습니다.`);
}

module.exports = { data, execute };