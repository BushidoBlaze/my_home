import {chatsApi, type Chat, type ChatUserLookupItem} from "@/api/chats.api.ts";
import {useRef} from "react";
import type {Dispatch, SetStateAction} from "react";

import type {CreateChatMode} from "../model/types.ts";

type Params = {
    createChatMode: CreateChatMode;
    createName: string;
    createDescription: string;
    selectedUsers: ChatUserLookupItem[];
    setCreateChatMode: Dispatch<SetStateAction<CreateChatMode>>;
    setCreateChatOpen: Dispatch<SetStateAction<boolean>>;
    setCreateName: Dispatch<SetStateAction<string>>;
    setCreateDescription: Dispatch<SetStateAction<string>>;
    setUserQuery: Dispatch<SetStateAction<string>>;
    setUserResults: Dispatch<SetStateAction<ChatUserLookupItem[]>>;
    setSelectedUsers: Dispatch<SetStateAction<ChatUserLookupItem[]>>;
    setCreateLoading: Dispatch<SetStateAction<boolean>>;
    setChats: Dispatch<SetStateAction<Chat[]>>;
    setActiveChat: Dispatch<SetStateAction<Chat | null>>;
};

export function useCreateChatActions(params: Params) {
    const {
        createChatMode,
        createName,
        createDescription,
        selectedUsers,
        setCreateChatMode,
        setCreateChatOpen,
        setCreateName,
        setCreateDescription,
        setUserQuery,
        setUserResults,
        setSelectedUsers,
        setCreateLoading,
        setChats,
        setActiveChat,
    } = params;
    const createInFlightRef = useRef(false);

    function normalizeSelection(mode: CreateChatMode, users: ChatUserLookupItem[]): ChatUserLookupItem[] {
        if (mode === "direct") {
            return users.slice(0, 1);
        }
        return users;
    }

    function openCreateChat(mode: CreateChatMode) {
        setCreateChatMode(mode);
        setCreateChatOpen(true);
        setCreateName("");
        setCreateDescription("");
        setUserQuery("");
        setSelectedUsers(prev => normalizeSelection(mode, prev));
        void chatsApi.searchChatUsers("")
            .then(setUserResults)
            .catch((error) => {
                console.error(error);
                setUserResults([]);
            });
    }

    function switchCreateChatMode(mode: CreateChatMode) {
        setCreateChatMode(mode);
        setSelectedUsers(prev => normalizeSelection(mode, prev));
    }

    function toggleSelectUser(user: ChatUserLookupItem) {
        setSelectedUsers(prev => {
            if (createChatMode === "direct") {
                return prev.some(u => u.id === user.id) ? [] : [user];
            }

            return prev.some(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user];
        });
    }

    async function searchUsers(query: string) {
        setUserQuery(query);
        try {
            const data = await chatsApi.searchChatUsers(query);
            setUserResults(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function createChat() {
        if (createInFlightRef.current) return;
        if (createChatMode === "group" && !createName.trim()) return;
        if (selectedUsers.length === 0) return;

        try {
            createInFlightRef.current = true;
            setCreateLoading(true);
            let chatId = "";
            if (createChatMode === "group") {
                const created = await chatsApi.createGroupChat({
                    name: createName.trim(),
                    description: createDescription.trim() || undefined,
                    memberEmails: selectedUsers.map(x => x.email)
                });
                chatId = created.chatId;
            } else {
                const created = await chatsApi.createDirectChat(selectedUsers[0].id);
                chatId = created.chatId;
            }

            const updatedChats = await chatsApi.getMyChats();
            setChats(updatedChats);
            const target = updatedChats.find(c => c.id === chatId) ?? null;
            setActiveChat(target);
            setCreateChatOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setCreateLoading(false);
            createInFlightRef.current = false;
        }
    }

    return {
        openCreateChat,
        switchCreateChatMode,
        toggleSelectUser,
        searchUsers,
        createChat,
    };
}
