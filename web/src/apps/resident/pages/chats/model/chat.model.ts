import {type Chat} from "@/api/chats.api.ts";


export type ChatHeaderModel = {
    id: string;
    name: string;
    type: Chat["type"];
    avatarUrl?: string;
    membersCount: number;
};

export function toChatHeaderModel(chat: Chat): ChatHeaderModel {
    return {
        id: chat.id,
        name: chat.name,
        type: chat.type,
        avatarUrl: chat.avatarUrl,
        membersCount: chat.membersCount,
    };
}