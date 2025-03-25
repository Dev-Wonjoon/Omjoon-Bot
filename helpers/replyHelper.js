const { MessageFlags } = require('discord.js');

module.exports.safeReply = async function(interaction, content, ephemeral = true) {

    if(interaction.deffred || interaction.replied) { // 이미 응답하였을 경우만 followUp 사용
        return interaction.followUp({ content, flags: ephemeral ? MessageFlags.Ephemeral : undefined});
    } else {
        return interaction.reply({ content, flags: ephemeral ? MessageFlags.Ephemeral : undefined});
    }

    
}