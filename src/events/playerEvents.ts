import { useMainPlayer } from "discord-player";

const player = useMainPlayer();

player.events.on('error', (queue, error) => {
    console.error(`[PlayerError] ${error.message}`);
});

player.events.on('connectionError', (queue, error) => {
    console.error(`[VoiceConnectionError] ${error.message}`);
});