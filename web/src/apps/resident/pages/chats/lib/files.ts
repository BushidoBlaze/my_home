export function isMediaFile(name?: string, url?: string) {
    const target = `${name ?? ""} ${url ?? ""}`.toLowerCase();
    return /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|mkv|mp3|wav|ogg|m4a)$/.test(target);
}

export function isVideoFile(name?: string, url?: string) {
    const target = `${name ?? ""} ${url ?? ""}`.toLowerCase();
    return /\.(mp4|webm|mov|mkv)$/.test(target);
}

export function isAudioFile(name?: string, url?: string) {
    const target = `${name ?? ""} ${url ?? ""}`.toLowerCase();
    return /\.(mp3|wav|ogg|m4a)$/.test(target);
}