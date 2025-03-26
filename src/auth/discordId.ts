let discordId: string | null = null;

export function setDiscordId(id: string) {
    discordId = id;
}

export function getDiscordId(): string | null {
    return discordId;
}