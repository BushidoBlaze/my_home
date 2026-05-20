import {type Chat} from "@/api/chats.api.ts";
import {getInitials} from "../lib/text.ts";

export function getMediaPreviewLabel(type?: string) {
    if (type === "image") return "Фото";
    if (type === "video") return "Видео";
    if (type === "voice") return "Голосовое";
    if (type === "file") return "Файл";
    return "Вложение";
}

export function getChatIcon(type: string) {
    const map: Record<string, string> = {
        House: "🏠",
        Entrance: "🚪",
        Direct: "👤",
        Request: "📋",
        Group: "👥",
    };
    return map[type] || "💬";
}

export function getChatFallback(chat: Chat | null | undefined) {
    if (!chat?.name) return getChatIcon(chat?.type ?? "");
    return getInitials(chat.name);
}