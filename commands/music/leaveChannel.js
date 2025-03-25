const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useQueue } = require('discord-player');
const ImmediateCommand = require('../../helpers/ImmediateCommand');

class LeaveCommand extends ImmediateCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('나가기')
            .setDescription('큐를 비우고 음성 채널에서 나갑니다.');
    }

    async run(interaction) {
        const queue = useQueue(interaction.guild);
        const connection = interaction.member.voice.channel;

        if(!connection) {
            return '현재 음성채널에 접속되어 있지 않습니다.';
        }

        await queue.delete();
        return '음성 채널에서 나갔습니다.';
    }

    getErrorMessage() {
        return '음성 채널에서 나가는 중 오류가 발생했습니다.';
    }
}

module.exports = new LeaveCommand();