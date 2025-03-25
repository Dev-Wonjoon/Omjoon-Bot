const { MessageFlags } = require('discord.js');

class AbstractCommand{
    constractor(ephemeral = true) {
        this.ephemeral = ephemeral;
    }

    async execute(interaction) {
        throw new Error('execute()는 반드시 구현해야 합니다.');
    }

    getErrorMessage() {
        return '명령어 실행 중 오류가 발생했습니다.';
    }
}

module.exports = AbstractCommand;