import { useMainPlayer } from "discord-player";

const player = useMainPlayer();

player.events.on('error', (queue, error) => {
    console.error(`[PlayerError] ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.error(`[PlayerError] ${error.message}`);
});