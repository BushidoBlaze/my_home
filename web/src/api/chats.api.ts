import {requestJson, uploadFileJson} from "@/api/httpClient.ts";

export interface Chat {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    membersCount: number;
    description?: string;
    avatarUrl?: string;
    inviteCode?: string;
    currentUserRole?: string;
    isMuted?: boolean;
    lastMessage?: {
        text: string;
        type: string;
        createdAt: string;
        senderId?: string;
        senderName: string;
    };
}

export interface ChatMemberItem {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    isMuted: boolean;
    joinedAt: string;
}

export interface ChatDetails {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    membersCount: number;
    description?: string;
    avatarUrl?: string;
    inviteCode?: string;
    currentUserRole?: string;
    isMuted?: boolean;
}

export interface ChatMessageItem {
    id: string;
    chatId?: string;
    text: string;
    type: string;
    fileUrl?: string;
    fileName?: string;
    latitude?: number;
    longitude?: number;
    isPinned: boolean;
    isRead?: boolean;
    createdAt: string;
    replyToId?: string;
    sender: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
    reactions: { emoji: string; count: number }[];
}

export interface ChatUserLookupItem {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
}

export const chatsApi = {
    getMyChats: () =>
        requestJson<Chat[]>("/chats"),

    getChatDetails: (chatId: string) =>
        requestJson<ChatDetails>(`/chats/${chatId}`),

    getChatMembers: (chatId: string) =>
        requestJson<ChatMemberItem[]>(`/chats/${chatId}/members`),

    updateChat: (chatId: string, data: { name?: string; description?: string }) =>
        requestJson<ChatDetails>(`/chats/${chatId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    generateInviteLink: (chatId: string) =>
        requestJson<{ inviteCode: string; inviteUrl: string }>(`/chats/${chatId}/invite-link`, {
            method: "POST",
        }),

    joinChatByInviteCode: (code: string) =>
        requestJson<{ chatId: string }>(`/chats/join/${encodeURIComponent(code)}`, {
            method: "POST",
        }),

    addChatMemberByEmail: (chatId: string, email: string) =>
        requestJson<{ ok: boolean; exists?: boolean }>(`/chats/${chatId}/members`, {
            method: "POST",
            body: JSON.stringify({email}),
        }),

    setChatMemberRole: (chatId: string, userId: string, role: string) =>
        requestJson<{ ok: boolean }>(`/chats/${chatId}/members/${userId}/role`, {
            method: "PUT",
            body: JSON.stringify({role}),
        }),

    removeChatMember: (chatId: string, userId: string) =>
        requestJson<{ ok: boolean }>(`/chats/${chatId}/members/${userId}`, {
            method: "DELETE",
        }),

    setChatMuted: (chatId: string, isMuted: boolean) =>
        requestJson<{ ok: boolean; isMuted: boolean }>(`/chats/${chatId}/mute`, {
            method: "PUT",
            body: JSON.stringify({isMuted}),
        }),

    leaveChat: (chatId: string) =>
        requestJson<{ ok: boolean }>(`/chats/${chatId}/leave`, {
            method: "POST",
        }),

    getChatMessages: (chatId: string, page = 1) =>
        requestJson<ChatMessageItem[]>(`/chats/${chatId}/messages?page=${page}`),

    searchChatMessages: (chatId: string, query: string, take = 50) =>
        requestJson<ChatMessageItem[]>(
            `/chats/${chatId}/messages/search?query=${encodeURIComponent(query)}&take=${take}`
        ),

    getPinnedMessages: (chatId: string) =>
        requestJson<ChatMessageItem[]>(`/chats/${chatId}/pinned`),

    markChatRead: (chatId: string, messageId?: string) =>
        requestJson<{ ok: boolean; readAt: string }>(`/chats/${chatId}/read`, {
            method: "POST",
            body: JSON.stringify(messageId ? {messageId} : {}),
        }),

    initChats: () =>
        requestJson<{ houseChatId: string; entranceChatId: string }>("/chats/init", {
            method: "POST",
        }),

    uploadChatFile: (chatId: string, file: File) =>
        uploadFileJson<{ url: string; fileName: string; type: string }>(`/chats/${chatId}/file`, file),

    uploadGroupAvatar: (chatId: string, file: File) =>
        uploadFileJson<{ url: string }>(`/chats/${chatId}/avatar`, file),

    createGroupChat: (data: { name: string; description?: string; memberEmails?: string[] }) =>
        requestJson<{ chatId: string }>("/chats/group", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    createDirectChat: (targetUserId: string) =>
        requestJson<{ chatId: string }>(`/chats/direct/${targetUserId}`, {
            method: "POST",
        }),

    searchChatUsers: (query = "") =>
        requestJson<ChatUserLookupItem[]>(`/chats/users?query=${encodeURIComponent(query)}`),
};