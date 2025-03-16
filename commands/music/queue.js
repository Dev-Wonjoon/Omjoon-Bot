const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('대기열')
    .setDescription('현재 재생 중인 노래 목록을 보여줍니다.');

async function execute(interaction) {
    const player = interaction.client.player;
    const queue = useQueue(interaction.guild.id);

    if(!queue || !queue.current) {
        return interaction.reply({ content: '현재 재생 중인 음악이 없습니다.'});
    }

    const randomColor = Math.floor(Math.random() * 0x1000000);
    const embed = new EmbedBuilder()
        .setTitle('현재 음악 대기열')
        .setDescription(`**${current.title}** - ${current.author}\n(${current.url})`)
        .setColor(randomColor);
    

    if(tracks.length > 0) {
        const queueList = tracks.slice(0, 10).map((track, index) => 
            `${index + 1}. **${track.title}** - ${track.author}`
          ).join('\n');
        embed.addFields({ name: '대기열', value: queueList });
    } else {
        embed.addFields({ name: '다음 대기열', value: '대기열에 추가된 노래가 없습니다.' });
    }

    await interaction.reply({ embeds: [embed] });

}

module.exports = { data, execute};


