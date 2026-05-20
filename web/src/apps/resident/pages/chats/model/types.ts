import {type ChatMessageItem} from "@/api/chats.api.ts";

export type PresenceMap = Record<string, { isOnline: boolean; lastSeen?: string }>;

export type ChatMessageUi = ChatMessageItem & {
    localId?: string;
    fileUrl?: string;
    fileName?: string;
};

export type MediaDraft = {
    file: File;
    mode: "voice" | "video";
    previewUrl: string;
};

export type CreateChatMode = "group" | "direct";