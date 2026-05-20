import {type Chat} from "@/api/chats.api.ts";
import {useMemo} from "react";



import type {ChatMessageUi} from "../model/types.ts";

type Params = {
    chats: Chat[];
    messages: ChatMessageUi[];
    search: string;
};

export function useChatDerived({chats, messages, search}: Params) {
    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages]);

    const visibleChats = useMemo(() => chats.filter(chat => chat.type !== "Request"), [chats]);

    const filteredMessages = useMemo(() => {
        if (!search) return sortedMessages;
        return sortedMessages.filter(m => (m.text ?? "").toLowerCase().includes(search.toLowerCase()));
    }, [search, sortedMessages]);

    return {
        sortedMessages,
        visibleChats,
        filteredMessages,
    };
}
