async function playTrack(interaction, voiceChannel, track) {
    const player = interaction.client.player;
    const queue = player.nodes.create(interaction.guild, {
      metadata: { channel: interaction.channel }
    });
    if (!queue.connection) await queue.connect(voiceChannel);
    
    queue.play(track);

    if (queue.events && typeof queue.events.once === 'function') {
      queue.events.once('empty', () => {
        console.log('Queue is empty. Scheduling auto-disconnect in 10 minutes...');
        setTimeout(() => {
          if (!queue.currentTrack && queue.tracks.length === 0) {
            console.log('No new tracks added. Disconnecting now.');
            queue.delete();
          }
        }, 300000);
      });
    }
  }
  
  module.exports = { playTrack };
  